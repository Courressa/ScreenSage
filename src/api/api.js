const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const loginUser = async (email, password) => {
    const urlToFetch = `${baseUrl}/auth/login`;

    try {
        const response = await fetch(urlToFetch, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: email, password: password})
        })

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log("Login Response: ", jsonResponse)
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }
        
    } catch (error) {
        console.log("Login Issue: ", error);
    }
}