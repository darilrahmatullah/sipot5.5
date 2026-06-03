import { useState } from 'react';
import { Network, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import type { MasterJaringan as IMasterJaringan } from '../../types';
import Modal from '../common/Modal';
import BulkImportModal from '../common/BulkImportModal';

const MasterJaringan = () => {
    const { jaringan, addJaringan, bulkAddJaringan, updateJaringan, deleteJaringan } = useMasterStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingJaringan, setEditingJaringan] = useState<IMasterJaringan | null>(null);

    const [formData, setFormData] = useState<Omit<IMasterJaringan, 'id' | 'createdAt'>>({
        nama: '',
        kategori: 'Apotek',
    });

    const filtered = jaringan.filter((j: IMasterJaringan) =>
        j.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingJaringan(null);
        setFormData({ nama: '', kategori: 'Apotek' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (j: IMasterJaringan) => {
        setEditingJaringan(j);
        setFormData({ nama: j.nama, kategori: j.kategori });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingJaringan) {
            updateJaringan(editingJaringan.id, formData);
        } else {
            addJaringan(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Jaringan</h1>
                    <p className="text-slate-500">Daftar tujuan distribusi obat (Puskesmas/Apotek)</p>
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
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Tambah Jaringan
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama jaringan..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Nama Jaringan</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map((j: IMasterJaringan) => (
                            <tr key={j.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-semibold">{j.nama}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{j.kategori}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleOpenEdit(j)} className="text-slate-300 hover:text-blue-600">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => confirm('Hapus jaringan ini?') && deleteJaringan(j.id)} className="text-slate-300 hover:text-rose-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-20 text-center opacity-30">
                                    <Network className="w-12 h-12 mx-auto mb-2" />
                                    <p>Gak ada data jaringan nih</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingJaringan ? 'Edit Jaringan' : 'Tambah Jaringan'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold">Nama Jaringan</label>
                        <input required className="w-full px-4 py-2 border rounded-xl" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold">Kategori</label>
                        <select className="w-full px-4 py-2 border rounded-xl bg-white" value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value as any })}>
                            <option value="Apotek">Apotek</option>
                            <option value="Puskesmas">Puskesmas</option>
                            <option value="RSUD">RSUD</option>
                            <option value="Unit">Unit</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100">Simpan</button>
                </form>
            </Modal>

            <BulkImportModal<Omit<IMasterJaringan, 'id' | 'createdAt'>>
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onImport={bulkAddJaringan}
                title="Bulk Import Jaringan"
                templateHeaders={['nama', 'alamat', 'kategori']}
                sampleData={`Puskesmas Maju Jaya,Jl. Merdeka No. 1,Puskesmas\nApotek Sehat,Kawasan Industri Blok A,Apotek`}
            />
        </div>
    );
};

export default MasterJaringan;
