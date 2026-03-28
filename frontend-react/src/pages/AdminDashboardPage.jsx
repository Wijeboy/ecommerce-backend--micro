import { useEffect, useMemo, useState } from 'react';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAGE_SIZE = 5;

export default function AdminDashboardPage() {
  const { token, user } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [searchUsers, setSearchUsers] = useState('');
  const [userIdLookup, setUserIdLookup] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchOrders, setSearchOrders] = useState('');
  const [searchProducts, setSearchProducts] = useState('');

  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageUrl: '',
  });

  const [editForm, setEditForm] = useState({
    id: '',
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageUrl: '',
  });

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const data = await request('/api/users', { token });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchUserById() {
    if (!userIdLookup.trim()) return;
    try {
      const data = await request(`/api/users/${userIdLookup.trim()}`);
      setSelectedUser(data);
      toast.success('Loaded user by id');
    } catch (err) {
      setSelectedUser({ error: err.message });
      toast.error(err.message);
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const data = await request('/api/orders/admin/all', { token });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const data = await request('/api/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadUsers();
    loadOrders();
    loadProducts();
  }, []);

  function onCreateChange(event) {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  }

  function onEditChange(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function createProduct(event) {
    event.preventDefault();

    try {
      await request('/api/products', {
        method: 'POST',
        token,
        body: {
          title: createForm.title,
          description: createForm.description,
          price: Number(createForm.price),
          stock: Number(createForm.stock),
          category: createForm.category,
          imageUrl: createForm.imageUrl,
        },
      });
      toast.success('Product created successfully');
      setCreateForm({ title: '', description: '', price: 0, stock: 0, category: '', imageUrl: '' });
      await loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function startEdit(product) {
    setEditForm({
      id: product._id,
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || '',
      imageUrl: product.imageUrl || '',
    });
  }

  async function updateProduct(event) {
    event.preventDefault();
    if (!editForm.id) return;

    try {
      await request(`/api/products/${editForm.id}`, {
        method: 'PUT',
        token,
        body: {
          title: editForm.title,
          description: editForm.description,
          price: Number(editForm.price),
          stock: Number(editForm.stock),
          category: editForm.category,
          imageUrl: editForm.imageUrl,
        },
      });
      toast.success('Product updated successfully');
      await loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;

    try {
      await request(`/api/products/${id}`, {
        method: 'DELETE',
        token,
      });
      toast.success('Product deleted successfully');
      if (editForm.id === id) {
        setEditForm({ id: '', title: '', description: '', price: 0, stock: 0, category: '', imageUrl: '' });
      }
      await loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      await request(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        token,
        body: { status },
      });
      toast.success(`Order status updated to ${status}`);
      await loadOrders();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function paginate(data, page) {
    const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return {
      rows: data.slice(start, start + PAGE_SIZE),
      totalPages,
      safePage,
    };
  }

  const filteredUsers = useMemo(() => {
    const keyword = searchUsers.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((u) => {
      const name = u.name?.toLowerCase() || '';
      const email = u.email?.toLowerCase() || '';
      const role = u.role?.toLowerCase() || '';
      return name.includes(keyword) || email.includes(keyword) || role.includes(keyword);
    });
  }, [users, searchUsers]);

  const filteredOrders = useMemo(() => {
    const keyword = searchOrders.trim().toLowerCase();
    if (!keyword) return orders;
    return orders.filter((o) => {
      const orderId = o._id?.toLowerCase() || '';
      const userId = o.userId?.toLowerCase() || '';
      const status = o.status?.toLowerCase() || '';
      const paymentStatus = o.paymentStatus?.toLowerCase() || '';
      return (
        orderId.includes(keyword) ||
        userId.includes(keyword) ||
        status.includes(keyword) ||
        paymentStatus.includes(keyword)
      );
    });
  }, [orders, searchOrders]);

  const filteredProducts = useMemo(() => {
    const keyword = searchProducts.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((p) => {
      const title = p.title?.toLowerCase() || '';
      const category = p.category?.toLowerCase() || '';
      const id = p._id?.toLowerCase() || '';
      return title.includes(keyword) || category.includes(keyword) || id.includes(keyword);
    });
  }, [products, searchProducts]);

  const usersPageData = paginate(filteredUsers, userPage);
  const ordersPageData = paginate(filteredOrders, orderPage);
  const productsPageData = paginate(filteredProducts, productPage);

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const completedPayments = orders.filter((o) => o.paymentStatus === 'completed').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return {
      users: users.length,
      admins,
      products: products.length,
      orders: orders.length,
      pendingOrders,
      completedPayments,
    };
  }, [orders, products, users]);

  useEffect(() => {
    setUserPage(1);
  }, [searchUsers]);

  useEffect(() => {
    setOrderPage(1);
  }, [searchOrders]);

  useEffect(() => {
    setProductPage(1);
  }, [searchProducts]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-900 p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <span className="rounded-full bg-indigo-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-900">
            Admin Only
          </span>
        </div>
        <p className="mt-2 text-sm text-indigo-100">
          Manage users, products, and orders from one place. Signed in as {user?.email}.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Users</p><p className="text-2xl font-bold">{stats.users}</p></div>
        <div className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Admins</p><p className="text-2xl font-bold">{stats.admins}</p></div>
        <div className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Products</p><p className="text-2xl font-bold">{stats.products}</p></div>
        <div className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Orders</p><p className="text-2xl font-bold">{stats.orders}</p></div>
        <div className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Pending Orders</p><p className="text-2xl font-bold">{stats.pendingOrders}</p></div>
        <div className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Paid Orders</p><p className="text-2xl font-bold">{stats.completedPayments}</p></div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Users</h2>
          <button onClick={loadUsers} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">Refresh</button>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <input
            value={userIdLookup}
            onChange={(e) => setUserIdLookup(e.target.value)}
            placeholder="Lookup user by id"
            className="min-w-[280px] flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            onClick={fetchUserById}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Get User By ID
          </button>
        </div>
        <input
          value={searchUsers}
          onChange={(e) => setSearchUsers(e.target.value)}
          placeholder="Search users by name/email/role"
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        />
        {selectedUser && (
          <div className="mb-3 rounded-md bg-slate-50 p-3 text-sm">
            {'error' in selectedUser ? (
              <p className="text-rose-600">{selectedUser.error}</p>
            ) : (
              <>
                <p><span className="font-medium">User:</span> {selectedUser.name}</p>
                <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                <p><span className="font-medium">Role:</span> {selectedUser.role}</p>
              </>
            )}
          </div>
        )}
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {usersPageData.rows.map((u) => (
                  <tr key={u._id} className="border-b">
                    <td className="px-2 py-2">{u.name}</td>
                    <td className="px-2 py-2">{u.email}</td>
                    <td className="px-2 py-2 capitalize">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Page {usersPageData.safePage} of {usersPageData.totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  disabled={usersPageData.safePage === 1}
                  className="rounded border px-2 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setUserPage((p) => Math.min(usersPageData.totalPages, p + 1))}
                  disabled={usersPageData.safePage === usersPageData.totalPages}
                  className="rounded border px-2 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Create Product</h2>
          <form onSubmit={createProduct} className="space-y-3">
            <input name="title" value={createForm.title} onChange={onCreateChange} placeholder="Title" className="w-full rounded-lg border px-3 py-2" required />
            <textarea name="description" value={createForm.description} onChange={onCreateChange} placeholder="Description" className="w-full rounded-lg border px-3 py-2" rows={3} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="price" type="number" value={createForm.price} onChange={onCreateChange} placeholder="Price" className="w-full rounded-lg border px-3 py-2" required />
              <input name="stock" type="number" value={createForm.stock} onChange={onCreateChange} placeholder="Stock" className="w-full rounded-lg border px-3 py-2" required />
            </div>
            <input name="category" value={createForm.category} onChange={onCreateChange} placeholder="Category" className="w-full rounded-lg border px-3 py-2" required />
            <input name="imageUrl" value={createForm.imageUrl} onChange={onCreateChange} placeholder="Image URL" className="w-full rounded-lg border px-3 py-2" />
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">Create</button>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">Edit Product</h2>
          <form onSubmit={updateProduct} className="space-y-3">
            <input name="id" value={editForm.id} onChange={onEditChange} placeholder="Product ID" className="w-full rounded-lg border px-3 py-2" required />
            <input name="title" value={editForm.title} onChange={onEditChange} placeholder="Title" className="w-full rounded-lg border px-3 py-2" required />
            <textarea name="description" value={editForm.description} onChange={onEditChange} placeholder="Description" className="w-full rounded-lg border px-3 py-2" rows={3} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="price" type="number" value={editForm.price} onChange={onEditChange} placeholder="Price" className="w-full rounded-lg border px-3 py-2" required />
              <input name="stock" type="number" value={editForm.stock} onChange={onEditChange} placeholder="Stock" className="w-full rounded-lg border px-3 py-2" required />
            </div>
            <input name="category" value={editForm.category} onChange={onEditChange} placeholder="Category" className="w-full rounded-lg border px-3 py-2" required />
            <input name="imageUrl" value={editForm.imageUrl} onChange={onEditChange} placeholder="Image URL" className="w-full rounded-lg border px-3 py-2" />
            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700">Update</button>
          </form>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Products</h2>
          <button onClick={loadProducts} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">Refresh</button>
        </div>
        <input
          value={searchProducts}
          onChange={(e) => setSearchProducts(e.target.value)}
          placeholder="Search products by title/category/id"
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        />
        {loadingProducts ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {productsPageData.rows.map((product) => (
              <div key={product._id} className="rounded-lg border p-3">
                <p className="font-semibold">{product.title}</p>
                <p className="text-sm text-slate-600">{product.category}</p>
                <p className="text-sm text-slate-700">LKR {product.price}</p>
                <p className="text-xs text-slate-500">{product._id}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => startEdit(product)} className="rounded border px-2 py-1 text-xs hover:bg-slate-50">Edit</button>
                  <button onClick={() => deleteProduct(product._id)} className="rounded bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loadingProducts && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Page {productsPageData.safePage} of {productsPageData.totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                disabled={productsPageData.safePage === 1}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setProductPage((p) => Math.min(productsPageData.totalPages, p + 1))}
                disabled={productsPageData.safePage === productsPageData.totalPages}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Orders</h2>
          <button onClick={loadOrders} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">Refresh</button>
        </div>
        <input
          value={searchOrders}
          onChange={(e) => setSearchOrders(e.target.value)}
          placeholder="Search orders by id/user/status/payment"
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        />
        {loadingOrders ? (
          <p>Loading orders...</p>
        ) : (
          <div className="space-y-3">
            {ordersPageData.rows.map((order) => (
              <div key={order._id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">Order: {order._id}</p>
                  <p className="text-sm text-slate-600">User: {order.userId}</p>
                </div>
                <p className="text-sm text-slate-700">Total: LKR {order.totalAmount}</p>
                <p className="text-sm text-slate-700">Payment: {order.paymentStatus}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="rounded-lg border px-2 py-1 text-sm"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loadingOrders && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Page {ordersPageData.safePage} of {ordersPageData.totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                disabled={ordersPageData.safePage === 1}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setOrderPage((p) => Math.min(ordersPageData.totalPages, p + 1))}
                disabled={ordersPageData.safePage === ordersPageData.totalPages}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
