/* global process */

const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const LIVE_BASE = "https://api-m.paypal.com";

const getBaseUrl = () => {
    const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
    return mode === "live" ? LIVE_BASE : SANDBOX_BASE;
};

const getCredentials = () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error(
            "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET."
        );
    }
    return { clientId, clientSecret };
};

/**
 * OAuth2 access token (cached until near expiry).
 */
let cachedToken = null;
let tokenExpiresAt = 0;

export async function getPayPalAccessToken() {
    const now = Date.now();
    if (cachedToken && now < tokenExpiresAt - 60_000) {
        return cachedToken;
    }

    const { clientId, clientSecret } = getCredentials();
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        console.error("PayPal auth failed:", data);
        throw new Error(data.error_description || "Failed to authenticate with PayPal.");
    }

    cachedToken = data.access_token;
    tokenExpiresAt = now + (Number(data.expires_in) || 300) * 1000;
    return cachedToken;
}

/**
 * Create a PayPal Checkout order for a cart total (USD).
 * @param {{ totalAmount: number, currency?: string, description?: string }} params
 * @returns {Promise<{ id: string, status: string }>}
 */
export async function createPayPalOrder({ totalAmount, currency = "USD", description }) {
    const token = await getPayPalAccessToken();
    const value = Number(totalAmount).toFixed(2);

    const response = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    description: description || "ScreenSage wallpapers",
                    amount: {
                        currency_code: currency,
                        value,
                    },
                },
            ],
            application_context: {
                brand_name: "ScreenSage",
                shipping_preference: "NO_SHIPPING",
                user_action: "PAY_NOW",
            },
        }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        console.error("PayPal create order failed:", data);
        const detail = data?.details?.[0]?.description || data?.message;
        throw new Error(detail || "Failed to create PayPal order.");
    }

    return data;
}

/**
 * Capture an approved PayPal order.
 * @param {string} paypalOrderId
 */
export async function capturePayPalOrder(paypalOrderId) {
    const token = await getPayPalAccessToken();

    const response = await fetch(
        `${getBaseUrl()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Prefer: "return=representation",
            },
        }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        console.error("PayPal capture failed:", data);
        const detail = data?.details?.[0]?.description || data?.message;
        throw new Error(detail || "Failed to capture PayPal payment.");
    }

    return data;
}

/**
 * Sum captured amount from a capture response.
 */
export function getCapturedAmount(captureResult) {
    const units = captureResult?.purchase_units || [];
    let total = 0;
    for (const unit of units) {
        const captures = unit?.payments?.captures || [];
        for (const cap of captures) {
            if (cap?.status === "COMPLETED" || cap?.status === "PENDING") {
                total += Number(cap?.amount?.value || 0);
            }
        }
    }
    return total;
}

export function isPayPalConfigured() {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}
