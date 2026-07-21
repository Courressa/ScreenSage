/**
 * Download a single remote file via fetch + blob (works for many CDN URLs).
 * Falls back to opening the URL in a new tab if fetch fails (e.g. CORS).
 */
export async function downloadFile(url, filename = 'download') {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const contentType = blob.type || '';
    let finalName = filename;

    if (!/\.[a-z0-9]+$/i.test(finalName)) {
      if (contentType.includes('png')) finalName += '.png';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) finalName += '.jpg';
      else if (contentType.includes('webp')) finalName += '.webp';
      else if (contentType.includes('gif')) finalName += '.gif';
      else if (contentType.includes('mp4')) finalName += '.mp4';
      else if (contentType.includes('webm')) finalName += '.webm';
      else {
        const fromUrl = url.split('?')[0].split('/').pop();
        if (fromUrl && fromUrl.includes('.')) finalName = fromUrl;
      }
    }

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = finalName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
    return false;
  }
}

/**
 * Download multiple purchase assets with a short delay between files
 * so the browser does not block successive downloads.
 */
export async function downloadPurchaseFiles(downloads, { onProgress } = {}) {
  const list = Array.isArray(downloads) ? downloads : [];
  let completed = 0;

  for (const file of list) {
    const name =
      file.filename ||
      file.slug ||
      file.title ||
      `wallpaper-${completed + 1}`;
    await downloadFile(file.url, name);
    completed += 1;
    onProgress?.(completed, list.length);
    if (completed < list.length) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  return completed;
}
