import { useState } from 'react';
import { FileDown, Plus, Search, Calendar, Package, Trash2, Download } from 'lucide-react';
import { useTransactionStore } from '../../stores/transactionStore';
import { useMasterStore } from '../../stores/masterStore';
import type { Penerimaan, UploadedDocument, MasterObat, MasterPenyedia } from '../../types';
import Modal from '../common/Modal';
import FileUpload from '../common/FileUpload';

const PenerimaanList = () => {
    const { penerimaan, addPenerimaan, deletePenerimaan } = useTransactionStore();
    const { obat, penyedia } = useMasterStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<Omit<Penerimaan, 'id' | 'createdAt'>>({
        obatId: '',
        penyediaId: '',
        jumlah: 0,
        tanggalMasuk: new Date().toISOString().split('T')[0],
        tanggalED: '',
        batchNumber: '',
        nomorFaktur: '',
        dokumen: undefined
    });

    const filtered = penerimaan.filter((p: Penerimaan) => {
        const o = obat.find((ob: MasterObat) => ob.id === p.obatId);
        return o?.nama.toLowerCase().includes(searchTerm.toLowerCase()) || p.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addPenerimaan(formData);
        setIsModalOpen(false);
        setFormData({
            obatId: '',
            penyediaId: '',
            jumlah: 0,
            tanggalMasuk: new Date().toISOString().split('T')[0],
            tanggalED: '',
            batchNumber: '',
            nomorFaktur: '',
            dokumen: undefined
        });
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
                    <h1 className="text-2xl font-bold text-slate-900">Penerimaan Obat</h1>
                    <p className="text-slate-500">Kelola stok masuk dari supplier/distributor</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-100"
                >
                    <Plus className="w-5 h-5" /> Tambah Penerimaan
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama obat atau nomor batch..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Data Obat</th>
                            <th className="px-6 py-4">Supplier</th>
                            <th className="px-6 py-4 text-center">Jumlah</th>
                            <th className="px-6 py-4">Batch / ED</th>
                            <th className="px-6 py-4">Lampiran</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map((p: Penerimaan) => {
                            const o = obat.find((ob: MasterObat) => ob.id === p.obatId);
                            const s = penyedia.find((py: MasterPenyedia) => py.id === p.penyediaId);
                            const isExpiredSoon = new Date(p.tanggalED) < new Date(new Date().setMonth(new Date().getMonth() + 6));

                            return (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-800">{o?.nama || 'Unknown'}</p>
                                        <p className="text-xs text-slate-400">{o?.kodeATC}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-700">{s?.nama || '-'}</p>
                                        <p className="text-[10px] text-slate-400">FAK: {p.nomorFaktur}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-blue-600">{p.jumlah}</span>
                                        <span className="text-xs text-slate-400 ml-1">{o?.satuan}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-mono font-bold text-slate-600">{p.batchNumber}</p>
                                        <p className={`text-[10px] font-bold ${isExpiredSoon ? 'text-rose-500' : 'text-slate-400'}`}>
                                            ED: {p.tanggalED} {isExpiredSoon && ' (Segera ED!)'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.dokumen ? (
                                            <button
                                                onClick={() => handleDownloadDoc(p.dokumen!)}
                                                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                <Download className="w-3 h-3" /> Lihat SBBK
                                            </button>
                                        ) : <span className="text-xs text-slate-300">No doc</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => confirm('Hapus transaksi ini?') && deletePenerimaan(p.id)} className="text-slate-300 hover:text-rose-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center opacity-30">
                                    <FileDown className="w-12 h-12 mx-auto mb-2" />
                                    <p>Belum ada rekaman penerimaan</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Penerimaan Baru" maxWidth="4xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-3 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Pilih Obat</label>
                            <select required className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.obatId} onChange={e => setFormData({ ...formData, obatId: e.target.value })}>
                                <option value="">-- Pilih Obat --</option>
                                {obat.map((o: MasterObat) => <option key={o.id} value={o.id}>{o.nama}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Pilih Penyedia</label>
                            <select required className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.penyediaId} onChange={e => setFormData({ ...formData, penyediaId: e.target.value })}>
                                <option value="">-- Pilih Penyedia --</option>
                                {penyedia.map(py => <option key={py.id} value={py.id}>{py.nama}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Nomor Faktur</label>
                            <input required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.nomorFaktur} onChange={e => setFormData({ ...formData, nomorFaktur: e.target.value })} placeholder="Contoh: INV/2024/001" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Jumlah Masuk</label>
                            <div className="flex gap-2">
                                <input required type="number" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.jumlah} onChange={e => setFormData({ ...formData, jumlah: Number(e.target.value) })} />
                                <div className="bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl text-slate-400 text-sm flex items-center min-w-[60px] justify-center">
                                    {obat.find(o => o.id === formData.obatId)?.satuan || 'Unit'}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Nomor Batch</label>
                            <input required className="w-full px-4 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all uppercase" value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value.toUpperCase() })} placeholder="A123B456" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Tanggal ED (Expired)</label>
                            <input required type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.tanggalED} onChange={e => setFormData({ ...formData, tanggalED: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5 items-start">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Tanggal Masuk Stok</label>
                            <input required type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.tanggalMasuk} onChange={e => setFormData({ ...formData, tanggalMasuk: e.target.value })} />
                            <p className="text-[10px] text-slate-400 italic mt-1">*Tanggal pencatatan stok di gudang</p>
                        </div>
                        <div className="col-span-2">
                            <FileUpload label="Lampiran SBBK / Faktur (Scan PDF/JPG)" onFileSelect={(doc) => setFormData({ ...formData, dokumen: doc || undefined })} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-50">
                        <button type="submit" className="px-10 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                            Simpan Penerimaan Obat
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PenerimaanList;
