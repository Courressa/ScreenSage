const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const getToken = () => localStorage.getItem('token');

const getAuthHeaders = (includeJson = true) => {
    const headers = {};
    if (includeJson) {
        headers['Content-Type'] = 'application/json';
    }
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

const parseResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
};

const postLogin = async (path, email, password) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    return parseResponse(response);
};

// General user login (any role)
export const loginUser = async (email, password) => {
    return postLogin('/auth/login', email, password);
};

// Admin-only login — server returns 403 for non-admin accounts
export const loginAdmin = async (email, password) => {
    return postLogin('/auth/admin/login', email, password);
};

// ====================== Products ======================
export const uploadMedia = async (formData) => {
    const response = await fetch(`${baseUrl}/products/upload`, {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type header for FormData (browser sets it automatically with boundary)
    });

    return parseResponse(response);
}

export const getProducts = async () => {
    const response = await fetch(`${baseUrl}/products`);
    return parseResponse(response);
};

export const getProductBySlug = async (slug) => {
    const response = await fetch(`${baseUrl}/products/${encodeURIComponent(slug)}`);
    return parseResponse(response);
};

export const createProduct = async (productData) => {
    const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
    });
    return parseResponse(response);
};

export const updateProduct = async (slug, productData) => {
    const response = await fetch(`${baseUrl}/products/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
    });
    return parseResponse(response);
};

export const deleteProduct = async (slug) => {
    const response = await fetch(`${baseUrl}/products/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(false),
    });
    return parseResponse(response);
};

// ====================== Users ======================

export const getUsers = async () => {
    const response = await fetch(`${baseUrl}/users`, {
        headers: getAuthHeaders(false),
    });
    return parseResponse(response);
};

// ====================== Orders ======================

export const createOrder = async (orderData) => {
    const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    });
    return parseResponse(response);
};

export const getOrders = async () => {
    const response = await fetch(`${baseUrl}/orders`, {
        headers: getAuthHeaders(false),
    });
    return parseResponse(response);
};

export const getOrderStats = async () => {
    const response = await fetch(`${baseUrl}/orders/stats`, {
        headers: getAuthHeaders(false),
    });
    return parseResponse(response);
};
