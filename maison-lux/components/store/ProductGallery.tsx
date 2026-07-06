"use client";

import { useState, useRef } from "react";

interface ProductGalleryProps {
  images: { url: string; altText?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex] ?? images[0];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      backgroundImage: `url(${activeImage?.url})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full bg-sand overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {activeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage.url}
            alt={activeImage.altText || productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brown/30 font-serif">
            Maison Lux
          </div>
        )}

        {/* Camada de zoom: aparece só no hover, ampliando a imagem em 200% */}
        {isZooming && activeImage && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              ...zoomStyle,
              backgroundSize: "200%",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-16 h-20 border ${
                idx === activeIndex ? "border-gold" : "border-beige"
              } overflow-hidden`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
