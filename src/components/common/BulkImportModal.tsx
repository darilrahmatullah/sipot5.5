import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import Modal from './Modal';
import * as XLSX from 'xlsx';

interface BulkImportModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: T[]) => void;
    title: string;
    templateHeaders: string[];
    sampleData: string;
}

const BulkImportModal = <T extends Record<string, any>>({
    isOpen,
    onClose,
    onImport,
    title,
    templateHeaders,
    sampleData,
}: BulkImportModalProps<T>) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<T[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');
        if (!isExcel) {
            setError('File harus dalam format Excel (.xlsx atau .xls)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                validateAndSetData(data as any[]);
            } catch (err) {
                setError('Gagal membaca file Excel. Pastikan file tidak rusak.');
            }
        };
        reader.readAsBinaryString(selectedFile);
        setFile(selectedFile);
    };

    const validateAndSetData = (rawData: any[]) => {
        if (rawData.length === 0) {
            setError('File Excel kosong atau tidak memiliki data.');
            return;
        }

        const headers = Object.keys(rawData[0]).map(h => h.trim().toLowerCase());
        const expectedHeaders = templateHeaders.map(h => h.toLowerCase());

        // Validate headers
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            setError(`Header tidak sesuai. Kurang: ${missingHeaders.join(', ')}`);
            return;
        }

        const processedData: T[] = rawData.map(row => {
            const entry: any = {};
            templateHeaders.forEach(header => {
                // Find matching key case-insensitively
                const realKey = Object.keys(row).find(k => k.trim().toLowerCase() === header.toLowerCase());
                let value = realKey ? row[realKey] : '';

                // Keep as is, xlsx usually handles types well
                entry[header] = value;
            });
            return entry as T;
        });

        setPreviewData(processedData);
        setError(null);
    };

    const handleConfirm = () => {
        if (previewData.length > 0) {
            onImport(previewData);
            handleClose();
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setPreviewData([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    const downloadTemplate = () => {
        try {
            console.log('Download template v3 triggered');
            const headers = templateHeaders;
            const sampleRows = sampleData.split('\n').map(row => {
                const values = row.split(',');
                const obj: any = {};
                headers.forEach((h, i) => {
                    obj[h] = values[i];
                });
                return obj;
            });

            const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

            const filename = `template-${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`;

            // Manual Download Logic
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log('Download triggered for:', filename);
        } catch (err) {
            console.error('Error during template download:', err);
            setError('Gagal mengunduh template. Silakan coba lagi.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title}>
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <Download className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-900">Gunakan Template Excel</p>
                            <p className="text-xs text-emerald-700">Format .xlsx lebih aman dan mudah diedit.</p>
                        </div>
                    </div>
                    <button
                        onClick={downloadTemplate}
                        className="px-3 py-1.5 bg-white text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors"
                    >
                        Unduh Template
                    </button>
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'
                        }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx,.xls"
                    />
                    {!file ? (
                        <>
                            <div className="p-4 bg-white rounded-full shadow-sm text-blue-500">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-700">Klik untuk upload file Excel</p>
                                <p className="text-xs text-slate-400">Pastikan file berisi header yang sesuai</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-4 bg-white rounded-full shadow-sm text-emerald-500">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                                <p className="text-xs text-emerald-600 font-medium">Berhasil dibaca</p>
                            </div>
                        </>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {previewData.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700">Pratinjau Data ({previewData.length} baris)</h3>
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        {templateHeaders.map(h => (
                                            <th key={h} className="px-3 py-2 text-slate-500 font-bold uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {previewData.slice(0, 5).map((row, i) => (
                                        <tr key={i}>
                                            {templateHeaders.map(h => (
                                                <td key={h} className="px-3 py-2 text-slate-700">{String(row[h])}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    {previewData.length > 5 && (
                                        <tr>
                                            <td colSpan={templateHeaders.length} className="px-3 py-2 text-center text-slate-400 italic">
                                                ...dan {previewData.length - 5} baris lainnya
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={previewData.length === 0}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
                    >
                        Impor Sekarang
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BulkImportModal;
