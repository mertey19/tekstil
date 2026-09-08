"use client";
import Image from "next/image";
import { useState } from "react";
export function ProductImage({
  src,
  alt,
  priority = false,
  eager = false,
  sizes = "(max-width: 600px) 50vw, (max-width: 1000px) 50vw, 25vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  eager?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div className="image-fallback" role="img" aria-label={alt}>
        <span>Görsel hazırlanıyor</span>
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="product-image"
      priority={priority}
      loading={eager ? "eager" : undefined}
      onError={() => setFailed(true)}
    />
  );
}
