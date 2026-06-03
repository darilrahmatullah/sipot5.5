import { Navigate } from 'react-router-dom';
import { Pill, ShoppingCart, Activity, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import { useTransactionStore } from '../../stores/transactionStore';

const DashboardJaringan = () => {
    const activeJaringanId = useMasterStore((state) => state.activeJaringanId);
    const jaringan = useMasterStore((state) => state.jaringan);
    const obat = useMasterStore((state) => state.obat);

    const { posTransactions, getNetworkStockList, getNetworkStock } = useTransactionStore();

    if (!activeJaringanId) {
        return <Navigate to="/" replace />;
    }

    const currentJaringan = jaringan.find((j) => j.id === activeJaringanId);

    // Calculate metrics
    const networkStocks = getNetworkStockList(activeJaringanId);
    const totalJenisObat = networkStocks.length;

    const myTransactions = posTransactions
        .filter((t) => t.jaringanId === activeJaringanId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalTransaksiHariIni = myTransactions.filter((t) => {
        const txDate = new Date(t.tanggalTransaksi).toDateString();
        const today = new Date().toDateString();
        return txDate === today;
    }).length;

    const totalPemakaianHariIni = myTransactions
        .filter((t) => {
            const txDate = new Date(t.tanggalTransaksi).toDateString();
            const today = new Date().toDateString();
            return txDate === today;
        })
        .reduce((sum, t) => sum + t.items.reduce((iSum, item) => iSum + Number(item.jumlah), 0), 0);

    const lowStockItems = networkStocks.filter((stock) => {
        const o = obat.find((ob) => ob.id === stock.obatId);
        return o ? stock.currentStock <= o.stokMinimum : false;
    });

    const stats = [
        {
            label: 'Jenis Obat Terdistribusi',
            value: totalJenisObat,
            icon: Pill,
            color: 'bg-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Transaksi Hari Ini',
            value: totalTransaksiHariIni,
            icon: ShoppingCart,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Pemakaian Hari Ini',
            value: totalPemakaianHariIni,
            icon: TrendingUp,
            color: 'bg-violet-500',
            bg: 'bg-violet-50'
        },
        {
            label: 'Stok Kritis Unit',
            value: lowStockItems.length,
            icon: AlertCircle,
            color: 'bg-amber-500',
            bg: 'bg-amber-50'
        }
    ];

    const recentActivity = myTransactions.slice(0, 5);

    return (
        <div className="space-y-8 font-sans">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Dashboard {currentJaringan?.nama || 'Unit Jaringan'}
                </h1>
                <p className="text-slate-500 mt-1">
                    Ringkasan stok lokal dan pelayanan obat untuk unit {currentJaringan?.nama}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent POS Transactions */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Transaksi Pelayanan Terakhir</h2>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((tx, i) => (
                            <div key={tx.id} className="flex items-start justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{tx.namaPasien}</p>
                                        <p className="text-xs text-slate-400">RM: {tx.noRM || '-'}</p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {tx.items.map((item, idx) => {
                                                const o = obat.find((ob) => ob.id === item.obatId);
                                                return (
                                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {o?.nama || 'Unknown'}: {item.jumlah} {o?.satuan}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Belum ada transaksi POS</div>
                        )}
                    </div>
                </div>

                {/* Critical Stock Alerts */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Peringatan Stok Kritis Unit</h2>
                    </div>
                    <div className="space-y-4">
                        {lowStockItems.map((stock) => {
                            const o = obat.find((ob) => ob.id === stock.obatId);
                            if (!o) return null;
                            return (
                                <div key={stock.obatId} className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Pill className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{o.nama}</p>
                                            <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
                                                Min Stok: {o.stokMinimum} | Satuan: {o.satuan}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black ${stock.currentStock === 0 ? 'text-rose-600' : 'text-amber-700'}`}>
                                            {stock.currentStock}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{o.satuan}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {lowStockItems.length === 0 && (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Stok obat unit aman</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardJaringan;
