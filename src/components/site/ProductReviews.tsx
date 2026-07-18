import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
};

function Stars({
  value,
  onChange,
  size = 16,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const starIcon = (
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? "fill-terracotta text-terracotta" : "text-muted-foreground/40"}
          />
        );

        if (onChange) {
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="cursor-pointer focus:outline-none"
              aria-label={`${n} star`}
            >
              {starIcon}
            </button>
          );
        }

        return <span key={n}>{starIcon}</span>;
      })}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [productId]);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async () => {
    if (!user) {
      toast.info("Please log in to leave a review");
      navigate({ to: "/auth", search: { redirect: "/" } });
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("product_reviews").upsert(
      {
        product_id: productId,
        user_id: user.id,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
      },
      { onConflict: "product_id,user_id" },
    );
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(myReview ? "Review updated" : "Review submitted");
    setTitle("");
    setComment("");
    setRating(5);
    load();
  };

  const remove = async () => {
    if (!myReview) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", myReview.id);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    load();
  };

  return (
    <div className="mt-5 border-t border-border/50 pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Stars value={Math.round(avg)} size={14} />
          <span className="text-xs font-medium text-muted-foreground">
            {reviews.length > 0 ? `${avg.toFixed(1)} (${reviews.length})` : "No reviews yet"}
          </span>
        </div>
        <span className="text-xs font-semibold text-terracotta">{open ? "Hide" : "Reviews"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {user ? (
            <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
              <p className="text-xs font-semibold text-foreground">
                {myReview ? "Edit your review" : "Write a review"}
              </p>
              <div className="mt-2">
                <Stars value={rating} onChange={setRating} />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
              />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={myReview?.comment ?? "Share your experience..."}
                rows={3}
                className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="rounded-full bg-terracotta px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : myReview ? "Update" : "Submit"}
                </button>
                {myReview && (
                  <button
                    onClick={remove}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Delete mine
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate({ to: "/auth", search: { redirect: "/" } })}
              className="w-full rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Log in to write a review
            </button>
          )}

          {loading ? (
            <p className="text-xs text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground">Be the first to review this product.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <Stars value={r.rating} size={12} />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.title && (
                    <p className="mt-1 text-xs font-semibold text-foreground">{r.title}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
