export type Unit = 'Tablet' | 'Kapsul' | 'Botol' | 'Vial' | 'Ampul' | 'PCS' | 'Box';

export interface MasterObat {
    id: string;
    kodeATC: string;
    nama: string;
    satuan: Unit;
    stokOptimum: number;
    stokMinimum: number;
    createdAt: string;
    updatedAt: string;
}

export interface MasterJaringan {
    id: string;
    nama: string;
    alamat?: string;
    kategori: 'Apotek' | 'Puskesmas' | 'Unit';
    createdAt: string;
}

export interface MasterPenyedia {
    id: string;
    nama: string;
    kontak?: string;
    alamat?: string;
    createdAt: string;
}

export interface UploadedDocument {
    name: string;
    type: string;
    size: number;
    base64: string;
}

export interface Penerimaan {
    id: string;
    obatId: string;
    jumlah: number;
    batchNumber: string;
    tanggalED: string;
    penyediaId: string;
    nomorFaktur: string;
    tanggalMasuk: string;
    dokumen?: UploadedDocument;
    createdAt: string;
}

export interface Distribusi {
    id: string;
    tujuanJaringanId: string;
    obatId: string;
    jumlah: number;
    tanggalDistribusi: string;
    nomorPermintaan: string;
    dokumen?: UploadedDocument;
    createdAt: string;
}

export interface LPLPORow {
    obatId: string;
    namaObat: string;
    satuan: Unit;
    kodeATC: string;
    stokAwal: number;
    penerimaan: number;
    persediaan: number;
    pemakaian: number;
    stokAkhir: number;
    stokOptimum: number;
    permintaan: number;
}

export interface LPLPOReport {
    id: string; // ATC-Tahun
    bulan: number;
    tahun: number;
    rows: LPLPORow[];
    createdAt: string;
}

export interface StockState {
    obatId: string;
    currentStock: number;
}

export interface POSItem {
    obatId: string;
    jumlah: number;
}

export interface POSTransaction {
    id: string;
    jaringanId: string; // ID unit jaringan yang melakukan transaksi
    namaPasien: string;
    noRM?: string;       // Nomor Rekam Medis (opsional)
    tanggalTransaksi: string;
    items: POSItem[];
    createdAt: string;
}

export interface JaringanStockState {
    obatId: string;
    currentStock: number;
}
