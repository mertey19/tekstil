"use client";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductImage } from "./product-image";
export function ProductGallery({
  images,
}: {
  images: Product["images"];
}) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <ProductImage
          key={images[selected].src}
          src={images[selected].src}
          alt={images[selected].alt}
          priority
          sizes="(max-width: 767px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs" aria-label="Ürün görselleri">
          {images.map((image, i) => (
            <button
              key={image.src}
              aria-label={`${i + 1}. görseli göster`}
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
            >
              <ProductImage src={image.src} alt="" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
