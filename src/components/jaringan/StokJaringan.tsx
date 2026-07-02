import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Pill, Search, AlertTriangle, CheckCircle, HelpCircle, History } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import { useTransactionStore } from '../../stores/transactionStore';
import KartuStokModal from './KartuStokModal';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../common/Pagination';

const StokJaringan = () => {
    const activeJaringanId = useMasterStore((state) => state.activeJaringanId);
    const jaringan = useMasterStore((state) => state.jaringan);
    const obat = useMasterStore((state) => state.obat);

    const { getNetworkStock } = useTransactionStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'LOW' | 'EMPTY'>('ALL');
    const [selectedObatId, setSelectedObatId] = useState<string | null>(null);

    if (!activeJaringanId) {
        return <Navigate to="/" replace />;
    }

    const currentJaringan = jaringan.find((j) => j.id === activeJaringanId);

    // Calculate current stock for each master drug in this network unit
    const stockItems = obat.map((o) => {
        const currentStock = getNetworkStock(activeJaringanId, o.id);
        const isLow = currentStock > 0 && currentStock <= o.stokMinimum;
        const isEmpty = currentStock === 0;
        return {
            ...o,
            currentStock,
            isLow,
            isEmpty
        };
    });

    const filteredItems = stockItems.filter((item) => {
        const matchesSearch =
            item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.kodeATC.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterStatus === 'LOW') return item.isLow;
        if (filterStatus === 'EMPTY') return item.isEmpty;
        return true;
    });

    const {
        currentPage,
        totalPages,
        currentData: paginatedData,
        goToPage,
        totalItems
    } = usePagination(filteredItems, 10);


    return (
        <div className="space-y-6 font-sans">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Stok Obat Lokal Unit ({currentJaringan?.nama})
                </h1>
                <p className="text-slate-500 mt-1">
                    Daftar inventaris obat riil di unit {currentJaringan?.nama} (kalkulasi distribusi masuk dan penjualan kasir)
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Search & Filter Controls */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari nama obat atau kode ATC..."
                            className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                        <button
                            onClick={() => setFilterStatus('ALL')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === 'ALL'
                                ? 'bg-white text-slate-800 shadow-sm shadow-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Semua Obat ({stockItems.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('LOW')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === 'LOW'
                                ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                                : 'text-slate-500 hover:text-amber-600'
                            }`}
                        >
                            Stok Menipis ({stockItems.filter((i) => i.isLow).length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('EMPTY')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === 'EMPTY'
                                ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                                : 'text-slate-500 hover:text-rose-600'
                            }`}
                        >
                            Kosong ({stockItems.filter((i) => i.isEmpty).length})
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">Kode ATC</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nama Obat</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Satuan</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Min. Stok</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Stok Unit</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                                <th className="p-4 pr-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 font-semibold text-xs text-slate-500 tracking-wider">
                                        {item.kodeATC}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm">
                                                <Pill className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-800 text-sm">{item.nama}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm font-medium">{item.satuan}</td>
                                    <td className="p-4 text-slate-600 text-sm font-medium">{item.stokMinimum}</td>
                                    <td className="p-4 text-right">
                                        <span className={`text-base font-black ${item.isEmpty ? 'text-rose-600' : item.isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                                            {item.currentStock}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {item.isEmpty ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                                Kosong
                                            </span>
                                        ) : item.isLow ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                Kritis
                                            </span>
                                        ) : item.currentStock > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                Aman
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">
                                                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                                Belum Ada Distribusi
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 pr-6 text-center">
                                        <button
                                            onClick={() => setSelectedObatId(item.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                                            title="Lihat Kartu Stok"
                                        >
                                            <History className="w-3.5 h-3.5" />
                                            <span>Kartu Stok</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-400 italic text-sm">
                                        Tidak ada data obat yang cocok dengan kriteria filter
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                totalItems={totalItems}
            />

            {/* Kartu Stok Modal */}
            {selectedObatId && (
                <KartuStokModal
                    isOpen={selectedObatId !== null}
                    onClose={() => setSelectedObatId(null)}
                    obatId={selectedObatId}
                    jaringanId={activeJaringanId}
                />
            )}
        </div>
    );
};

export default StokJaringan;
