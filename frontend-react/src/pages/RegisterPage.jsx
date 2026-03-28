import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, registerAdmin, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', secret: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onAdminChange(event) {
    const { name, value } = event.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await register(form);
      setSuccess('Registration successful. Please login.');
      setForm({ name: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onAdminSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await registerAdmin(
        {
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
        },
        adminForm.secret
      );
      setSuccess('Admin registration successful. You can login now.');
      setAdminForm({ name: '', email: '', password: '', secret: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Register</h1>
      <p className="mb-6 text-sm text-slate-600">Create your new account.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            minLength={6}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="minimum 6 characters"
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-indigo-600">Login here</Link>
      </p>

      <div className="my-6 h-px bg-slate-200" />

      <h2 className="mb-2 text-lg font-semibold text-slate-900">Register Admin</h2>
      <p className="mb-4 text-sm text-slate-600">Requires admin secret key.</p>

      <form onSubmit={onAdminSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Admin Name</label>
          <input
            type="text"
            name="name"
            value={adminForm.name}
            onChange={onAdminChange}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Admin User"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Admin Email</label>
          <input
            type="email"
            name="email"
            value={adminForm.email}
            onChange={onAdminChange}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Admin Password</label>
          <input
            type="password"
            name="password"
            value={adminForm.password}
            onChange={onAdminChange}
            minLength={6}
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Admin Secret</label>
          <input
            type="text"
            name="secret"
            value={adminForm.secret}
            onChange={onAdminChange}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="x-admin-secret"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Creating admin...' : 'Register Admin'}
        </button>
      </form>
    </div>
  );
}
