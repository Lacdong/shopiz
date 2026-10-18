import React, { useEffect, useState } from "react";
import { Filter, ChevronDown, Star, X } from "lucide-react";
import { searchCategories, searchLocations, searchBrands } from "./searchUtils";
import s from "./SearchResultsPage.module.css";
export default function SearchFilters({ params, update, clear, onClose }) {
  const [min, setMin] = useState(params.get("min") || "");
  const [max, setMax] = useState(params.get("max") || "");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const minParam = params.get("min") || "";
  const maxParam = params.get("max") || "";
  useEffect(() => {
    setMin(minParam);
    setMax(maxParam);
    setError("");
  }, [minParam, maxParam]);
  function apply(e) {
    e.preventDefault();
    if (
      (min && (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
      (max && (!Number.isFinite(Number(max)) || Number(max) < 0))
    ) {
      setError("Enter a valid non-negative price.");
      return;
    }
    if (min && max && Number(min) > Number(max)) {
      setError("Minimum price must not exceed maximum price.");
      return;
    }
    setError("");
    update({ min, max });
  }
  function checkbox(key, value, label = value) {
    return (
      <label key={value} className={s.filterOption}>
        <input
          type="checkbox"
          checked={params.getAll(key).includes(value)}
          onChange={() => update({ [key]: value }, true)}
        />
        {label}
      </label>
    );
  }
  return (
    <>
      <div className={s.filterHeading}>
        <Filter size={15} />
        <h2>SEARCH FILTERS</h2>
        <button onClick={onClose} aria-label="Close filters">
          <X size={17} />
        </button>
      </div>
      <fieldset>
        <legend>By Category</legend>
        {(expanded ? searchCategories : searchCategories.slice(0, 5)).map(
          (name) => checkbox("category", name),
        )}
        {searchCategories.length > 5 && (
          <button
            className={s.moreFilters}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "More categories"}
            <ChevronDown size={12} />
          </button>
        )}
      </fieldset>
      <fieldset>
        <legend>Shipped From</legend>
        {searchLocations.map((name) => checkbox("location", name))}
      </fieldset>
      <fieldset>
        <legend>Brand</legend>
        {searchBrands.map((name) => checkbox("brand", name))}
      </fieldset>
      <fieldset>
        <legend>Price Range</legend>
        <form onSubmit={apply} noValidate>
          <div className={s.priceInputs}>
            <input
              type="number"
              min="0"
              step="0.01"
              aria-label="Minimum price"
              placeholder="$ Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
            <span>–</span>
            <input
              type="number"
              min="0"
              step="0.01"
              aria-label="Maximum price"
              placeholder="$ Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
          {error && (
            <p className={s.priceError} role="alert">
              {error}
            </p>
          )}
          <button className={s.applyPrice} type="submit">
            Apply
          </button>
        </form>
      </fieldset>
      <fieldset>
        <legend>Shop Type</legend>
        <label className={s.filterOption}>
          <input
            type="checkbox"
            checked={params.get("mall") === "1"}
            onChange={() =>
              update({ mall: params.get("mall") === "1" ? "" : "1" })
            }
          />
          Shopiz Mall
        </label>
      </fieldset>
      <fieldset>
        <legend>Rating</legend>
        <div
          className={s.ratingOptions}
          role="group"
          aria-label="Minimum rating"
        >
          {[5, 4, 3].map((value) => (
            <button
              key={value}
              className={
                params.get("rating") === String(value) ? s.activeRating : ""
              }
              aria-label={value === 5 ? "5 stars" : `${value} stars & up`}
              aria-pressed={params.get("rating") === String(value)}
              onClick={() =>
                update({
                  rating:
                    params.get("rating") === String(value) ? "" : String(value),
                })
              }
            >
              <span>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={11}
                    fill={i < value ? "currentColor" : "none"}
                  />
                ))}
              </span>
              {value < 5 && <small>& up</small>}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Services & Promotions</legend>
        <label className={s.filterOption}>
          <input
            type="checkbox"
            checked={params.get("shipping") === "1"}
            onChange={() =>
              update({ shipping: params.get("shipping") === "1" ? "" : "1" })
            }
          />
          Free shipping
        </label>
      </fieldset>
      <button className={s.clearFilters} onClick={clear}>
        Clear all filters
      </button>
    </>
  );
}
