import React, { useState } from "react";
import {
  Star,
  ThumbsUp,
  UserRound,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import s from "./ProductPage.module.css";
export function Stars({ rating }) {
  return (
    <span className={s.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
export default function ProductReviews({ product, reviews }) {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [helpful, setHelpful] = useState([]);
  const filtered = reviews.filter(
    (r) =>
      filter === "All" ||
      (filter === "With photos" ? r.hasPhoto : r.rating === Number(filter[0])),
  );
  const visible = filtered.slice((page - 1) * 3, page * 3);
  const pages = Math.ceil(filtered.length / 3);
  function select(value) {
    setFilter(value);
    setPage(1);
  }
  return (
    <section className={s.section} id="product-reviews">
      <h2 className={s.sectionTitle}>PRODUCT RATINGS</h2>
      <div className={s.reviewSummary}>
        <div>
          <strong>
            {product.rating}
            <small> out of 5</small>
          </strong>
          <Stars rating={Number(product.rating)} />
          <span>{reviews.length} sample reviews</span>
        </div>
        <div
          className={s.reviewFilters}
          role="group"
          aria-label="Filter reviews"
        >
          {[
            "All",
            "5 stars",
            "4 stars",
            "3 stars",
            "2 stars",
            "1 star",
            "With photos",
          ].map((value) => (
            <button
              key={value}
              aria-pressed={filter === value}
              className={filter === value ? s.selectedOption : ""}
              onClick={() => select(value)}
            >
              {value} (
              {
                reviews.filter(
                  (r) =>
                    value === "All" ||
                    (value === "With photos"
                      ? r.hasPhoto
                      : r.rating === Number(value[0])),
                ).length
              }
              )
            </button>
          ))}
        </div>
      </div>
      <div aria-live="polite">
        {visible.length ? (
          visible.map((review) => (
            <article className={s.review} key={review.id}>
              <span className={s.avatar}>
                <UserRound size={20} />
              </span>
              <div>
                <h3>{review.name}</h3>
                <Stars rating={review.rating} />
                <p className={s.reviewMeta}>
                  {review.date} · {review.variant}{" "}
                  <span>
                    <Check size={11} /> Sample purchase
                  </span>
                </p>
                <p>{review.text}</p>
                {review.hasPhoto && (
                  <img
                    className={s.reviewPhoto}
                    src={product.image}
                    alt={`Sample product photo for ${review.variant}`}
                    loading="lazy"
                  />
                )}
                {review.response && (
                  <div className={s.sellerResponse}>
                    <strong>Seller’s response</strong>
                    <p>{review.response}</p>
                  </div>
                )}
                <button
                  className={s.helpful}
                  aria-pressed={helpful.includes(review.id)}
                  onClick={() =>
                    setHelpful((list) =>
                      list.includes(review.id)
                        ? list.filter((id) => id !== review.id)
                        : [...list, review.id],
                    )
                  }
                >
                  <ThumbsUp size={13} />
                  Helpful{helpful.includes(review.id) ? " (1)" : ""}
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className={s.emptyReviews}>
            No sample reviews match this filter. Try another rating.
          </p>
        )}
      </div>
      {pages > 1 && (
        <nav className={s.pagination} aria-label="Review pages">
          <button
            aria-label="Previous review page"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              aria-current={page === i + 1 ? "page" : undefined}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            aria-label="Next review page"
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </section>
  );
}
