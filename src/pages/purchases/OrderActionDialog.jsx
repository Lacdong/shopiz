import React, { useState } from "react";
import { Star } from "lucide-react";
import CheckoutDialog from "../checkout/CheckoutDialog";
import d from "../checkout/CheckoutPage.module.css";
import s from "./PurchasesPage.module.css";
export default function OrderActionDialog({ type, order, onClose, onSubmit }) {
  const [rating, setRating] = useState(order.review?.rating || 0);
  const [comment, setComment] = useState(order.review?.comment || "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    if (type === "review" && !rating) {
      setError("Choose a star rating before submitting your review.");
      return;
    }
    if (type === "cancel" && !reason) {
      setError("Select a cancellation reason.");
      return;
    }
    onSubmit(type === "review" ? { rating, comment: comment.trim() } : reason);
  }
  const titles = {
    review: order.review ? "Edit Review" : "Review Order",
    cancel: "Cancel Order",
    cancellation: "Cancellation Details",
  };
  return (
    <CheckoutDialog title={titles[type]} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className={d.dialogBody}>
          <p className={s.detailId}>{order.id}</p>
          {type === "review" ? (
            <>
              <p className={s.demoNote}>
                How was your order? Your review is saved for this demo only.
              </p>
              <fieldset className={s.reviewStars}>
                <legend>Overall rating</legend>
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="order-rating"
                      aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                      checked={rating === value}
                      onChange={() => {
                        setRating(value);
                        setError("");
                      }}
                    />
                    <Star
                      size={27}
                      fill={value <= rating ? "currentColor" : "none"}
                      strokeWidth={1.4}
                    />
                  </label>
                ))}
              </fieldset>
              <label className={s.formLabel} htmlFor="review-comment">
                Your review (optional)
              </label>
              <textarea
                id="review-comment"
                maxLength={1000}
                rows={4}
                placeholder="Tell us about your purchase"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </>
          ) : type === "cancel" ? (
            <>
              <p className={s.demoNote}>
                Cancel this demo order before it is completed. This does not
                issue a real refund or contact a seller.
              </p>
              <label className={s.formLabel} htmlFor="cancel-reason">
                Reason for cancellation
              </label>
              <select
                id="cancel-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError("");
                }}
              >
                <option value="">Select a reason</option>
                {[
                  "Changed my mind",
                  "Ordered the wrong item",
                  "Need to change delivery address",
                  "Delivery is taking too long",
                  "Other",
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <p className={s.cancellationBadge}>Cancelled</p>
              <dl className={s.breakdown}>
                <div>
                  <dt>Cancelled by</dt>
                  <dd>You</dd>
                </div>
                <div>
                  <dt>Reason</dt>
                  <dd>
                    {order.cancellationReason ||
                      "Cancelled by the buyer in sample history."}
                  </dd>
                </div>
                {order.cancelledAt && (
                  <div>
                    <dt>Cancelled on</dt>
                    <dd>
                      {new Date(order.cancelledAt).toLocaleString("en-GB")}
                    </dd>
                  </div>
                )}
                <div>
                  <dt>Order Total</dt>
                  <dd>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(order.total)}
                  </dd>
                </div>
              </dl>
              <p className={s.demoNote}>
                This is a demo order. No real payment was collected or refunded.
              </p>
            </>
          )}
          {error && (
            <p className={s.actionError} role="alert">
              {error}
            </p>
          )}
        </div>
        <footer className={d.dialogFooter}>
          <button type="button" className={d.secondary} onClick={onClose}>
            {type === "cancel" ? "Keep Order" : "Close"}
          </button>
          {type !== "cancellation" && (
            <button type="submit" className={d.primary}>
              {type === "review" ? "Submit Review" : "Confirm Cancellation"}
            </button>
          )}
        </footer>
      </form>
    </CheckoutDialog>
  );
}
