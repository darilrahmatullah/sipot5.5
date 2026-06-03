import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Search, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import { useTransactionStore } from '../../stores/transactionStore';
import type { POSItem } from '../../types';

const POSJaringan = () => {
    const activeJaringanId = useMasterStore((state) => state.activeJaringanId);
    const jaringan = useMasterStore((state) => state.jaringan);
    const obat = useMasterStore((state) => state.obat);

    const { addPOSTransaction, getNetworkStock } = useTransactionStore();

    if (!activeJaringanId) {
        return <Navigate to="/" replace />;
    }

    const currentJaringan = jaringan.find((j) => j.id === activeJaringanId);

    // Form states
    const [namaPasien, setNamaPasien] = useState('');
    const [noRM, setNoRM] = useState('');
    const [tanggalTransaksi, setTanggalTransaksi] = useState(new Date().toISOString().split('T')[0]);

    // Add item states
    const [selectedObatId, setSelectedObatId] = useState('');
    const [inputJumlah, setInputJumlah] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Cart state
    const [cart, setCart] = useState<POSItem[]>([]);
    
    // Notification states
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Get all obat that have positive stock in this network unit
    const availableObatList = obat.map(o => {
        const stock = getNetworkStock(activeJaringanId, o.id);
        return { ...o, stock };
    }).filter(o => o.stock > 0);

    // Filter available obat based on search query
    const filteredObatList = availableObatList.filter(o =>
        o.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.kodeATC.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddToCart = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedObatId) {
            setError('Pilih obat terlebih dahulu.');
            return;
        }

        if (inputJumlah <= 0) {
            setError('Jumlah obat harus lebih dari 0.');
            return;
        }

        const selectedObat = availableObatList.find(o => o.id === selectedObatId);
        if (!selectedObat) {
            setError('Obat tidak valid.');
            return;
        }

        // Check if item is already in cart
        const existingCartItem = cart.find(item => item.obatId === selectedObatId);
        const currentCartQty = existingCartItem ? existingCartItem.jumlah : 0;
        const totalRequestedQty = currentCartQty + inputJumlah;

        if (totalRequestedQty > selectedObat.stock) {
            setError(`Stok tidak mencukupi. Stok unit saat ini: ${selectedObat.stock}. Anda meminta total: ${totalRequestedQty}.`);
            return;
        }

        if (existingCartItem) {
            setCart(cart.map(item =>
                item.obatId === selectedObatId
                    ? { ...item, jumlah: item.jumlah + inputJumlah }
                    : item
            ));
        } else {
            setCart([...cart, { obatId: selectedObatId, jumlah: inputJumlah }]);
        }

        // Reset add item form
        setSelectedObatId('');
        setInputJumlah(1);
        setSearchTerm('');
    };

    const updateCartQty = (obatId: string, newQty: number) => {
        setError(null);
        setSuccess(null);

        if (newQty <= 0) {
            handleRemoveFromCart(obatId);
            return;
        }

        const selectedObat = availableObatList.find(o => o.id === obatId);
        if (!selectedObat) return;

        if (newQty > selectedObat.stock) {
            setError(`Stok tidak mencukupi. Stok unit: ${selectedObat.stock}`);
            return;
        }

        setCart(cart.map(item =>
            item.obatId === obatId ? { ...item, jumlah: newQty } : item
        ));
    };

    const handleRemoveFromCart = (obatId: string) => {
        setError(null);
        setSuccess(null);
        setCart(cart.filter(item => item.obatId !== obatId));
    };

    const handleSubmitTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!namaPasien.trim()) {
            setError('Nama pasien wajib diisi.');
            return;
        }

        if (cart.length === 0) {
            setError('Keranjang belanja kosong.');
            return;
        }

        try {
            addPOSTransaction({
                jaringanId: activeJaringanId,
                namaPasien,
                noRM: noRM || undefined,
                tanggalTransaksi,
                items: cart
            });

            // Reset checkout state
            setNamaPasien('');
            setNoRM('');
            setCart([]);
            setSuccess('Transaksi berhasil disimpan dan stok terpotong!');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan transaksi.');
        }
    };

    return (
        <div className="space-y-6 font-sans">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    POS Pelayanan Obat ({currentJaringan?.nama})
                </h1>
                <p className="text-slate-500 mt-1">
                    Entri resep dan pelayanan obat cepat bagi pasien unit {currentJaringan?.nama}
                </p>
            </div>

            {/* Notification Alerts */}
            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-sm">{success}</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="font-semibold text-sm">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Patient & Medicine Selector */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Patient Info */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-slate-800 text-base">Informasi Pasien & Resep</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Nama Pasien <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={namaPasien}
                                    onChange={(e) => setNamaPasien(e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    No. Rekam Medis (RM)
                                </label>
                                <input
                                    type="text"
                                    value={noRM}
                                    onChange={(e) => setNoRM(e.target.value)}
                                    placeholder="Contoh: RM-908"
                                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Tanggal Transaksi
                            </label>
                            <input
                                type="date"
                                value={tanggalTransaksi}
                                onChange={(e) => setTanggalTransaksi(e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Drug Selector */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Search className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-slate-800 text-base">Pilih Obat (Stok Lokal Jaringan)</h2>
                        </div>

                        <form onSubmit={handleAddToCart} className="space-y-4">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ketik untuk mencari nama obat..."
                                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Pilih Obat dari Hasil Pencarian
                                </label>
                                <select
                                    value={selectedObatId}
                                    onChange={(e) => setSelectedObatId(e.target.value)}
                                    className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                                >
                                    <option value="">-- Pilih Obat --</option>
                                    {filteredObatList.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.nama} [Stok: {o.stock} {o.satuan}] ({o.kodeATC})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end gap-4">
                                <div className="w-1/3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Jumlah
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={inputJumlah}
                                        onChange={(e) => setInputJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl py-3 px-4 shadow-sm shadow-blue-100 hover:shadow transition-all"
                                >
                                    Tambah ke Keranjang
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Checkout Cart */}
                <div className="lg:col-span-5">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                                <h2 className="font-bold text-slate-800 text-base">Keranjang Resep</h2>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                                {cart.length} Obat
                            </span>
                        </div>

                        {/* Cart List */}
                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1">
                            {cart.map((item) => {
                                const o = obat.find(ob => ob.id === item.obatId);
                                const maxStock = availableObatList.find(ob => ob.id === item.obatId)?.stock || 0;
                                return (
                                    <div key={item.obatId} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="min-w-0 flex-1 mr-3">
                                            <p className="text-sm font-bold text-slate-800 truncate">{o?.nama}</p>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase">ATC: {o?.kodeATC} | Satuan: {o?.satuan}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                                                <button
                                                    onClick={() => updateCartQty(item.obatId, item.jumlah - 1)}
                                                    className="p-1 hover:bg-slate-50 text-slate-500 transition-colors"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="px-2 text-sm font-bold text-slate-700 min-w-[24px] text-center">
                                                    {item.jumlah}
                                                </span>
                                                <button
                                                    onClick={() => updateCartQty(item.obatId, item.jumlah + 1)}
                                                    disabled={item.jumlah >= maxStock}
                                                    className="p-1 hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-colors"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromCart(item.obatId)}
                                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {cart.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center py-16 text-slate-400">
                                    <ShoppingCart className="w-12 h-12 stroke-[1.5] mb-2 opacity-55" />
                                    <p className="text-sm font-medium">Keranjang masih kosong</p>
                                    <p className="text-xs text-slate-400 text-center mt-1 px-4">
                                        Pilih obat di kolom kiri untuk mulai pelayanan resep
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Submit Action */}
                        <div className="border-t border-slate-100 pt-4 mt-4">
                            <button
                                onClick={handleSubmitTransaction}
                                disabled={cart.length === 0}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3.5 px-4 shadow-sm shadow-emerald-100 hover:shadow transition-all disabled:opacity-40 disabled:pointer-events-none"
                            >
                                Simpan & Berikan Obat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSJaringan;
