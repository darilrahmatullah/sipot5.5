import { useState } from 'react';
import { Plus, Search, Truck, Trash2, Download } from 'lucide-react';
import { useTransactionStore } from '../../stores/transactionStore';
import { useMasterStore } from '../../stores/masterStore';
import type { Distribusi, UploadedDocument, MasterObat, MasterJaringan } from '../../types';
import Modal from '../common/Modal';
import FileUpload from '../common/FileUpload';

const DistribusiList = () => {
    const { distribusi, addDistribusi, deleteDistribusi, getStockByObatId } = useTransactionStore();
    const { obat, jaringan } = useMasterStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<Omit<Distribusi, 'id' | 'createdAt'>>({
        tujuanJaringanId: '',
        obatId: '',
        jumlah: 0,
        tanggalDistribusi: new Date().toISOString().split('T')[0],
        nomorPermintaan: '',
        dokumen: undefined
    });

    const filtered = distribusi.filter((d: Distribusi) => {
        const o = obat.find((ob: MasterObat) => ob.id === d.obatId);
        return o?.nama.toLowerCase().includes(searchTerm.toLowerCase()) || d.nomorPermintaan.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            addDistribusi(formData);
            setIsModalOpen(false);
            setFormData({
                tujuanJaringanId: '',
                obatId: '',
                jumlah: 0,
                tanggalDistribusi: new Date().toISOString().split('T')[0],
                nomorPermintaan: '',
                dokumen: undefined
            });
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDownloadDoc = (doc: UploadedDocument) => {
        const link = document.createElement('a');
        link.href = doc.base64;
        link.download = doc.name;
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Distribusi Obat</h1>
                    <p className="text-slate-500">Catat pengeluaran obat ke jaringan (Puskesmas/Apotek)</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-rose-100"
                >
                    <Plus className="w-5 h-5" /> Tambah Distribusi
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama obat atau nomor permintaan..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Tujuan</th>
                            <th className="px-6 py-4">Obat</th>
                            <th className="px-6 py-4 text-center">Jumlah</th>
                            <th className="px-6 py-4">No. Permintaan</th>
                            <th className="px-6 py-4">Lampiran</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map((d: Distribusi) => {
                            const o = obat.find((ob: MasterObat) => ob.id === d.obatId);
                            const target = jaringan.find((j: MasterJaringan) => j.id === d.tujuanJaringanId);

                            return (
                                <tr key={d.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-800">{target?.nama || 'Unknown'}</p>
                                        <p className="text-xs text-slate-400">{target?.kategori}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-800">{o?.nama || 'Unknown'}</p>
                                        <p className="text-xs text-slate-400">{o?.kodeATC}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-rose-600">{d.jumlah}</span>
                                        <span className="text-xs text-slate-400 ml-1">{o?.satuan}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{d.nomorPermintaan}</td>
                                    <td className="px-6 py-4">
                                        {d.dokumen ? (
                                            <button
                                                onClick={() => handleDownloadDoc(d.dokumen!)}
                                                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                <Download className="w-3 h-3" /> Surat Permintaan
                                            </button>
                                        ) : <span className="text-xs text-slate-300">No doc</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => confirm('Hapus transaksi ini?') && deleteDistribusi(d.id)} className="text-slate-300 hover:text-rose-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center opacity-30">
                                    <Truck className="w-12 h-12 mx-auto mb-2" />
                                    <p>Gak ada data distribusi nih</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Distribusi Baru" maxWidth="4xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-3 gap-5">
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-semibold text-slate-700">Tujuan Jaringan</label>
                            <select required className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20 outline-none transition-all" value={formData.tujuanJaringanId} onChange={e => setFormData({ ...formData, tujuanJaringanId: e.target.value })}>
                                <option value="">-- Pilih Jaringan --</option>
                                {jaringan.map((j: MasterJaringan) => <option key={j.id} value={j.id}>{j.nama} ({j.kategori})</option>)}
                            </select>
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-semibold text-slate-700">Pilih Obat</label>
                            <select required className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20 outline-none transition-all" value={formData.obatId} onChange={e => setFormData({ ...formData, obatId: e.target.value })}>
                                <option value="">-- Pilih Obat --</option>
                                {obat.map((o: MasterObat) => (
                                    <option key={o.id} value={o.id}>
                                        {o.nama} (Stok: {getStockByObatId(o.id)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-semibold text-slate-700">Nomor Permintaan (SBBK)</label>
                            <input required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-mono" value={formData.nomorPermintaan} onChange={e => setFormData({ ...formData, nomorPermintaan: e.target.value.toUpperCase() })} placeholder="REQ/2024/XXX" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5 items-start">
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-semibold text-slate-700">Jumlah Keluar</label>
                            <div className="flex gap-2">
                                <input required type="number" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 outline-none transition-all" value={formData.jumlah} onChange={e => setFormData({ ...formData, jumlah: Number(e.target.value) })} />
                                <div className="bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl text-slate-400 text-sm flex items-center min-w-[60px] justify-center">
                                    {obat.find(o => o.id === formData.obatId)?.satuan || 'Unit'}
                                </div>
                            </div>
                            {formData.obatId && (
                                <p className={`text-[10px] font-bold mt-1 ${getStockByObatId(formData.obatId) < formData.jumlah ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    Stok Tersedia: {getStockByObatId(formData.obatId)}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-semibold text-slate-700">Tanggal Distribusi</label>
                            <input required type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 outline-none transition-all" value={formData.tanggalDistribusi} onChange={e => setFormData({ ...formData, tanggalDistribusi: e.target.value })} />
                        </div>
                        <div className="col-span-1">
                            <FileUpload label="Surat Permintaan (PDF/JPG)" onFileSelect={(doc) => setFormData({ ...formData, dokumen: doc || undefined })} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-50">
                        <button
                            type="submit"
                            disabled={formData.obatId ? getStockByObatId(formData.obatId) < formData.jumlah : false}
                            className={`px-10 py-3 rounded-xl font-bold shadow-lg transition-all ${formData.obatId && getStockByObatId(formData.obatId) < formData.jumlah
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-rose-600 text-white shadow-rose-100 hover:bg-rose-700 hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                        >
                            Simpan Data Distribusi
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DistribusiList;
