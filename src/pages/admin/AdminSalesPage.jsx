import { useEffect, useState } from 'react';
import { getOrderStats, getOrders } from '../../api/api';
import { formatPrice } from '../../data/data';
import '../../styles/admin.css';
import '../../styles/forms.css';

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '—';
  }
}

export default function AdminSalesPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    mostPopularProduct: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [orderList, orderStats] = await Promise.all([
          getOrders(),
          getOrderStats(),
        ]);
        if (cancelled) return;
        setOrders(orderList);
        setStats(orderStats);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load sales data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Sales</h1>
          <p className="admin-page__subtitle">
            Completed orders and revenue. Method shows demo, paypal, or stripe
            depending on how the customer paid.
          </p>
        </div>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <p className="admin-loading">Loading sales…</p>
      ) : (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">Total sales</p>
              <p className="admin-stat-card__value">{formatPrice(stats.totalSales)}</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">Orders</p>
              <p className="admin-stat-card__value">{stats.orderCount}</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">Most popular</p>
              <p className="admin-stat-card__value">
                {stats.mostPopularProduct?.title || '—'}
              </p>
              {stats.mostPopularProduct && (
                <p className="admin-stat-card__meta">
                  {stats.mostPopularProduct.unitsSold} sold
                </p>
              )}
            </div>
          </div>

          <section className="admin-panel">
            <h2 className="admin-panel__title">Recent orders</h2>
            {orders.length === 0 ? (
              <div className="admin-empty">
                <h2>No orders yet</h2>
                <p>
                  When customers complete checkout (or you place a test order from
                  the cart), they will show up here.
                </p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          {(order.items || [])
                            .map((item) => `${item.title} ×${item.quantity}`)
                            .join(', ')}
                        </td>
                        <td>{formatPrice(order.totalAmount)}</td>
                        <td>{order.paymentMethod || '—'}</td>
                        <td>
                          <span
                            className={`admin-status admin-status--${order.status || 'pending'}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
