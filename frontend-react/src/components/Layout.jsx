import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ToastViewport from './ToastViewport';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium ${
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-slate-700 hover:bg-slate-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-indigo-700">Ecommerce UI</span>
            <div className="hidden gap-2 md:flex">
              <NavItem to="/">Home</NavItem>
              {user?.role !== 'admin' && <NavItem to="/cart">Cart ({itemCount})</NavItem>}
              {user?.role !== 'admin' && <NavItem to="/orders">Orders</NavItem>}
              <NavItem to="/profile">Profile</NavItem>
              {user?.role === 'admin' && <NavItem to="/admin">Admin</NavItem>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <NavItem to="/login">Login</NavItem>
                <NavItem to="/register">Register</NavItem>
              </>
            ) : (
              <>
                <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-sm sm:inline">
                  {user?.name || user?.email || 'Logged in'}
                </span>
                <span
                  className={`hidden rounded-full px-2 py-1 text-xs font-semibold sm:inline ${
                    user?.role === 'admin'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {user?.role || 'user'}
                </span>
                <button
                  onClick={onLogout}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      <ToastViewport />
    </div>
  );
}
