export const API_URL = 'http://localhost:8000/api';

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export async function fetchMenu() {
    const res = await fetch(`${API_URL}/menu/`, {
        headers: getHeaders(),
    });
    if (!res.ok) {
        throw new Error('Failed to fetch menu');
    }
    return res.json();
}

export async function createOrder(items: number[], vendorId: number) {
    const res = await fetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ items, vendor_id: vendorId }),
    });
    if (!res.ok) {
        throw new Error('Failed to create order');
    }
    return res.json();
}

export async function fetchOrders() {
    const res = await fetch(`${API_URL}/orders/`, {
        headers: getHeaders(),
    });
    if (!res.ok) {
        throw new Error('Failed to fetch orders');
    }
    return res.json();
}

export async function predictTime(items: number[], vendorId: number) {
    const res = await fetch(`${API_URL}/predict/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ items, vendor_id: vendorId }),
    });
    if (!res.ok) {
        throw new Error('Failed to predict time');
    }
    return res.json();
}

export async function createMenuItem(item: { name: string; price: number; description: string; prep_time_estimate: number; image_url?: string }) {
    const res = await fetch(`${API_URL}/menu/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(item),
    });
    if (!res.ok) {
        throw new Error('Failed to create menu item');
    }
    return res.json();
}

export async function updateOrderStatus(orderId: number, status: string) {
    const res = await fetch(`${API_URL}/orders/${orderId}/status?status=${status}`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    if (!res.ok) {
        throw new Error('Failed to update order status');
    }
    return res.json();
}

export async function updateMenuItem(itemId: number, data: any) {
    const res = await fetch(`${API_URL}/menu/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error('Failed to update menu item');
    }
    return res.json();
}

export async function fetchOrderByToken(token: number) {
    const res = await fetch(`${API_URL}/orders/token/${token}`, {
        headers: getHeaders(),
    });
    if (!res.ok) {
        throw new Error('Order not found');
    }
    return res.json();
}
