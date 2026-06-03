import { create } from 'zustand';
import type { MasterObat, MasterJaringan, MasterPenyedia } from '../types';
import { ApiService } from '../services/api.service';

interface MasterState {
    obat: MasterObat[];
    jaringan: MasterJaringan[];
    penyedia: MasterPenyedia[];
    activeJaringanId: string | null;

    // Actions
    setActiveJaringanId: (id: string | null) => void;
    fetchObat: () => Promise<void>;
    addObat: (data: Omit<MasterObat, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    bulkAddObat: (data: Omit<MasterObat, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
    updateObat: (id: string, data: Partial<MasterObat>) => Promise<void>;
    deleteObat: (id: string) => Promise<void>;

    fetchJaringan: () => Promise<void>;
    addJaringan: (data: Omit<MasterJaringan, 'id' | 'createdAt'>) => Promise<void>;
    bulkAddJaringan: (data: Omit<MasterJaringan, 'id' | 'createdAt'>[]) => Promise<void>;
    updateJaringan: (id: string, data: Partial<MasterJaringan>) => Promise<void>;
    deleteJaringan: (id: string) => Promise<void>;

    fetchPenyedia: () => Promise<void>;
    addPenyedia: (data: Omit<MasterPenyedia, 'id' | 'createdAt'>) => Promise<void>;
    bulkAddPenyedia: (data: Omit<MasterPenyedia, 'id' | 'createdAt'>[]) => Promise<void>;
    updatePenyedia: (id: string, data: Partial<MasterPenyedia>) => Promise<void>;
    deletePenyedia: (id: string) => Promise<void>;
}

export const useMasterStore = create<MasterState>((set) => ({
    obat: [],
    jaringan: [],
    penyedia: [],
    activeJaringanId: null,

    setActiveJaringanId: (id) => set({ activeJaringanId: id }),

    fetchObat: async () => {
        try {
            const data = await ApiService.get<MasterObat[]>('/obat');
            set({ obat: data });
        } catch (error) {
            console.error('Failed to fetch obat:', error);
        }
    },
    addObat: async (data) => {
        try {
            const newItem = await ApiService.post<MasterObat>('/obat', data);
            set((state) => ({ obat: [...state.obat, newItem] }));
        } catch (error) {
            console.error('Failed to add obat:', error);
        }
    },
    bulkAddObat: async (data) => {
        try {
            const newItems = await ApiService.post<MasterObat[]>('/obat/bulk', data);
            set((state) => ({ obat: [...state.obat, ...newItems] }));
        } catch (error) {
            console.error('Failed to bulk add obat:', error);
        }
    },
    updateObat: async (id, data) => {
        try {
            const updated = await ApiService.put<MasterObat>(`/obat/${id}`, data);
            set((state) => ({
                obat: state.obat.map((item) => (item.id === id ? updated : item)),
            }));
        } catch (error) {
            console.error('Failed to update obat:', error);
        }
    },
    deleteObat: async (id) => {
        try {
            await ApiService.delete(`/obat/${id}`);
            set((state) => ({ obat: state.obat.filter((item) => item.id !== id) }));
        } catch (error) {
            console.error('Failed to delete obat:', error);
        }
    },

    fetchJaringan: async () => {
        try {
            const data = await ApiService.get<MasterJaringan[]>('/jaringan');
            set({ jaringan: data });
        } catch (error) {
            console.error('Failed to fetch jaringan:', error);
        }
    },
    addJaringan: async (data) => {
        try {
            const newItem = await ApiService.post<MasterJaringan>('/jaringan', data);
            set((state) => ({ jaringan: [...state.jaringan, newItem] }));
        } catch (error) {
            console.error('Failed to add jaringan:', error);
        }
    },
    bulkAddJaringan: async (data) => {
        try {
            const newItems = await ApiService.post<MasterJaringan[]>('/jaringan/bulk', data);
            set((state) => ({ jaringan: [...state.jaringan, ...newItems] }));
        } catch (error) {
            console.error('Failed to bulk add jaringan:', error);
        }
    },
    updateJaringan: async (id, data) => {
        try {
            const updated = await ApiService.put<MasterJaringan>(`/jaringan/${id}`, data);
            set((state) => ({
                jaringan: state.jaringan.map((item) => (item.id === id ? updated : item)),
            }));
        } catch (error) {
            console.error('Failed to update jaringan:', error);
        }
    },
    deleteJaringan: async (id) => {
        try {
            await ApiService.delete(`/jaringan/${id}`);
            set((state) => ({ jaringan: state.jaringan.filter((item) => item.id !== id) }));
        } catch (error) {
            console.error('Failed to delete jaringan:', error);
        }
    },

    fetchPenyedia: async () => {
        try {
            const data = await ApiService.get<MasterPenyedia[]>('/penyedia');
            set({ penyedia: data });
        } catch (error) {
            console.error('Failed to fetch penyedia:', error);
        }
    },
    addPenyedia: async (data) => {
        try {
            const newItem = await ApiService.post<MasterPenyedia>('/penyedia', data);
            set((state) => ({ penyedia: [...state.penyedia, newItem] }));
        } catch (error) {
            console.error('Failed to add penyedia:', error);
        }
    },
    bulkAddPenyedia: async (data) => {
        try {
            const newItems = await ApiService.post<MasterPenyedia[]>('/penyedia/bulk', data);
            set((state) => ({ penyedia: [...state.penyedia, ...newItems] }));
        } catch (error) {
            console.error('Failed to bulk add penyedia:', error);
        }
    },
    updatePenyedia: async (id, data) => {
        try {
            const updated = await ApiService.put<MasterPenyedia>(`/penyedia/${id}`, data);
            set((state) => ({
                penyedia: state.penyedia.map((item) => (item.id === id ? updated : item)),
            }));
        } catch (error) {
            console.error('Failed to update penyedia:', error);
        }
    },
    deletePenyedia: async (id) => {
        try {
            await ApiService.delete(`/penyedia/${id}`);
            set((state) => ({ penyedia: state.penyedia.filter((item) => item.id !== id) }));
        } catch (error) {
            console.error('Failed to delete penyedia:', error);
        }
    },
}));
