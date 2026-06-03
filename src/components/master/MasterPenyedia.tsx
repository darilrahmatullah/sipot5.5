import { useState } from 'react';
import { Truck, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import type { MasterPenyedia as IMasterPenyedia } from '../../types';
import Modal from '../common/Modal';
import BulkImportModal from '../common/BulkImportModal';

const MasterPenyedia = () => {
    const { penyedia, addPenyedia, bulkAddPenyedia, updatePenyedia, deletePenyedia } = useMasterStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingPenyedia, setEditingPenyedia] = useState<IMasterPenyedia | null>(null);

    const [formData, setFormData] = useState<Omit<IMasterPenyedia, 'id' | 'createdAt'>>({
        nama: '',
        alamat: '',
        kontak: '',
    });

    const filtered = penyedia.filter((p: IMasterPenyedia) => p.nama.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleOpenAdd = () => {
        setEditingPenyedia(null);
        setFormData({ nama: '', alamat: '', kontak: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (p: IMasterPenyedia) => {
        setEditingPenyedia(p);
        setFormData({ nama: p.nama, alamat: p.alamat || '', kontak: p.kontak || '' });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPenyedia) {
            updatePenyedia(editingPenyedia.id, formData);
        } else {
            addPenyedia(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Penyedia</h1>
                    <p className="text-slate-500">Daftar supplier dan distributor obat</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Bulk Import
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Tambah Penyedia
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama penyedia..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Nama Penyedia</th>
                            <th className="px-6 py-4">Kontak</th>
                            <th className="px-6 py-4">Alamat</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map((p: IMasterPenyedia) => (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-semibold">{p.nama}</td>
                                <td className="px-6 py-4 text-slate-600">{p.kontak || '-'}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{p.alamat || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleOpenEdit(p)} className="text-slate-300 hover:text-indigo-600">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => confirm('Hapus penyedia ini?') && deletePenyedia(p.id)} className="text-slate-300 hover:text-rose-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center opacity-30">
                                    <Truck className="w-12 h-12 mx-auto mb-2" />
                                    <p>Gak ada data penyedia nih</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPenyedia ? 'Edit Penyedia' : 'Tambah Penyedia'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold">Nama Penyedia</label>
                        <input required className="w-full px-4 py-2 border rounded-xl" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold">Kontak</label>
                        <input className="w-full px-4 py-2 border rounded-xl" value={formData.kontak} onChange={e => setFormData({ ...formData, kontak: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold">Alamat</label>
                        <textarea className="w-full px-4 py-2 border rounded-xl" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100">Simpan</button>
                </form>
            </Modal>

            <BulkImportModal<Omit<IMasterPenyedia, 'id' | 'createdAt'>>
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onImport={bulkAddPenyedia}
                title="Bulk Import Penyedia"
                templateHeaders={['nama', 'kontak', 'alamat']}
                sampleData={`PT. Kimia Farma,021-1234567,Jakarta\nPT. Bio Farma,022-7654321,Bandung`}
            />
        </div>
    );
};

export default MasterPenyedia;
