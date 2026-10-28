import React, { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  X,
  ZoomIn,
} from "lucide-react";
import s from "./ProductPage.module.css";
export default function ProductGallery({ product, gallery, onMessage, liked = false, likeCount = 0, onToggleLike }) {
  const [active, setActive] = useState(0);
  const dialog = useRef(null);
  const safeGallery =
    Array.isArray(gallery) && gallery.length > 0
      ? gallery
      : [{ label: "Overview", scale: 1, position: "center" }];
  const current = safeGallery[active] || safeGallery[0];
  const prodImg =
    product?.image ||
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85";
  const prodTitle = product?.title || "Product";

  function change(delta) {
    setActive((index) => (index + delta + safeGallery.length) % safeGallery.length);
  }
  async function share() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        onMessage("Product link copied.");
      } else onMessage(`Share this product: ${window.location.href}`);
    } catch {
      onMessage(`Share this product: ${window.location.href}`);
    }
  }
  return (
    <section className={s.gallery} aria-label="Product gallery">
      <button
        className={s.mainImage}
        onClick={() => dialog.current.showModal()}
        aria-label="Enlarge product image"
      >
        <img
          src={prodImg}
          alt={`${prodTitle} — ${current.label}`}
          style={{
            transform: `scale(${current.scale})`,
            objectPosition: current.position,
          }}
        />
        <span className={s.imageLabel}>
          <ZoomIn size={14} /> {current.label}
        </span>
      </button>
      <div className={s.thumbnails}>
        <button
          className={s.galleryArrow}
          aria-label="Previous image"
          onClick={() => change(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        {safeGallery.map((item, index) => (
          <button
            key={item.label}
            className={active === index ? s.activeThumb : ""}
            aria-label={`Show ${item.label.toLowerCase()}`}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            <img
              src={prodImg}
              alt={item.label}
              style={{
                transform: `scale(${item.scale})`,
                objectPosition: item.position,
              }}
            />
          </button>
        ))}
        <button
          className={s.galleryArrow}
          aria-label="Next image"
          onClick={() => change(1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className={s.galleryActions}>
        <button onClick={share}>
          <Share2 size={16} />
          Share
        </button>
        <span />
        <button aria-pressed={liked} onClick={onToggleLike}>
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
          {liked ? "Saved to favorites" : "Save to favorites"}{likeCount ? ` · ${likeCount}` : ""}
        </button>
      </div>
      <dialog
        ref={dialog}
        className={s.imageDialog}
        aria-label="Enlarged product image"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current.close();
        }}
      >
        <button
          className={s.closeDialog}
          aria-label="Close enlarged image"
          onClick={() => dialog.current.close()}
        >
          <X size={22} />
        </button>
        <div className={s.expandedImage}>
          <img
            src={prodImg}
            alt={`${prodTitle} — ${current.label}`}
            style={{
              transform: `scale(${current.scale})`,
              objectPosition: current.position,
            }}
          />
        </div>
        <div className={s.expandedControls}>
          <button
            aria-label="Previous enlarged image"
            onClick={() => change(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <span>
            {current.label} · {active + 1} / {safeGallery.length}
          </span>
          <button aria-label="Next enlarged image" onClick={() => change(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </dialog>
    </section>
  );
}
