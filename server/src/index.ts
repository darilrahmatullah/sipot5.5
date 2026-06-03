import express from 'express';
import cors from 'cors';
import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { obat, jaringan, penyedia, penerimaan, distribusi, posTransaction, posItem } from './db/schema.js';
import crypto from 'crypto';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// === MASTER OBAT ===
app.get('/api/obat', async (req, res) => {
    try {
        const result = await db.select().from(obat);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/obat', async (req, res) => {
    try {
        const data = req.body;
        const newItem = {
            ...data,
            id: data.id || crypto.randomUUID(),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
        };
        await db.insert(obat).values(newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/obat/bulk', async (req, res) => {
    try {
        const items = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Body must be an array' });
        }
        const processedItems = items.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
        }));
        if (processedItems.length > 0) {
            await db.insert(obat).values(processedItems);
        }
        res.status(201).json(processedItems);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/obat/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = {
            ...data,
            updatedAt: new Date().toISOString(),
        };
        await db.update(obat).set(updated).where(eq(obat.id, id));
        const result = await db.select().from(obat).where(eq(obat.id, id));
        res.json(result[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/obat/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(obat).where(eq(obat.id, id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// === MASTER JARINGAN ===
app.get('/api/jaringan', async (req, res) => {
    try {
        const result = await db.select().from(jaringan);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/jaringan', async (req, res) => {
    try {
        const data = req.body;
        const newItem = {
            ...data,
            id: data.id || crypto.randomUUID(),
            createdAt: data.createdAt || new Date().toISOString(),
        };
        await db.insert(jaringan).values(newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/jaringan/bulk', async (req, res) => {
    try {
        const items = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Body must be an array' });
        }
        const processedItems = items.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            createdAt: item.createdAt || new Date().toISOString(),
        }));
        if (processedItems.length > 0) {
            await db.insert(jaringan).values(processedItems);
        }
        res.status(201).json(processedItems);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/jaringan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await db.update(jaringan).set(data).where(eq(jaringan.id, id));
        const result = await db.select().from(jaringan).where(eq(jaringan.id, id));
        res.json(result[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/jaringan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(jaringan).where(eq(jaringan.id, id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// === MASTER PENYEDIA ===
app.get('/api/penyedia', async (req, res) => {
    try {
        const result = await db.select().from(penyedia);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/penyedia', async (req, res) => {
    try {
        const data = req.body;
        const newItem = {
            ...data,
            id: data.id || crypto.randomUUID(),
            createdAt: data.createdAt || new Date().toISOString(),
        };
        await db.insert(penyedia).values(newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/penyedia/bulk', async (req, res) => {
    try {
        const items = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Body must be an array' });
        }
        const processedItems = items.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            createdAt: item.createdAt || new Date().toISOString(),
        }));
        if (processedItems.length > 0) {
            await db.insert(penyedia).values(processedItems);
        }
        res.status(201).json(processedItems);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/penyedia/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await db.update(penyedia).set(data).where(eq(penyedia.id, id));
        const result = await db.select().from(penyedia).where(eq(penyedia.id, id));
        res.json(result[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/penyedia/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(penyedia).where(eq(penyedia.id, id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// === TRANSACTION PENERIMAAN ===
app.get('/api/penerimaan', async (req, res) => {
    try {
        const result = await db.select().from(penerimaan);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/penerimaan', async (req, res) => {
    try {
        const data = req.body;
        const newItem = {
            ...data,
            id: data.id || crypto.randomUUID(),
            createdAt: data.createdAt || new Date().toISOString(),
        };
        await db.insert(penerimaan).values(newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/penerimaan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(penerimaan).where(eq(penerimaan.id, id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// === TRANSACTION DISTRIBUSI ===
app.get('/api/distribusi', async (req, res) => {
    try {
        const result = await db.select().from(distribusi);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/distribusi', async (req, res) => {
    try {
        const data = req.body;
        const newItem = {
            ...data,
            id: data.id || crypto.randomUUID(),
            createdAt: data.createdAt || new Date().toISOString(),
        };
        await db.insert(distribusi).values(newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/distribusi/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(distribusi).where(eq(distribusi.id, id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// === TRANSACTION POS ===
app.get('/api/pos', async (req, res) => {
    try {
        const txs = await db.select().from(posTransaction);
        const items = await db.select().from(posItem);
        const result = txs.map(tx => ({
            ...tx,
            items: items.filter(item => item.transactionId === tx.id).map(item => ({
                obatId: item.obatId,
                jumlah: item.jumlah
            }))
        }));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pos', async (req, res) => {
    try {
        const data = req.body;
        const { items, ...txData } = data;
        const transactionId = txData.id || crypto.randomUUID();
        const newTx = {
            ...txData,
            id: transactionId,
            createdAt: txData.createdAt || new Date().toISOString(),
        };
        
        // Insert transaction record
        await db.insert(posTransaction).values(newTx);
        
        // Insert items
        const newItems = items.map((item: any) => ({
            id: crypto.randomUUID(),
            transactionId,
            obatId: item.obatId,
            jumlah: item.jumlah,
        }));
        if (newItems.length > 0) {
            await db.insert(posItem).values(newItems);
        }
        
        res.status(201).json({
            ...newTx,
            items
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/pos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(posTransaction).where(eq(posTransaction.id, id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
