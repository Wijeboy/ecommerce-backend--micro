import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { token, isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [productData, reviewData] = await Promise.all([
        request(`/api/products/${id}`),
        request(`/api/reviews/product/${id}`),
      ]);
      setProduct(productData);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  async function submitReview(event) {
    event.preventDefault();
    setReviewError('');
    setSubmitting(true);

    try {
      await request('/api/reviews', {
        method: 'POST',
        token,
        body: {
          productId: id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
          userName: user?.name || 'User',
        },
      });
      setReviewForm({ rating: 5, comment: '' });
      await loadData();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading product...</p>;
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
        <h1 className="text-2xl font-bold text-slate-900">{product.title}</h1>
        <p className="mt-3 text-slate-700">{product.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Category: {product.category}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Stock: {product.stock ?? 0}</span>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
            Price: LKR {product.price}
          </span>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Ratings</h2>
        <p className="mt-2 text-3xl font-bold text-indigo-700">{averageRating}</p>
        <p className="text-sm text-slate-600">Based on {reviews.length} review(s)</p>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>

        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <article key={review._id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-800">{review.userName || 'Anonymous'}</p>
                  <p className="text-sm font-semibold text-amber-600">{review.rating} / 5</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-3">
        <h2 className="text-xl font-semibold text-slate-900">Add Review</h2>

        {!isAuthenticated ? (
          <p className="mt-3 text-sm text-slate-600">Login to add your review.</p>
        ) : (
          <form onSubmit={submitReview} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Rating (1 to 5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, rating: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2"
                rows={4}
                required
              />
            </div>

            {reviewError && <p className="text-sm text-rose-600">{reviewError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
