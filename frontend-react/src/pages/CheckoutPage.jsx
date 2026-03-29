import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const { token } = useAuth();
  const { cart, refreshCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState('Colombo, Sri Lanka');
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    method: 'credit_card',
    cardHolderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  function formatCardNumber(value) {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  function formatExpiry(value) {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    if (digitsOnly.length <= 2) return digitsOnly;
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }

  useEffect(() => {
    refreshCart().catch((err) => setError(err.message));
  }, [refreshCart]);

  const items = cart?.items || [];
  const totalAmount = useMemo(() => cart?.total || 0, [cart]);

  async function createOrder() {
    if (items.length === 0) {
      setError('Cart is empty.');
      return;
    }

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const data = await request('/api/orders', {
        method: 'POST',
        token,
        body: {
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress,
          totalAmount,
        },
      });

      setOrder(data.order);
      setMessage('Order created. Proceed with payment.');
      await refreshCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  function onPaymentFormChange(event) {
    const { name, value } = event.target;
    setPaymentForm((prev) => {
      if (name === 'cardNumber') {
        return { ...prev, cardNumber: formatCardNumber(value) };
      }

      if (name === 'expiry') {
        return { ...prev, expiry: formatExpiry(value) };
      }

      if (name === 'cvv') {
        return { ...prev, cvv: value.replace(/\D/g, '').slice(0, 4) };
      }

      if (name === 'cardHolderName') {
        return { ...prev, cardHolderName: value.replace(/\s{2,}/g, ' ') };
      }

      return { ...prev, [name]: value };
    });
  }

  function validatePaymentForm() {
    const isCardMethod = ['credit_card', 'debit_card'].includes(paymentForm.method);
    if (!isCardMethod) return true;

    const number = paymentForm.cardNumber.replace(/\s+/g, '');
    const expiryOk = /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(paymentForm.expiry);
    const cvvOk = /^[0-9]{3,4}$/.test(paymentForm.cvv);

    if (!paymentForm.cardHolderName.trim()) {
      setError('Card holder name is required.');
      return false;
    }
    if (!/^[0-9]{16}$/.test(number)) {
      setError('Card number must be 16 digits.');
      return false;
    }
    if (!expiryOk) {
      setError('Expiry must be in MM/YY format.');
      return false;
    }
    if (!cvvOk) {
      setError('CVV must be 3 or 4 digits.');
      return false;
    }

    return true;
  }

  async function initiatePayment() {
    if (!order?._id) return false;

    if (!validatePaymentForm()) {
      return false;
    }

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const data = await request('/api/payments/initiate', {
        method: 'POST',
        token,
        body: {
          orderId: order._id,
          amount: Number(order.totalAmount),
          method: paymentForm.method,
          cardDetails: {
            cardHolderName: paymentForm.cardHolderName,
            cardNumber: paymentForm.cardNumber.replace(/\s+/g, ''),
            expiry: paymentForm.expiry,
            cvv: paymentForm.cvv,
          },
        },
      });

      setPayment(data.payment);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setProcessing(false);
    }
  }

  async function confirmPayment() {
    if (!order?._id) return;

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const data = await request('/api/payments/confirm', {
        method: 'POST',
        token,
        body: { orderId: order._id },
      });

      setPayment(data.payment);
      setMessage('Payment successful. Order payment status updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function payNow() {
    const initiated = await initiatePayment();
    if (!initiated) return;
    await confirmPayment();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm text-slate-600">Create an order and complete payment.</p>

        {items.length === 0 ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Cart is empty. <Link to="/cart" className="text-indigo-600">Go to cart</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>{item.title}</span>
                <span>{item.quantity} x LKR {item.price}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Shipping Address</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <span className="font-medium">Order Total</span>
          <span className="text-lg font-bold text-indigo-700">LKR {totalAmount}</span>
        </div>

        <button
          onClick={createOrder}
          disabled={processing || items.length === 0}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Create Order'}
        </button>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Payment</h2>

        {!order ? (
          <p className="mt-2 text-sm text-slate-600">Create an order first.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">Order ID: {order._id}</p>
            <p className="text-sm text-slate-600">Amount: LKR {order.totalAmount}</p>

            <div className="mt-4 space-y-2 rounded-lg border p-3">
              <label className="block text-sm font-medium">Payment Method</label>
              <select
                name="method"
                value={paymentForm.method}
                onChange={onPaymentFormChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="online_banking">Online Banking</option>
                <option value="cash_on_delivery">Cash On Delivery</option>
              </select>

              {['credit_card', 'debit_card'].includes(paymentForm.method) && (
                <>
                  <input
                    name="cardHolderName"
                    value={paymentForm.cardHolderName}
                    onChange={onPaymentFormChange}
                    placeholder="Card Holder Name"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    autoComplete="cc-name"
                  />
                  <input
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={onPaymentFormChange}
                    placeholder="Card Number (16 digits)"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={19}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="expiry"
                      value={paymentForm.expiry}
                      onChange={onPaymentFormChange}
                      placeholder="MM/YY"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      maxLength={5}
                    />
                    <input
                      name="cvv"
                      value={paymentForm.cvv}
                      onChange={onPaymentFormChange}
                      placeholder="CVV"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={payNow}
                disabled={processing}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Pay Now
              </button>
            </div>
          </>
        )}

        {payment && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">
            <p><span className="font-medium">Payment Status:</span> {payment.status}</p>
            {payment.transactionId && (
              <p><span className="font-medium">Transaction ID:</span> {payment.transactionId}</p>
            )}
          </div>
        )}

        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </section>
    </div>
  );
}
