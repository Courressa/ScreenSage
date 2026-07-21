/* global process */
import nodemailer from 'nodemailer';

/**
 * Prefer Resend HTTPS API on cloud hosts (Render often times out on SMTP :587).
 * Falls back to SMTP for local/dev when no Resend API key is available.
 */
function getResendApiKey() {
    if (process.env.RESEND_API_KEY) {
        return process.env.RESEND_API_KEY.trim();
    }
    // Common setup: SMTP_HOST=smtp.resend.com, SMTP_PASS=re_xxx
    const host = (process.env.SMTP_HOST || '').toLowerCase();
    const pass = (process.env.SMTP_PASS || '').trim();
    if (host.includes('resend') && pass.startsWith('re_')) {
        return pass;
    }
    return '';
}

export function isEmailConfigured() {
    if (getResendApiKey()) return true;
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    );
}

async function sendViaResendApi({ from, to, subject, html, text }) {
    const apiKey = getResendApiKey();
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject,
            html,
            text,
        }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail =
            data?.message ||
            data?.error?.message ||
            (typeof data?.error === 'string' ? data.error : null) ||
            `Resend API error (${response.status})`;
        throw new Error(detail);
    }
    return data;
}

async function sendViaSmtp({ from, to, subject, html, text }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 20_000,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({ from, to, subject, text, html });
}

const isCloudinaryUrl = (url) => /res\.cloudinary\.com\//i.test(url);

const isVideoUrl = (url) =>
    /\/video\/upload\//i.test(url) ||
    /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);

/**
 * Insert a Cloudinary transformation after /upload/.
 * Example: /upload/w_400/v123/file.jpg
 */
function withCloudinaryTransform(url, transform) {
    if (!url || !isCloudinaryUrl(url) || !transform) return url;
    if (url.includes(`/upload/${transform}/`)) return url;
    return url.replace('/upload/', `/upload/${transform}/`);
}

/** Smaller preview for email clients (images only). */
function previewImageUrl(url) {
    if (isVideoUrl(url)) {
        // First frame of a Cloudinary video as a still preview
        if (isCloudinaryUrl(url)) {
            return withCloudinaryTransform(
                url.replace('/video/upload/', '/video/upload/'),
                'so_0,w_480,h_320,c_fill,q_auto,f_jpg'
            );
        }
        return null;
    }
    if (isCloudinaryUrl(url)) {
        return withCloudinaryTransform(url, 'w_480,c_limit,q_auto,f_auto');
    }
    return url;
}

/**
 * Prefer Cloudinary fl_attachment so many browsers download instead of only opening the file.
 * Email clients vary — some still open in a tab; users can Save As if needed.
 */
function downloadUrl(url, filenameBase) {
    if (!isCloudinaryUrl(url)) return url;

    const safeName = String(filenameBase || 'screensage-wallpaper')
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);

    // fl_attachment:name forces Content-Disposition: attachment on Cloudinary
    return withCloudinaryTransform(url, `fl_attachment:${safeName}`);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderAssetCard(url, title, index) {
    const safeTitle = escapeHtml(title);
    const fileLabel = `${safeTitle} — file ${index + 1}`;
    const video = isVideoUrl(url);
    const thumb = previewImageUrl(url);
    const viewHref = escapeHtml(url);
    const downloadHref = escapeHtml(
        downloadUrl(url, `${title || 'wallpaper'}-${index + 1}`)
    );

    const previewBlock = thumb
        ? `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="text-align:center;">
            <a href="${viewHref}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;max-width:480px;">
              <img
                src="${escapeHtml(thumb)}"
                alt="${fileLabel}"
                width="480"
                style="display:block;margin:0 auto;width:100%;max-width:480px;height:auto;border:0;border-radius:8px;background:#111;"
              />
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="text-align:center;padding-top:0.4rem;">
            <p style="margin:0;font-size:0.8rem;color:#666;text-align:center;">
              ${video ? 'Video preview (first frame). Click to open the full file.' : 'Click the image to preview full size.'}
            </p>
          </td>
        </tr>
      </table>`
        : `
      <p style="margin:0 0 0.5rem;font-size:0.9rem;color:#444;text-align:center;">
        ${video ? 'Video file' : 'File'} ${index + 1} — preview not available for this URL.
      </p>`;

    // Table-based buttons for better email-client support (centered)
    const buttons = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:0.75rem;border-collapse:collapse;">
      <tr>
        <td align="center" style="text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 auto;">
            <tr>
              <td style="padding-right:8px;">
                <a href="${viewHref}" target="_blank" rel="noopener noreferrer"
                   style="display:inline-block;padding:10px 16px;background:#1f2937;color:#ffffff;text-decoration:none;border-radius:6px;font-size:0.875rem;font-weight:600;">
                  ${video ? 'Open video' : 'Preview'}
                </a>
              </td>
              <td>
                <a href="${downloadHref}" target="_blank" rel="noopener noreferrer"
                   style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-size:0.875rem;font-weight:600;">
                  Download
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

    return `
    <div style="margin:0 0 1.25rem;padding:1rem;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa;text-align:center;">
      <p style="margin:0 0 0.75rem;font-size:0.9rem;color:#111;font-weight:600;text-align:center;">
        ${fileLabel}
      </p>
      ${previewBlock}
      ${buttons}
    </div>`;
}

/**
 * Send purchase delivery email with full-gallery previews + download buttons.
 * Returns { sent, message } — never throws for missing SMTP config.
 */
export async function sendPurchaseEmail({ to, order, items }) {
    if (!to) {
        return {
            sent: false,
            message: 'No email address was provided for delivery.',
        };
    }

    if (!isEmailConfigured()) {
        return {
            sent: false,
            message:
                'Email delivery is not configured on the server yet. You can still download your wallpapers below.',
        };
    }

    const from =
        process.env.EMAIL_FROM ||
        process.env.SMTP_USER ||
        'noreply@screensage.local';

    const productBlocks = (items || [])
        .map((item) => {
            const gallery = item.fullGallery || [];
            if (!gallery.length) {
                return `<p style="margin:0 0 1rem;"><strong>${escapeHtml(item.title)}</strong> — no gallery files attached.</p>`;
            }

            const cards = gallery
                .map((url, index) => renderAssetCard(url, item.title, index))
                .join('');

            return `
        <div style="margin-bottom:1.75rem;text-align:center;">
          <h2 style="margin:0 0 0.75rem;font-size:1.05rem;color:#111;text-align:center;">
            ${escapeHtml(item.title)}
          </h2>
          ${cards}
        </div>`;
        })
        .join('');

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:0 auto;">
        <h1 style="font-size:1.35rem;margin:0 0 0.75rem;">Your ScreenSage order is ready</h1>
        <p style="margin:0 0 0.75rem;">Thanks for your purchase. Preview each wallpaper below, then use <strong>Download</strong> to save it.</p>
        <p style="color:#555;font-size:0.9rem;margin:0 0 0.5rem;">
          Order total: <strong>$${Number(order.totalAmount).toFixed(2)}</strong>
          · Reference: <code>${escapeHtml(order._id)}</code>
        </p>
        <p style="color:#666;font-size:0.8rem;margin:0 0 1.25rem;">
          If images look blank, enable “Show images” / “Display external images” in your email app.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 1.25rem;" />
        ${productBlocks}
        <p style="margin-top:0.5rem;color:#555;font-size:0.9rem;">
          You can also use the download button on the checkout success page right after purchase.
        </p>
        <p style="margin-top:1rem;color:#888;font-size:0.8rem;">
          Tip: On some phones, Download opens the file first — use Share → Save Image / Save Video if needed.
        </p>
      </div>
    `;

    const textLines = (items || []).flatMap((item) => {
        const urls = item.fullGallery || [];
        if (!urls.length) return [`${item.title}: (no gallery files)`];
        return [
            `${item.title}:`,
            ...urls.flatMap((url, i) => [
                `  File ${i + 1}`,
                `    Preview: ${url}`,
                `    Download: ${downloadUrl(url, `${item.title}-${i + 1}`)}`,
            ]),
        ];
    });

    const subject = 'Your ScreenSage wallpapers are ready';
    const text = [
        'Thanks for your purchase. Your wallpapers are ready to preview and download.',
        '',
        ...textLines,
    ].join('\n');

    try {
        // HTTPS API avoids SMTP connection timeouts on Render and similar hosts
        if (getResendApiKey()) {
            await sendViaResendApi({ from, to, subject, html, text });
            console.log('Purchase email sent via Resend API to', to);
        } else {
            await sendViaSmtp({ from, to, subject, html, text });
            console.log('Purchase email sent via SMTP to', to);
        }

        return {
            sent: true,
            message: `Delivery email sent to ${to}.`,
        };
    } catch (error) {
        console.error('Purchase email failed:', error.message);
        return {
            sent: false,
            message:
                'We could not send the delivery email. You can still download your wallpapers below.',
        };
    }
}
