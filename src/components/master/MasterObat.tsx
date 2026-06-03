import { useState } from 'react';
import { Pill, Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { useMasterStore } from '../../stores/masterStore';
import type { MasterObat as IMasterObat, Unit } from '../../types';
import Modal from '../common/Modal';
import BulkImportModal from '../common/BulkImportModal';

const MasterObat = () => {
    const { obat, addObat, bulkAddObat, updateObat, deleteObat } = useMasterStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingObat, setEditingObat] = useState<IMasterObat | null>(null);

    const [formData, setFormData] = useState<Omit<IMasterObat, 'id' | 'createdAt' | 'updatedAt'>>({
        kodeATC: '',
        nama: '',
        satuan: 'Tablet',
        stokOptimum: 100,
        stokMinimum: 20,
    });

    const units: Unit[] = ['Tablet', 'Kapsul', 'Botol', 'Vial', 'Ampul', 'PCS', 'Box'];

    const filteredObat = obat.filter((o: IMasterObat) =>
        o.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.kodeATC.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingObat(null);
        setFormData({
            kodeATC: '',
            nama: '',
            satuan: 'Tablet',
            stokOptimum: 100,
            stokMinimum: 20,
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (o: IMasterObat) => {
        setEditingObat(o);
        setFormData({
            kodeATC: o.kodeATC,
            nama: o.nama,
            satuan: o.satuan,
            stokOptimum: o.stokOptimum,
            stokMinimum: o.stokMinimum,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingObat) {
            updateObat(editingObat.id, formData);
        } else {
            addObat(formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) {
            deleteObat(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Obat</h1>
                    <p className="text-slate-500">Katalog obat yang tersedia di gudang farmasi</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Bulk Import</span>
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-100"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Obat</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama atau kode ATC..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter className="w-5 h-5" />
                    <span>Filter</span>
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Kode ATC</th>
                                <th className="px-6 py-4">Nama Obat</th>
                                <th className="px-6 py-4">Satuan</th>
                                <th className="px-6 py-4">Stok Optimum</th>
                                <th className="px-6 py-4">Stok Minimum</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredObat.map((o: IMasterObat) => (
                                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-blue-600 bg-blue-50/30 font-semibold">{o.kodeATC}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">{o.nama}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{o.satuan}</span>
                                    </td>
                                    <td className="px-6 py-4">{o.stokOptimum}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${o.stokMinimum > 50 ? 'text-slate-700' : 'text-amber-600'}`}>
                                            {o.stokMinimum}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(o)}
                                                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(o.id, o.nama)}
                                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredObat.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Pill className="w-12 h-12" />
                                            <p className="font-medium">Belum ada data obat</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingObat ? 'Edit Obat' : 'Tambah Obat Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Kode ATC</label>
                        <input
                            required
                            type="text"
                            placeholder="Contoh: A01AB03"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={formData.kodeATC}
                            onChange={(e) => setFormData({ ...formData, kodeATC: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Nama Obat</label>
                        <input
                            required
                            type="text"
                            placeholder="Masukkan nama obat..."
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Satuan</label>
                            <select
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                value={formData.satuan}
                                onChange={(e) => setFormData({ ...formData, satuan: e.target.value as Unit })}
                            >
                                {units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Stok Optimum</label>
                            <input
                                required
                                type="number"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                value={formData.stokOptimum}
                                onChange={(e) => setFormData({ ...formData, stokOptimum: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Stok Minimum</label>
                            <input
                                required
                                type="number"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                value={formData.stokMinimum}
                                onChange={(e) => setFormData({ ...formData, stokMinimum: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            <BulkImportModal<Omit<IMasterObat, 'id' | 'createdAt' | 'updatedAt'>>
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onImport={bulkAddObat}
                title="Bulk Import Obat"
                templateHeaders={['kodeATC', 'nama', 'satuan', 'stokOptimum', 'stokMinimum']}
                sampleData={`A01AB03,AMOXICILLIN 500 MG,Tablet,1000,200\nB01AC06,ASAM ASETILSALISILAT 80 MG,Tablet,500,100`}
            />
        </div>
    );
};

export default MasterObat;
