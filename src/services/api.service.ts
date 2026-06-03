const API_URL = 'http://localhost:3001/api';

export class ApiService {
    static async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Unknown API error' }));
            throw new Error(err.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    static get<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'GET' });
    }

    static post<T>(path: string, body: any): Promise<T> {
        return this.request<T>(path, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    static put<T>(path: string, body: any): Promise<T> {
        return this.request<T>(path, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    static delete<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'DELETE' });
    }
}
