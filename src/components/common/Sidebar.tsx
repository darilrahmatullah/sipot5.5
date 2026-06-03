import { NavLink, useNavigate } from 'react-router-dom';
import {
    Layout,
    Pill,
    Network,
    Truck,
    FileDown,
    FileUp,
    FileText,
    Warehouse,
    ShoppingCart,
    Layers,
    FileSpreadsheet
} from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';

const Sidebar = () => {
    const navigate = useNavigate();
    const activeJaringanId = useMasterStore((state) => state.activeJaringanId);
    const setActiveJaringanId = useMasterStore((state) => state.setActiveJaringanId);
    const jaringan = useMasterStore((state) => state.jaringan);

    const activeJaringan = jaringan.find(j => j.id === activeJaringanId);

    const handleContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === '') {
            setActiveJaringanId(null);
            navigate('/');
        } else {
            setActiveJaringanId(val);
            navigate('/jaringan/dashboard');
        }
    };

    const navItems = activeJaringanId === null
        ? [
            { to: '/', icon: Layout, label: 'Dashboard' },
            { to: '/master/obat', icon: Pill, label: 'Master Obat' },
            { to: '/master/jaringan', icon: Network, label: 'Master Jaringan' },
            { to: '/master/penyedia', icon: Truck, label: 'Master Penyedia' },
            { to: '/penerimaan', icon: FileDown, label: 'Penerimaan' },
            { to: '/distribusi', icon: FileUp, label: 'Distribusi' },
            { to: '/pelaporan', icon: FileText, label: 'LPLPO' },
        ]
        : [
            { to: '/jaringan/dashboard', icon: Layout, label: 'Dashboard Unit' },
            { to: '/jaringan/pos', icon: ShoppingCart, label: 'POS Kasir / Pelayanan' },
            { to: '/jaringan/stok', icon: Layers, label: 'Stok Unit' },
            { to: '/jaringan/lplpo', icon: FileSpreadsheet, label: 'LPLPO Unit' },
        ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                <Warehouse className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-xl tracking-tight text-slate-800">Sipot 5.5</span>
            </div>

            {/* Context Switcher Dropdown */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Konteks Peran Aktif
                </label>
                <select
                    value={activeJaringanId || ''}
                    onChange={handleContextChange}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold shadow-sm transition-all"
                >
                    <option value="">Gudang Pusat (Puskesmas)</option>
                    {jaringan.map((j) => (
                        <option key={j.id} value={j.id}>
                            {j.nama} ({j.kategori})
                        </option>
                    ))}
                </select>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }: { isActive: boolean }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm shadow-blue-100'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status Peran</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-xs font-semibold text-slate-700 truncate">
                            {activeJaringanId ? activeJaringan?.nama : 'Gudang Pusat'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
