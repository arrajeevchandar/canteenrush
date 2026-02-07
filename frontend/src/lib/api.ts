export const API_URL = 'http://127.0.0.1:8000/api';

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

async function handleRequest(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...getHeaders(),
            ...options.headers,
        },
    });

    if (res.status === 401) {
        // Token expired or invalid
        localStorage.clear();
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'API request failed');
    }

    return res.json();
}

export async function fetchMenu() {
    return handleRequest(`${API_URL}/menu/`);
}

export async function createOrder(items: number[], vendorId: number) {
    return handleRequest(`${API_URL}/orders/`, {
        method: 'POST',
        body: JSON.stringify({ items, vendor_id: vendorId }),
    });
}

export async function fetchOrders() {
    return handleRequest(`${API_URL}/orders/`);
}

export async function predictTime(items: number[], vendorId: number) {
    return handleRequest(`${API_URL}/predict/`, {
        method: 'POST',
        body: JSON.stringify({ items, vendor_id: vendorId }),
    });
}

export async function createMenuItem(item: { name: string; price: number; description: string; prep_time_estimate: number }) {
    return handleRequest(`${API_URL}/menu/`, {
        method: 'POST',
        body: JSON.stringify(item),
    });
}

export async function updateOrderStatus(orderId: number, status: string) {
    return handleRequest(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
}

export async function updateMenuItem(itemId: number, update: any) {
    return handleRequest(`${API_URL}/menu/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(update),
    });
}

export async function fetchOrderByToken(token: number) {
    return handleRequest(`${API_URL}/orders/by-token/${token}`);
}
