import React, { useRef, useState } from "react";
import { Star, Upload, Image as ImageIcon } from "lucide-react";
import CheckoutDialog from "../checkout/CheckoutDialog";
import d from "../checkout/CheckoutPage.module.css";
import s from "./PurchasesPage.module.css";
export default function OrderActionDialog({ type, order, onClose, onSubmit }) {
  const [rating, setRating] = useState(order.review?.rating || 0);
  const [comment, setComment] = useState(order.review?.comment || "");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [proofFiles, setProofFiles] = useState([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

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
    if (type === "return" && !reason) {
      setError("Please select a return reason.");
      return;
    }
    if (type === "review") {
      onSubmit({ rating, comment: comment.trim() });
    } else if (type === "cancel") {
      onSubmit(reason);
    } else if (type === "return") {
      onSubmit({ reason, description: description.trim(), files: proofFiles });
    }
  }
  const titles = {
    review: order.review ? "Edit Review" : "Review Order",
    cancel: "Cancel Order",
    cancellation: "Cancellation Details",
    return: "Request Return / Refund",
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
          ) : type === "return" ? (
            <>
              <p className={s.demoNote}>
                Submit a return & refund request to Shopee for review. Refund amount is automatically computed based on order total.
              </p>
              <label className={s.formLabel} htmlFor="return-reason">
                Reason for return / refund
              </label>
              <select
                id="return-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError("");
                }}
              >
                <option value="">Select a reason</option>
                {[
                  "DAMAGED",
                  "DEFECTIVE",
                  "MISSING_ITEMS",
                  "WRONG_ITEM",
                  "COUNTERFEIT",
                  "CHANGE_OF_MIND",
                ].map((value) => (
                  <option key={value} value={value}>{value.replace(/_/g, " ")}</option>
                ))}
              </select>
              <label className={s.formLabel} htmlFor="return-description" style={{ marginTop: "1rem" }}>
                Description (optional)
              </label>
              <textarea
                id="return-description"
                rows={3}
                placeholder="Explain the issue with the delivered package..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div style={{ marginTop: "1rem" }}>
                <label className={s.formLabel}>Upload Photo Evidence</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setProofFiles(files);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.8rem",
                    border: "1px dashed var(--color-border, #ccc)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    background: "none",
                  }}
                >
                  <Upload size={16} />
                  {proofFiles.length ? `${proofFiles.length} file(s) selected` : "Select photos from device"}
                </button>
              </div>
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
              {type === "review"
                ? "Submit Review"
                : type === "return"
                  ? "Submit Return Request"
                  : "Confirm Cancellation"}
            </button>
          )}
        </footer>
      </form>
    </CheckoutDialog>
  );
}
