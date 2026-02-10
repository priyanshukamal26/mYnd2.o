const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TOKEN_KEY = 'mynd_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || `Request failed: ${res.status}`);
    }

    return res.json();
}

// Auth
export interface AuthResponse {
    token: string;
    user: { id: string; email: string; profile: Profile | null };
}

export interface Profile {
    id: string;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    constraints: string | null;
    university: string | null;
    major: string | null;
    yearOfStudy: string | null;
}

export interface UserInfo {
    id: string;
    email: string;
    profile: Profile | null;
}

export const api = {
    auth: {
        register: (email: string, password: string, firstName: string, lastName: string) =>
            request<AuthResponse>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, firstName, lastName }),
            }),
        login: (email: string, password: string) =>
            request<AuthResponse>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
        me: () => request<UserInfo>('/api/auth/me'),
        updateProfile: (data: Partial<Profile>) =>
            request<Profile>('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
    },

    tasks: {
        list: () => request<any[]>('/api/tasks'),
        create: (data: any) =>
            request<any>('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: string, data: any) =>
            request<any>(`/api/tasks/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            request<{ success: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),
    },

    settings: {
        get: () => request<any>('/api/settings'),
        update: (data: any) =>
            request<any>('/api/settings', {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
    },

    learning: {
        list: () => request<any[]>('/api/learning'),
        upsert: (category: string, data: any) =>
            request<any>(`/api/learning/${category}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        reset: () => request<{ success: boolean }>('/api/learning', { method: 'DELETE' }),
    },
};
