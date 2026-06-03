import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FileText, Printer, Calendar } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import { useTransactionStore } from '../../stores/transactionStore';

const LPLPOJaringan = () => {
    const activeJaringanId = useMasterStore((state) => state.activeJaringanId);
    const jaringan = useMasterStore((state) => state.jaringan);
    const obat = useMasterStore((state) => state.obat);

    const { distribusi, posTransactions } = useTransactionStore();

    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    if (!activeJaringanId) {
        return <Navigate to="/" replace />;
    }

    const currentJaringan = jaringan.find((j) => j.id === activeJaringanId);

    const months = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' }
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    // Helper to calculate LPLPO details
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const lplpoRows = obat.map((o) => {
        // Calculate Stok Awal (Distributed before selected month - Consumed before selected month)
        const distributedBefore = distribusi
            .filter((d) => d.tujuanJaringanId === activeJaringanId && d.obatId === o.id && new Date(d.tanggalDistribusi) < startOfMonth)
            .reduce((sum, d) => sum + Number(d.jumlah), 0);

        const consumedBefore = posTransactions
            .filter((p) => p.jaringanId === activeJaringanId && new Date(p.tanggalTransaksi) < startOfMonth)
            .reduce((sum, p) => {
                const item = p.items.find((i) => i.obatId === o.id);
                return sum + (item ? Number(item.jumlah) : 0);
            }, 0);

        const stokAwal = Math.max(0, distributedBefore - consumedBefore);

        // Calculate Penerimaan during selected month
        const penerimaan = distribusi
            .filter((d) => d.tujuanJaringanId === activeJaringanId && d.obatId === o.id && new Date(d.tanggalDistribusi) >= startOfMonth && new Date(d.tanggalDistribusi) <= endOfMonth)
            .reduce((sum, d) => sum + Number(d.jumlah), 0);

        // Calculate Pemakaian during selected month
        const pemakaian = posTransactions
            .filter((p) => p.jaringanId === activeJaringanId && new Date(p.tanggalTransaksi) >= startOfMonth && new Date(p.tanggalTransaksi) <= endOfMonth)
            .reduce((sum, p) => {
                const item = p.items.find((i) => i.obatId === o.id);
                return sum + (item ? Number(item.jumlah) : 0);
            }, 0);

        const persediaan = stokAwal + penerimaan;
        const stokAkhir = Math.max(0, persediaan - pemakaian);

        return {
            ...o,
            stokAwal,
            penerimaan,
            persediaan,
            pemakaian,
            stokAkhir
        };
    }).filter(row => row.stokAwal > 0 || row.penerimaan > 0 || row.pemakaian > 0); // Only show drugs with activity or stock

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 font-sans print:p-0">
            {/* Header: Hidden on print */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Laporan LPLPO Unit ({currentJaringan?.nama})
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Laporan Pemakaian dan Lembar Permintaan Obat bulanan unit {currentJaringan?.nama}
                    </p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl py-3 px-4 shadow-sm transition-all"
                >
                    <Printer className="w-4 h-4" />
                    Cetak Laporan
                </button>
            </div>

            {/* Print Header: Only shown on print */}
            <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-xl font-bold uppercase">Laporan Pemakaian dan Lembar Permintaan Obat (LPLPO) Sub-Unit</h1>
                <p className="text-sm font-bold uppercase mt-1">Unit Pelayanan: {currentJaringan?.nama}</p>
                <p className="text-xs text-slate-600 mt-1">
                    Periode: {months.find((m) => m.value === month)?.label} {year}
                </p>
            </div>

            {/* Period Selector Form: Hidden on print */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-end gap-4 print:hidden">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Pilih Bulan
                        </label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Pilih Tahun
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:border-0 print:shadow-none">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2 print:hidden">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-slate-800 text-base">
                        Rincian Pemakaian Obat - {months.find((m) => m.value === month)?.label} {year}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left border-slate-200 print:text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 print:bg-transparent">
                                <th className="p-3 pl-6 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">No.</th>
                                <th className="p-3 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">Kode ATC</th>
                                <th className="p-3 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">Nama Obat</th>
                                <th className="p-3 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">Satuan</th>
                                <th className="p-3 text-right font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">Stok Awal</th>
                                <th className="p-3 text-right font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">Penerimaan</th>
                                <th className="p-3 text-right font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">Persediaan</th>
                                <th className="p-3 text-right font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">Pemakaian</th>
                                <th className="p-3 text-right font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 pr-6">Stok Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 print:divide-y print:divide-slate-200">
                            {lplpoRows.map((row, index) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-3 pl-6 font-medium text-slate-500">{index + 1}</td>
                                    <td className="p-3 font-semibold text-slate-500 tracking-wider">{row.kodeATC}</td>
                                    <td className="p-3 font-bold text-slate-800">{row.nama}</td>
                                    <td className="p-3 text-slate-600">{row.satuan}</td>
                                    <td className="p-3 text-right text-slate-700 font-medium">{row.stokAwal}</td>
                                    <td className="p-3 text-right text-emerald-600 font-medium">{row.penerimaan}</td>
                                    <td className="p-3 text-right text-blue-600 font-medium">{row.persediaan}</td>
                                    <td className="p-3 text-right text-rose-600 font-bold">{row.pemakaian}</td>
                                    <td className="p-3 text-right text-slate-800 font-black pr-6">{row.stokAkhir}</td>
                                </tr>
                            ))}

                            {lplpoRows.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="text-center py-12 text-slate-400 italic text-sm">
                                        Tidak ada aktivitas transaksi atau stok obat pada periode yang dipilih
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Signature Area for Printing */}
            <div className="hidden print:grid grid-cols-2 gap-8 mt-12 text-xs">
                <div className="text-center">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Unit Pelayanan Jaringan</p>
                    <div className="h-16"></div>
                    <p className="underline font-bold">_________________________</p>
                    <p className="text-[10px] text-slate-500">NIP. .......................................</p>
                </div>
                <div className="text-center">
                    <p>Pembuat Laporan,</p>
                    <p className="font-bold">Petugas Farmasi Unit</p>
                    <div className="h-16"></div>
                    <p className="underline font-bold">_________________________</p>
                    <p className="text-[10px] text-slate-500">NIP. .......................................</p>
                </div>
            </div>
        </div>
    );
};

export default LPLPOJaringan;
