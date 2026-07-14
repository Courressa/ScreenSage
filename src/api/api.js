const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const postLogin = async (path, email, password) => {
    const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

// General user login (any role)
export const loginUser = async (email, password) => {
    return postLogin('/auth/login', email, password);
};

// Admin-only login — server returns 403 for non-admin accounts
export const loginAdmin = async (email, password) => {
    return postLogin('/auth/admin/login', email, password);
};