const maxUploadBytes = 4 * 1024 * 1024;
export const maxSourceUploadBytes = 30 * 1024 * 1024;
const maxSourcePixels = 50_000_000;

// Keep requests below the hosting limit while accepting full-size camera images.
export async function prepareUpload(file: File): Promise<Blob> {
  if (file.size > maxSourceUploadBytes)
    throw new Error("Fotoğraf en fazla 30 MB olabilir.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Fotoğraf açılamadı. JPG, PNG veya WebP dosyası seçin.");
  }
  try {
    const pixels = bitmap.width * bitmap.height;
    if (pixels > maxSourcePixels)
      throw new Error("Fotoğraf çözünürlüğü çok yüksek. En fazla 50 megapiksel kullanın.");
    if (file.size <= maxUploadBytes && pixels <= 25_000_000) return file;
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Görsel hazırlanamadı. Daha küçük bir dosya seçin.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.86, 0.72, 0.55]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= maxUploadBytes) return blob;
    }
    throw new Error("Fotoğraf otomatik olarak küçültülemedi. Başka bir fotoğraf deneyin.");
  } finally {
    bitmap.close();
  }
}
