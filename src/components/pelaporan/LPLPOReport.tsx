import { useState, useMemo } from 'react';
import { FileText, Download, Printer, Filter, ChevronRight, ChevronLeft } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import { useTransactionStore } from '../../stores/transactionStore';
import type { LPLPORow, MasterObat, Penerimaan, Distribusi } from '../../types';

const LPLPOReport = () => {
    const { obat } = useMasterStore();
    const { penerimaan, distribusi } = useTransactionStore();

    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const reportData = useMemo(() => {
        return obat.map((o: MasterObat): LPLPORow => {
            // Logic for Stok Awal: Sum of all transactions BEFORE this month
            const pBefore = penerimaan
                .filter((p: Penerimaan) => p.obatId === o.id && new Date(p.tanggalMasuk) < new Date(year, month, 1))
                .reduce((sum: number, p: Penerimaan) => sum + Number(p.jumlah), 0);

            const dBefore = distribusi
                .filter((d: Distribusi) => d.obatId === o.id && new Date(d.tanggalDistribusi) < new Date(year, month, 1))
                .reduce((sum: number, d: Distribusi) => sum + Number(d.jumlah), 0);

            const stokAwal = pBefore - dBefore;

            // Logic for Current Month Transactions
            const pCurrent = penerimaan
                .filter((p: Penerimaan) => p.obatId === o.id &&
                    new Date(p.tanggalMasuk).getMonth() === month &&
                    new Date(p.tanggalMasuk).getFullYear() === year)
                .reduce((sum: number, p: Penerimaan) => sum + Number(p.jumlah), 0);

            const dCurrent = distribusi
                .filter((d: Distribusi) => d.obatId === o.id &&
                    new Date(d.tanggalDistribusi).getMonth() === month &&
                    new Date(d.tanggalDistribusi).getFullYear() === year)
                .reduce((sum: number, d: Distribusi) => sum + Number(d.jumlah), 0);

            const persediaan = stokAwal + pCurrent;
            const stokAkhir = persediaan - dCurrent;

            // Hitung Permintaan: Stok Optimum - Stok Akhir (if negative, set to 0)
            const permintaan = Math.max(0, o.stokOptimum - stokAkhir);

            return {
                obatId: o.id,
                namaObat: o.nama,
                satuan: o.satuan,
                kodeATC: `${o.kodeATC}-${year}`, // Format: ATC-TahunPerolehan
                stokAwal,
                penerimaan: pCurrent,
                persediaan,
                pemakaian: dCurrent,
                stokAkhir,
                stokOptimum: o.stokOptimum,
                permintaan
            };
        });
    }, [obat, penerimaan, distribusi, month, year]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">LPLPO</h1>
                    <p className="text-slate-500">Laporan Pemakaian dan Lembar Permintaan Obat</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <Printer className="w-4 h-4" /> Cetak
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Periode Bulan</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMonth(m => m === 0 ? 11 : m - 1)}
                                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-lg font-bold text-slate-800 min-w-[120px] text-center">{months[month]}</span>
                            <button
                                onClick={() => setMonth(m => m === 11 ? 0 : m + 1)}
                                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-100 hidden md:block" />
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tahun</label>
                        <select
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="block text-lg font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                        >
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">Unit Pelapor</p>
                        <p className="font-bold text-slate-800">Gudang Farmasi Utama</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider text-center border-b border-slate-100">
                                <th className="px-4 py-4 text-left border-r border-slate-100" rowSpan={2}>No. Kode (ATC)</th>
                                <th className="px-4 py-4 text-left border-r border-slate-100" rowSpan={2}>Nama Obat</th>
                                <th className="px-4 py-4 border-r border-slate-100" rowSpan={2}>Satuan</th>
                                <th className="px-4 py-2 border-b border-slate-100" colSpan={6}>Persediaan / Pemakaian</th>
                                <th className="px-4 py-4 text-emerald-600 font-black border-l border-slate-100 bg-emerald-50/30" rowSpan={2}>Permintaan</th>
                            </tr>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider text-center">
                                <th className="px-2 py-2 border-r border-slate-100">Stok Awal</th>
                                <th className="px-2 py-2 border-r border-slate-100">Penerimaan</th>
                                <th className="px-2 py-2 border-r border-slate-100">Persediaan</th>
                                <th className="px-2 py-2 border-r border-slate-100">Pemakaian</th>
                                <th className="px-2 py-2 border-r border-slate-100">Stok Akhir</th>
                                <th className="px-2 py-2 border-r border-slate-100">Stok Opt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reportData.map((row: LPLPORow, i: number) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors text-center border-b border-slate-50">
                                    <td className="px-4 py-3 text-left font-mono text-xs border-r border-slate-50">{row.kodeATC}</td>
                                    <td className="px-4 py-3 text-left font-semibold text-slate-800 border-r border-slate-50">{row.namaObat}</td>
                                    <td className="px-4 py-3 text-slate-500 border-r border-slate-50">{row.satuan}</td>
                                    <td className="px-2 py-3 border-r border-slate-50">{row.stokAwal}</td>
                                    <td className="px-2 py-3 font-medium text-emerald-600 border-r border-slate-50">+{row.penerimaan}</td>
                                    <td className="px-2 py-3 font-bold text-slate-700 border-r border-slate-50">{row.persediaan}</td>
                                    <td className="px-2 py-3 font-medium text-rose-600 border-r border-slate-50">-{row.pemakaian}</td>
                                    <td className="px-2 py-3 font-black text-slate-900 border-r border-slate-50">{row.stokAkhir}</td>
                                    <td className="px-2 py-3 text-slate-400 border-r border-slate-50">{row.stokOptimum}</td>
                                    <td className="px-4 py-3 font-black text-emerald-700 bg-emerald-50/30 border-l border-emerald-100">{row.permintaan}</td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-6 py-20 text-center text-slate-400">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">Tidak ada data obat untuk dilaporkan</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                    <Filter className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900">Petunjuk Pelaporan</h3>
                    <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                        Data dikalkulasi secara otomatis berdasarkan transaksi penerimaan dan distribusi yang tercatat pada sistem.
                        Nomor Kode menggunakan format <strong>ATC-Tahun</strong> sesuai standar Kemenkes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LPLPOReport;
