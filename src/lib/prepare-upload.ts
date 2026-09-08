const maxUploadBytes = 4 * 1024 * 1024;

// Keep requests below the hosting limit while accepting full-size camera images.
export async function prepareUpload(file: File): Promise<Blob> {
  if (file.size <= maxUploadBytes) return file;
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 25_000_000)
      throw new Error("En fazla 25 megapiksel büyüklüğünde bir görsel seçin.");
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
    throw new Error("Görsel küçültülemedi. Daha küçük bir dosya seçin.");
  } finally {
    bitmap.close();
  }
}
