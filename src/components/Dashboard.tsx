import { Pill, FileDown, FileUp, AlertCircle, Clock, Activity, BarChart } from 'lucide-react';
import { useMasterStore } from '../stores/masterStore';
import { useTransactionStore } from '../stores/transactionStore';
import type { MasterObat, Penerimaan, Distribusi } from '../types';

const Dashboard = () => {
    const { obat } = useMasterStore();
    const { penerimaan, distribusi, getStockByObatId } = useTransactionStore();

    const lowStockItems = obat.filter((o: MasterObat) => getStockByObatId(o.id) <= o.stokMinimum);

    const stats = [
        {
            label: 'Total Obat',
            value: obat.length,
            icon: Pill,
            color: 'bg-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Total Penerimaan',
            value: penerimaan.length,
            icon: FileDown,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Total Distribusi',
            value: distribusi.length,
            icon: FileUp,
            color: 'bg-rose-500',
            bg: 'bg-rose-50'
        },
        {
            label: 'Stok Kritis',
            value: lowStockItems.length,
            icon: AlertCircle,
            color: 'bg-amber-500',
            bg: 'bg-amber-50'
        }
    ];

    const recentActivity = [
        ...penerimaan.map((p: Penerimaan) => ({ ...p, type: 'IN' as const })),
        ...distribusi.map((d: Distribusi) => ({ ...d, type: 'OUT' as const }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Status inventaris gudang farmasi hari ini</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-slate-800 text-lg">Aktivitas Terakhir</h2>
                        </div>
                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Lihat Semua</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity, i) => {
                            const o = obat.find((ob: MasterObat) => ob.id === activity.obatId);
                            return (
                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                    <div className={`p-2 rounded-lg ${activity.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {activity.type === 'IN' ? <FileDown className="w-4 h-4" /> : <FileUp className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{o?.nama || 'Unknown Obat'}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(activity.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${activity.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {activity.type === 'IN' ? '+' : '-'}{activity.jumlah}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{o?.satuan}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {recentActivity.length === 0 && (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Belum ada aktivitas transaksi</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart className="w-5 h-5 text-amber-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Peringatan Stok Kritis</h2>
                    </div>
                    <div className="space-y-4">
                        {lowStockItems.map((o: MasterObat) => (
                            <div key={o.id} className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Pill className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{o.nama}</p>
                                        <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">Min: {o.stokMinimum}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-amber-700">{getStockByObatId(o.id)}</p>
                                    <p className="text-[10px] text-slate-400">{o.satuan}</p>
                                </div>
                            </div>
                        ))}
                        {lowStockItems.length === 0 && (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Semua stok dalam kondisi aman</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
