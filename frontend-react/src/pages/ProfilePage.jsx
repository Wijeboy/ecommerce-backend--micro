import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, token, fetchProfile, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [myReviews, setMyReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ reviewId: '', rating: 5, comment: '' });
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await fetchProfile();
        if (!ignore && data) {
          setForm({
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
          });
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [fetchProfile]);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await updateProfile(form);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    }
  }

  function onReviewChange(event) {
    const { name, value } = event.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  }

  async function loadMyReviews() {
    setError('');
    try {
      const data = await request('/api/reviews/user/my-reviews', { token });
      setMyReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function getReviewById() {
    if (!reviewForm.reviewId.trim()) return;
    setError('');
    try {
      const data = await request(`/api/reviews/${reviewForm.reviewId.trim()}`);
      setSelectedReview(data);
    } catch (err) {
      setSelectedReview({ error: err.message });
    }
  }

  async function updateReview() {
    if (!reviewForm.reviewId.trim()) return;
    setError('');
    setMessage('');
    try {
      await request(`/api/reviews/${reviewForm.reviewId.trim()}`, {
        method: 'PUT',
        token,
        body: {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        },
      });
      setMessage('Review updated successfully');
      await loadMyReviews();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteReview() {
    if (!reviewForm.reviewId.trim()) return;
    setError('');
    setMessage('');
    try {
      await request(`/api/reviews/${reviewForm.reviewId.trim()}`, {
        method: 'DELETE',
        token,
      });
      setMessage('Review deleted successfully');
      setSelectedReview(null);
      await loadMyReviews();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-5 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mb-6 text-sm text-slate-600">Manage your user information.</p>

      <div className="mb-6 rounded-lg bg-slate-50 p-4 text-sm">
        <p><span className="font-medium">Email:</span> {user?.email}</p>
        <p><span className="font-medium">Role:</span> {user?.role}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={onChange}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Save Profile
        </button>
      </form>

      {user?.role !== 'admin' && (
        <>
          <div className="my-4 h-px bg-slate-200" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">My Reviews</h2>
              <button
                onClick={loadMyReviews}
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Load My Reviews
              </button>
            </div>

            <div className="grid gap-3 rounded-lg border bg-slate-50 p-3 md:grid-cols-2">
              <input
                name="reviewId"
                value={reviewForm.reviewId}
                onChange={onReviewChange}
                placeholder="Review ID"
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="rating"
                type="number"
                min="1"
                max="5"
                value={reviewForm.rating}
                onChange={onReviewChange}
                placeholder="Rating"
                className="rounded-lg border px-3 py-2"
              />
              <textarea
                name="comment"
                value={reviewForm.comment}
                onChange={onReviewChange}
                placeholder="Comment"
                rows={3}
                className="rounded-lg border px-3 py-2 md:col-span-2"
              />

              <div className="flex flex-wrap gap-2 md:col-span-2">
                <button onClick={getReviewById} className="rounded-lg border px-3 py-2 text-sm hover:bg-white">Get Review By ID</button>
                <button onClick={updateReview} className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700">Update Review</button>
                <button onClick={deleteReview} className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700">Delete Review</button>
              </div>
            </div>

            {selectedReview && (
              <div className="rounded-lg border bg-white p-3 text-sm">
                {'error' in selectedReview ? (
                  <p className="text-rose-600">{selectedReview.error}</p>
                ) : (
                  <>
                    <p><span className="font-medium">Review ID:</span> {selectedReview._id}</p>
                    <p><span className="font-medium">Product ID:</span> {selectedReview.productId}</p>
                    <p><span className="font-medium">Rating:</span> {selectedReview.rating}</p>
                    <p><span className="font-medium">Comment:</span> {selectedReview.comment}</p>
                  </>
                )}
              </div>
            )}

            {myReviews.length > 0 && (
              <div className="space-y-2">
                {myReviews.map((review) => (
                  <div key={review._id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{review._id}</p>
                    <p>Product: {review.productId}</p>
                    <p>Rating: {review.rating}</p>
                    <p>Comment: {review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
