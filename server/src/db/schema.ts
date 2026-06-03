import { pgTable, text, integer, jsonb } from 'drizzle-orm/pg-core';

export const obat = pgTable('obat', {
    id: text('id').primaryKey(),
    kodeATC: text('kode_atc').notNull(),
    nama: text('nama').notNull(),
    satuan: text('satuan').notNull(), // 'Tablet' | 'Kapsul' | 'Botol' | etc.
    stokOptimum: integer('stok_optimum').notNull(),
    stokMinimum: integer('stok_minimum').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
});

export const jaringan = pgTable('jaringan', {
    id: text('id').primaryKey(),
    nama: text('nama').notNull(),
    alamat: text('alamat'),
    kategori: text('kategori').notNull(), // 'Apotek' | 'Puskesmas' | 'Unit'
    createdAt: text('created_at').notNull(),
});

export const penyedia = pgTable('penyedia', {
    id: text('id').primaryKey(),
    nama: text('nama').notNull(),
    kontak: text('kontak'),
    alamat: text('alamat'),
    createdAt: text('created_at').notNull(),
});

export const penerimaan = pgTable('penerimaan', {
    id: text('id').primaryKey(),
    obatId: text('obat_id').notNull().references(() => obat.id, { onDelete: 'cascade' }),
    jumlah: integer('jumlah').notNull(),
    batchNumber: text('batch_number').notNull(),
    tanggalED: text('tanggal_ed').notNull(),
    penyediaId: text('penyedia_id').notNull().references(() => penyedia.id, { onDelete: 'cascade' }),
    nomorFaktur: text('nomor_faktur').notNull(),
    tanggalMasuk: text('tanggal_masuk').notNull(),
    dokumen: jsonb('dokumen'), // UploadedDocument object
    createdAt: text('created_at').notNull(),
});

export const distribusi = pgTable('distribusi', {
    id: text('id').primaryKey(),
    tujuanJaringanId: text('tujuan_jaringan_id').notNull().references(() => jaringan.id, { onDelete: 'cascade' }),
    obatId: text('obat_id').notNull().references(() => obat.id, { onDelete: 'cascade' }),
    jumlah: integer('jumlah').notNull(),
    tanggalDistribusi: text('tanggal_distribusi').notNull(),
    nomorPermintaan: text('nomor_permintaan').notNull(),
    dokumen: jsonb('dokumen'), // UploadedDocument object
    createdAt: text('created_at').notNull(),
});

export const posTransaction = pgTable('pos_transaction', {
    id: text('id').primaryKey(),
    jaringanId: text('jaringan_id').notNull().references(() => jaringan.id, { onDelete: 'cascade' }),
    namaPasien: text('nama_pasien').notNull(),
    noRM: text('no_rm'),
    tanggalTransaksi: text('tanggal_transaksi').notNull(),
    createdAt: text('created_at').notNull(),
});

export const posItem = pgTable('pos_item', {
    id: text('id').primaryKey(),
    transactionId: text('transaction_id').notNull().references(() => posTransaction.id, { onDelete: 'cascade' }),
    obatId: text('obat_id').notNull().references(() => obat.id, { onDelete: 'cascade' }),
    jumlah: integer('jumlah').notNull(),
});
