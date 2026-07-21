import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderStats, getProducts, getUsers } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../data/data';
import '../../styles/admin.css';
import '../../styles/forms.css';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    mostPopularProduct: null,
  });
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [products, users, orderStats] = await Promise.all([
          getProducts(),
          getUsers(),
          getOrderStats(),
        ]);

        if (cancelled) return;

        setProductCount(products.length);
        setUserCount(users.length);
        setStats(orderStats);
        setRecentProducts(
          [...products]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5)
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard data');
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
          <h1 className="admin-page__title">Dashboard</h1>
          <p className="admin-page__subtitle">
            Welcome back{user?.username ? `, ${user.username}` : ''}.
          </p>
        </div>
        <div className="admin-page__actions">
          <Link to="/admin/wallpapers/new" className="btn btn--primary">
            New wallpaper
          </Link>
        </div>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <p className="admin-loading">Loading dashboard…</p>
      ) : (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">Wallpapers</p>
              <p className="admin-stat-card__value">{productCount}</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">Users</p>
              <p className="admin-stat-card__value">{userCount}</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">Total sales</p>
              <p className="admin-stat-card__value">{formatPrice(stats.totalSales)}</p>
              <p className="admin-stat-card__meta">
                {stats.orderCount} completed {stats.orderCount === 1 ? 'order' : 'orders'}
              </p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-card__label">Most popular</p>
              <p className="admin-stat-card__value">
                {stats.mostPopularProduct?.title || '—'}
              </p>
              {stats.mostPopularProduct && (
                <p className="admin-stat-card__meta">
                  {stats.mostPopularProduct.unitsSold} unit
                  {stats.mostPopularProduct.unitsSold === 1 ? '' : 's'} sold
                </p>
              )}
            </div>
          </div>

          <section className="admin-panel">
            <div className="admin-page__header" style={{ marginBottom: '1rem' }}>
              <h2 className="admin-panel__title" style={{ margin: 0 }}>
                Recent wallpapers
              </h2>
              <Link to="/admin/wallpapers" className="btn btn--secondary">
                View all
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="admin-empty">
                <h2>No wallpapers yet</h2>
                <p>Create your first product to populate the storefront.</p>
                <Link to="/admin/wallpapers/new" className="btn btn--primary">
                  Create wallpaper
                </Link>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((product) => (
                      <tr key={product.slug}>
                        <td>{product.title}</td>
                        <td>{product.type}</td>
                        <td>{formatPrice(product.price)}</td>
                        <td>
                          <Link
                            to={`/admin/wallpapers/${product.slug}/edit`}
                            className="btn btn--ghost"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          >
                            Edit
                          </Link>
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
