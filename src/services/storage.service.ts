const STORAGE_PREFIX = 'sipot_v1_';

export const StorageKeys = {
    OBAT: `${STORAGE_PREFIX}master_obat`,
    JARINGAN: `${STORAGE_PREFIX}master_jaringan`,
    PENYEDIA: `${STORAGE_PREFIX}master_penyedia`,
    PENERIMAAN: `${STORAGE_PREFIX}transaction_penerimaan`,
    DISTRIBUSI: `${STORAGE_PREFIX}transaction_distribusi`,
    LPLPO: `${STORAGE_PREFIX}reports_lplpo`,
    POS: `${STORAGE_PREFIX}transaction_pos`,
};

export class StorageService {
    static getAll<T>(key: string): T[] {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    static getById<T extends { id: string }>(key: string, id: string): T | undefined {
        const items = this.getAll<T>(key);
        return items.find(item => item.id === id);
    }

    static create<T extends { id?: string; createdAt?: string }>(key: string, item: T): T {
        const items = this.getAll<T>(key);
        const newItem = {
            ...item,
            id: item.id || crypto.randomUUID(),
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        items.push(newItem as T);
        localStorage.setItem(key, JSON.stringify(items));
        return newItem as T;
    }

    static bulkCreate<T extends { id?: string; createdAt?: string }>(key: string, newItems: T[]): T[] {
        const items = this.getAll<T>(key);
        const processedItems = newItems.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
        const allItems = [...items, ...processedItems];
        localStorage.setItem(key, JSON.stringify(allItems));
        return processedItems as T[];
    }

    static update<T extends { id: string; updatedAt?: string }>(key: string, id: string, updates: Partial<T>): T {
        const items = this.getAll<T>(key);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) throw new Error(`Item with id ${id} not found in ${key}`);

        const updatedItem = {
            ...items[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        items[index] = updatedItem;
        localStorage.setItem(key, JSON.stringify(items));
        return updatedItem;
    }

    static delete(key: string, id: string): void {
        const items = this.getAll<{ id: string }>(key);
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filteredItems));
    }

    static clear(key: string): void {
        localStorage.removeItem(key);
    }
}
