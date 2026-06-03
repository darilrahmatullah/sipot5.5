import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import type { UploadedDocument } from '../../types';

interface FileUploadProps {
    onFileSelect: (doc: UploadedDocument | null) => void;
    label: string;
}

const FileUpload = ({ onFileSelect, label }: FileUploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate size (max 2MB for Base64 storage safety)
        if (selectedFile.size > 2 * 1024 * 1024) {
            setError('File terlalu besar. Maksimal 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const doc: UploadedDocument = {
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                base64: reader.result as string,
            };
            setFile(selectedFile);
            setError(null);
            onFileSelect(doc);
        };
        reader.readAsDataURL(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
        onFileSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <div
                className={`border-2 border-dashed rounded-xl p-6 transition-all ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                />

                {!file ? (
                    <div
                        className="flex flex-col items-center gap-2 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="p-3 bg-white rounded-full shadow-sm">
                            <Upload className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-700">Klik untuk upload atau drag and drop</p>
                            <p className="text-xs text-slate-400">PDF, JPG, atau PNG (Maks. 2MB)</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <FileText className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="max-w-[200px]">
                                <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <button
                                type="button"
                                onClick={removeFile}
                                className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        </div>
    );
};

export default FileUpload;
