import { useState, useMemo } from 'react';
import { useMasterStore } from '../../stores/masterStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { 
    Calendar, 
    FileSpreadsheet, 
    Printer, 
    ArrowDownLeft, 
    ArrowUpRight, 
    Layers, 
    TrendingUp, 
    TrendingDown,
    Activity,
    Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Modal from '../common/Modal';

interface KartuStokModalProps {
    isOpen: boolean;
    onClose: () => void;
    obatId: string;
    jaringanId: string | null; // null means Gudang Pusat
}

const KartuStokModal = ({ isOpen, onClose, obatId, jaringanId }: KartuStokModalProps) => {
    const { obat: allObat, jaringan: allJaringan, penyedia: allPenyedia } = useMasterStore();
    const { penerimaan, distribusi, posTransactions } = useTransactionStore();

    // Date defaults
    const todayStr = new Date().toISOString().split('T')[0];
    const startOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(startOfMonthStr);
    const [endDate, setEndDate] = useState(todayStr);

    const selectedObat = allObat.find(o => o.id === obatId);
    const selectedJaringan = allJaringan.find(j => j.id === jaringanId);
    const unitName = selectedJaringan ? selectedJaringan.nama : 'Gudang Pusat';

    // Quick Date Presets
    const setPreset = (type: 'TODAY' | 'LAST_7' | 'THIS_MONTH' | 'ALL_TIME') => {
        const today = new Date();
        if (type === 'TODAY') {
            const t = today.toISOString().split('T')[0];
            setStartDate(t);
            setEndDate(t);
        } else if (type === 'LAST_7') {
            const priorDate = new Date(new Date().setDate(today.getDate() - 7)).toISOString().split('T')[0];
            setStartDate(priorDate);
            setEndDate(todayStr);
        } else if (type === 'THIS_MONTH') {
            setStartDate(startOfMonthStr);
            setEndDate(todayStr);
        } else if (type === 'ALL_TIME') {
            setStartDate('');
            setEndDate('');
        }
    };

    // Calculate all mutations for this drug chronologically
    const allMutations = useMemo(() => {
        if (!selectedObat) return [];

        const list: any[] = [];

        if (!jaringanId) {
            // --- GUDANG PUSAT CONTEXT ---
            // Inflow: penerimaan
            penerimaan
                .filter(p => p.obatId === obatId)
                .forEach(p => {
                    const prov = allPenyedia.find(s => s.id === p.penyediaId);
                    list.push({
                        id: p.id,
                        tanggal: p.tanggalMasuk,
                        createdAt: p.createdAt,
                        tipe: 'MASUK',
                        jumlah: Number(p.jumlah),
                        keterangan: `Penerimaan dari Supplier: ${prov?.nama || 'Tidak Dikenal'}`,
                        referensi: p.nomorFaktur || '-',
                    });
                });

            // Outflow: distribusi
            distribusi
                .filter(d => d.obatId === obatId)
                .forEach(d => {
                    const destUnit = allJaringan.find(j => j.id === d.tujuanJaringanId);
                    list.push({
                        id: d.id,
                        tanggal: d.tanggalDistribusi,
                        createdAt: d.createdAt,
                        tipe: 'KELUAR',
                        jumlah: Number(d.jumlah),
                        keterangan: `Distribusi ke Unit: ${destUnit?.nama || 'Tidak Dikenal'}`,
                        referensi: d.nomorPermintaan || '-',
                    });
                });
        } else {
            // --- NETWORK UNIT CONTEXT ---
            // Inflow: distribusi
            distribusi
                .filter(d => d.tujuanJaringanId === jaringanId && d.obatId === obatId)
                .forEach(d => {
                    list.push({
                        id: d.id,
                        tanggal: d.tanggalDistribusi,
                        createdAt: d.createdAt,
                        tipe: 'MASUK',
                        jumlah: Number(d.jumlah),
                        keterangan: 'Distribusi Masuk dari Gudang Pusat',
                        referensi: d.nomorPermintaan || '-',
                    });
                });

            // Outflow: pos transactions
            posTransactions
                .filter(pt => pt.jaringanId === jaringanId)
                .forEach(pt => {
                    const item = pt.items.find(i => i.obatId === obatId);
                    if (item) {
                        list.push({
                            id: `${pt.id}-${item.obatId}`,
                            tanggal: pt.tanggalTransaksi,
                            createdAt: pt.createdAt,
                            tipe: 'KELUAR',
                            jumlah: Number(item.jumlah),
                            keterangan: `Penjualan Kasir (Pasien: ${pt.namaPasien}${pt.noRM ? `, RM: ${pt.noRM}` : ''})`,
                            referensi: pt.id.slice(0, 8).toUpperCase(),
                        });
                    }
                });
        }

        // Sort: date ascending, then createdAt ascending (for exact ledger tie-breaking)
        list.sort((a, b) => {
            const dateDiff = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
            if (dateDiff !== 0) return dateDiff;
            return a.createdAt.localeCompare(b.createdAt);
        });

        // Compute running balance
        let balance = 0;
        return list.map(m => {
            if (m.tipe === 'MASUK') {
                balance += m.jumlah;
            } else {
                balance -= m.jumlah;
            }
            return {
                ...m,
                sisaStok: balance
            };
        });
    }, [obatId, jaringanId, penerimaan, distribusi, posTransactions, allPenyedia, allJaringan, selectedObat]);

    // Apply date range filters and compile metrics
    const stockReport = useMemo(() => {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).getTime() : Infinity;

        // Calculate opening stock (Stok Awal) before the filter range
        const priorMutations = allMutations.filter(m => {
            const t = new Date(m.tanggal).getTime();
            return t < start;
        });
        const stokAwal = priorMutations.length > 0 ? priorMutations[priorMutations.length - 1].sisaStok : 0;

        // Mutations inside the filter range
        const filteredList = allMutations.filter(m => {
            const t = new Date(m.tanggal).getTime();
            return t >= start && t <= end;
        });

        // Recalculate running balance for in-range mutations starting from stokAwal
        let currentBalance = stokAwal;
        let totalMasuk = 0;
        let totalKeluar = 0;

        const mutationsWithLedgerBalance = filteredList.map(m => {
            if (m.tipe === 'MASUK') {
                currentBalance += m.jumlah;
                totalMasuk += m.jumlah;
            } else {
                currentBalance -= m.jumlah;
                totalKeluar += m.jumlah;
            }
            return {
                ...m,
                sisaStok: currentBalance
            };
        });

        return {
            stokAwal,
            mutations: mutationsWithLedgerBalance,
            totalMasuk,
            totalKeluar,
            stokAkhir: currentBalance
        };
    }, [allMutations, startDate, endDate]);

    // Excel Export
    const handleExport = () => {
        if (!selectedObat) return;

        const dateRangeStr = startDate && endDate 
            ? `${startDate} s/d ${endDate}` 
            : 'Semua Waktu';

        // Prepare data rows
        const sheetData = [
            ['KARTU STOK OBAT (MUTASI)'],
            ['Sistem Informasi Pelayanan Obat Terintegrasi (SIPOT)'],
            [],
            ['Unit/Konteks:', unitName],
            ['Nama Obat:', selectedObat.nama],
            ['Kode ATC:', selectedObat.kodeATC],
            ['Satuan:', selectedObat.satuan],
            ['Periode:', dateRangeStr],
            [],
            ['No', 'Tanggal', 'No. Referensi', 'Keterangan', 'Masuk', 'Keluar', 'Sisa Stok'],
            ['-', '-', '-', 'STOK AWAL (SALDO SEBELUM PERIODE)', '-', '-', stockReport.stokAwal]
        ];

        stockReport.mutations.forEach((m, i) => {
            sheetData.push([
                String(i + 1),
                m.tanggal,
                m.referensi,
                m.keterangan,
                m.tipe === 'MASUK' ? m.jumlah : 0,
                m.tipe === 'KELUAR' ? m.jumlah : 0,
                m.sisaStok
            ]);
        });

        sheetData.push([]);
        sheetData.push(['', '', '', 'TOTAL MUTASI', stockReport.totalMasuk, stockReport.totalKeluar, '']);
        sheetData.push(['', '', '', 'STOK AKHIR PERIODE', '', '', stockReport.stokAkhir]);

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

        // Styling widths
        const colWidths = [
            { wch: 6 },  // No
            { wch: 12 }, // Tanggal
            { wch: 15 }, // Referensi
            { wch: 45 }, // Keterangan
            { wch: 10 }, // Masuk
            { wch: 10 }, // Keluar
            { wch: 12 }  // Sisa Stok
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Kartu Stok');

        const fileName = `Kartu_Stok_${selectedObat.nama.replace(/\s+/g, '_')}_${unitName.replace(/\s+/g, '_')}_${todayStr}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!selectedObat) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Kartu Stok: ${selectedObat.nama}`} 
            maxWidth="5xl"
        >
            <div className="print-container space-y-6 font-sans">
                {/* Print CSS Injector */}
                <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-container, .print-container * {
                            visibility: visible;
                        }
                        .print-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 20px;
                            background: white;
                        }
                        .no-print {
                            display: none !important;
                        }
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        th, td {
                            border: 1px solid #cbd5e1 !important;
                            padding: 8px !important;
                            font-size: 11px !important;
                        }
                        .badge {
                            border: none !important;
                            background: transparent !important;
                            padding: 0 !important;
                            font-weight: bold !important;
                        }
                    }
                `}} />

                {/* Print Title Block (Only shown in print) */}
                <div className="hidden print:block border-b-2 border-slate-300 pb-4 mb-4">
                    <h1 className="text-2xl font-black text-slate-800 text-center tracking-tight">KARTU STOK OBAT</h1>
                    <p className="text-xs text-slate-500 text-center uppercase font-semibold tracking-wider">SIPOT (Sistem Informasi Pelayanan Obat Terintegrasi)</p>
                    <div className="grid grid-cols-2 mt-4 text-xs font-medium text-slate-700">
                        <div>
                            <p><span className="font-bold">Unit / Jaringan:</span> {unitName}</p>
                            <p><span className="font-bold">Nama Obat:</span> {selectedObat.nama}</p>
                            <p><span className="font-bold">Kode ATC:</span> {selectedObat.kodeATC}</p>
                        </div>
                        <div className="text-right">
                            <p><span className="font-bold">Satuan:</span> {selectedObat.satuan}</p>
                            <p><span className="font-bold">Periode Laporan:</span> {startDate && endDate ? `${startDate} s/d ${endDate}` : 'Semua Waktu'}</p>
                            <p><span className="font-bold">Tanggal Cetak:</span> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Info Header Widget (Screen) */}
                <div className="no-print bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">{selectedObat.kodeATC}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">Satuan: {selectedObat.satuan}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{selectedObat.nama}</h3>
                        <p className="text-xs font-medium text-slate-500">Unit Konteks: <span className="font-bold text-slate-700">{unitName}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-100"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Export Excel</span>
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-100"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak</span>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="no-print bg-white border border-slate-150 p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>Filter Periode Mutasi</span>
                        </span>
                        
                        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => setPreset('TODAY')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all">Hari Ini</button>
                            <button onClick={() => setPreset('LAST_7')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all">7 Hari Terakhir</button>
                            <button onClick={() => setPreset('THIS_MONTH')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all">Bulan Ini</button>
                            <button onClick={() => setPreset('ALL_TIME')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all">Semua Waktu</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Mulai</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Selesai</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stok Awal</p>
                            <p className="text-2xl font-black text-slate-700 mt-1">{stockReport.stokAwal}</p>
                        </div>
                        <div className="p-2.5 bg-slate-100 text-slate-500 rounded-lg">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50/30 border border-emerald-100/50 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Masuk (+)</p>
                            <p className="text-2xl font-black text-emerald-600 mt-1">{stockReport.totalMasuk}</p>
                        </div>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-rose-50/30 border border-rose-100/50 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Total Keluar (-)</p>
                            <p className="text-2xl font-black text-rose-600 mt-1">{stockReport.totalKeluar}</p>
                        </div>
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-blue-50/30 border border-blue-100/50 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Stok Akhir</p>
                            <p className="text-2xl font-black text-blue-700 mt-1">{stockReport.stokAkhir}</p>
                        </div>
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-4 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">No</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">No. Referensi</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Keterangan</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Masuk</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Keluar</th>
                                    <th className="p-4 pr-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Sisa Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {/* Stok Awal Row */}
                                <tr className="bg-slate-50/30 hover:bg-slate-50/50 transition-colors font-medium">
                                    <td className="p-4 pl-6 text-slate-400 font-bold text-xs">-</td>
                                    <td className="p-4 text-slate-500">-</td>
                                    <td className="p-4 text-slate-500">-</td>
                                    <td className="p-4 text-slate-600 font-bold">Saldo Awal Sebelum Periode</td>
                                    <td className="p-4 text-right text-slate-400">-</td>
                                    <td className="p-4 text-right text-slate-400">-</td>
                                    <td className="p-4 pr-6 text-right font-black text-slate-700">{stockReport.stokAwal}</td>
                                </tr>

                                {stockReport.mutations.map((m, index) => (
                                    <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-4 pl-6 text-xs font-bold text-slate-400">{index + 1}</td>
                                        <td className="p-4 text-slate-600 font-medium">
                                            {new Date(m.tanggal).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 font-mono text-xs font-bold text-slate-500">
                                            {m.referensi}
                                        </td>
                                        <td className="p-4 text-slate-700 font-medium">
                                            <div className="flex items-center gap-2">
                                                {m.tipe === 'MASUK' ? (
                                                    <span className="badge p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0">
                                                        <ArrowDownLeft className="w-3.5 h-3.5" />
                                                    </span>
                                                ) : (
                                                    <span className="badge p-1 bg-rose-50 text-rose-600 rounded-md shrink-0">
                                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </span>
                                                )}
                                                <span>{m.keterangan}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-bold text-emerald-600">
                                            {m.tipe === 'MASUK' ? `+${m.jumlah}` : '-'}
                                        </td>
                                        <td className="p-4 text-right font-bold text-rose-600">
                                            {m.tipe === 'KELUAR' ? `-${m.jumlah}` : '-'}
                                        </td>
                                        <td className="p-4 pr-6 text-right font-black text-slate-800">
                                            {m.sisaStok}
                                        </td>
                                    </tr>
                                ))}

                                {stockReport.mutations.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-slate-400 italic font-medium text-xs">
                                            Tidak ada mutasi obat yang tercatat pada periode ini
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Warning */}
                <div className="no-print bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        Data mutasi kartu stok ini dihitung secara real-time berdasarkan data distribusi masuk dari pusat ke unit dan transaksi pelayanan kasir yang terekam pada sistem. Hubungi administrator jika Anda mendeteksi adanya ketidakcocokan data fisik dengan laporan ini.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default KartuStokModal;
