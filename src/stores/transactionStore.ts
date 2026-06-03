import { create } from 'zustand';
import type { Penerimaan, Distribusi, StockState, POSTransaction, JaringanStockState } from '../types';
import { ApiService } from '../services/api.service';

interface TransactionState {
    penerimaan: Penerimaan[];
    distribusi: Distribusi[];
    stocks: StockState[];
    posTransactions: POSTransaction[];

    // Actions
    fetchPenerimaan: () => Promise<void>;
    addPenerimaan: (data: Omit<Penerimaan, 'id' | 'createdAt'>) => Promise<void>;
    deletePenerimaan: (id: string) => Promise<void>;

    fetchDistribusi: () => Promise<void>;
    addDistribusi: (data: Omit<Distribusi, 'id' | 'createdAt'>) => Promise<void>;
    deleteDistribusi: (id: string) => Promise<void>;

    calculateStocks: () => void;
    getStockByObatId: (obatId: string) => number;

    fetchPOSTransactions: () => Promise<void>;
    addPOSTransaction: (data: Omit<POSTransaction, 'id' | 'createdAt'>) => Promise<void>;
    deletePOSTransaction: (id: string) => Promise<void>;
    getNetworkStock: (jaringanId: string, obatId: string) => number;
    getNetworkStockList: (jaringanId: string) => JaringanStockState[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
    penerimaan: [],
    distribusi: [],
    stocks: [],
    posTransactions: [],

    fetchPenerimaan: async () => {
        try {
            const data = await ApiService.get<Penerimaan[]>('/penerimaan');
            set({ penerimaan: data });
            get().calculateStocks();
        } catch (error) {
            console.error('Failed to fetch penerimaan:', error);
        }
    },

    addPenerimaan: async (data) => {
        try {
            const newItem = await ApiService.post<Penerimaan>('/penerimaan', data);
            set((state) => ({ penerimaan: [...state.penerimaan, newItem] }));
            get().calculateStocks();
        } catch (error) {
            console.error('Failed to add penerimaan:', error);
        }
    },

    deletePenerimaan: async (id) => {
        try {
            await ApiService.delete(`/penerimaan/${id}`);
            set((state) => ({ penerimaan: state.penerimaan.filter((item) => item.id !== id) }));
            get().calculateStocks();
        } catch (error) {
            console.error('Failed to delete penerimaan:', error);
        }
    },

    fetchDistribusi: async () => {
        try {
            const data = await ApiService.get<Distribusi[]>('/distribusi');
            set({ distribusi: data });
            get().calculateStocks();
        } catch (error) {
            console.error('Failed to fetch distribusi:', error);
        }
    },

    addDistribusi: async (data) => {
        // Validate stock before adding
        const currentStock = get().getStockByObatId(data.obatId);
        if (currentStock < data.jumlah) {
            throw new Error(`Stok tidak mencukupi. Stok saat ini: ${currentStock}`);
        }

        try {
            const newItem = await ApiService.post<Distribusi>('/distribusi', data);
            set((state) => ({ distribusi: [...state.distribusi, newItem] }));
            get().calculateStocks();
        } catch (error) {
            console.error('Failed to add distribusi:', error);
            throw error;
        }
    },

    deleteDistribusi: async (id) => {
        try {
            await ApiService.delete(`/distribusi/${id}`);
            set((state) => ({ distribusi: state.distribusi.filter((item) => item.id !== id) }));
            get().calculateStocks();
        } catch (error) {
            console.error('Failed to delete distribusi:', error);
        }
    },

    calculateStocks: () => {
        const { penerimaan, distribusi } = get();
        const stockMap = new Map<string, number>();

        penerimaan.forEach((p) => {
            stockMap.set(p.obatId, (stockMap.get(p.obatId) || 0) + Number(p.jumlah));
        });

        distribusi.forEach((d) => {
            stockMap.set(d.obatId, (stockMap.get(d.obatId) || 0) - Number(d.jumlah));
        });

        const stocks: StockState[] = Array.from(stockMap.entries()).map(([obatId, currentStock]) => ({
            obatId,
            currentStock,
        }));

        set({ stocks });
    },

    getStockByObatId: (obatId) => {
        const stock = get().stocks.find((s) => s.obatId === obatId);
        return stock ? stock.currentStock : 0;
    },

    fetchPOSTransactions: async () => {
        try {
            const data = await ApiService.get<POSTransaction[]>('/pos');
            set({ posTransactions: data });
        } catch (error) {
            console.error('Failed to fetch POS transactions:', error);
        }
    },

    addPOSTransaction: async (data) => {
        // Validate stock of each item in the transaction
        const { getNetworkStock } = get();
        data.items.forEach(item => {
            const stock = getNetworkStock(data.jaringanId, item.obatId);
            if (stock < item.jumlah) {
                throw new Error(`Stok tidak mencukupi untuk obat ini. Stok tersedia: ${stock}`);
            }
        });

        try {
            const newItem = await ApiService.post<POSTransaction>('/pos', data);
            set((state) => ({ posTransactions: [...state.posTransactions, newItem] }));
        } catch (error) {
            console.error('Failed to add POS transaction:', error);
            throw error;
        }
    },

    deletePOSTransaction: async (id) => {
        try {
            await ApiService.delete(`/pos/${id}`);
            set((state) => ({ posTransactions: state.posTransactions.filter((item) => item.id !== id) }));
        } catch (error) {
            console.error('Failed to delete POS transaction:', error);
        }
    },

    getNetworkStock: (jaringanId, obatId) => {
        const { distribusi, posTransactions } = get();
        const inflow = distribusi
            .filter(d => d.tujuanJaringanId === jaringanId && d.obatId === obatId)
            .reduce((sum, d) => sum + Number(d.jumlah), 0);
        
        const outflow = posTransactions
            .filter(p => p.jaringanId === jaringanId)
            .reduce((sum, p) => {
                const item = p.items.find(i => i.obatId === obatId);
                return sum + (item ? Number(item.jumlah) : 0);
            }, 0);

        return inflow - outflow;
    },

    getNetworkStockList: (jaringanId) => {
        const { distribusi } = get();
        const obatIds = Array.from(new Set(
            distribusi
                .filter(d => d.tujuanJaringanId === jaringanId)
                .map(d => d.obatId)
        ));
        return obatIds.map(obatId => ({
            obatId,
            currentStock: get().getNetworkStock(jaringanId, obatId)
        }));
    },
}));
