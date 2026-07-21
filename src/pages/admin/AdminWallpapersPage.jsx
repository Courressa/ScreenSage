import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteProduct, getProducts } from '../../api/api';
import { formatPrice } from '../../data/data';
import '../../styles/admin.css';
import '../../styles/forms.css';

export default function AdminWallpapersPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingSlug, setDeletingSlug] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load wallpapers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Defer state updates to the async fetch callback (not sync in effect body)
    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete “${product.title}”? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingSlug(product.slug);
    setError('');
    try {
      await deleteProduct(product.slug);
      setProducts((prev) => prev.filter((p) => p.slug !== product.slug));
    } catch (err) {
      setError(err.message || 'Failed to delete wallpaper');
    } finally {
      setDeletingSlug('');
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Wallpapers</h1>
          <p className="admin-page__subtitle">
            Create, edit, and remove products in the catalog.
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
        <p className="admin-loading">Loading wallpapers…</p>
      ) : products.length === 0 ? (
        <div className="admin-panel">
          <div className="admin-empty">
            <h2>No wallpapers yet</h2>
            <p>Add a product to make it available on the storefront.</p>
            <Link to="/admin/wallpapers/new" className="btn btn--primary">
              Create wallpaper
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.slug}>
                    <td>
                      {product.coverImage ? (
                        <img
                          src={product.coverImage}
                          alt=""
                          className="admin-thumb"
                        />
                      ) : (
                        <span className="admin-thumb" />
                      )}
                    </td>
                    <td>{product.title}</td>
                    <td>
                      <code>{product.slug}</code>
                    </td>
                    <td>{product.type}</td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      <div className="admin-table__actions">
                        <Link
                          to={`/admin/wallpapers/${product.slug}/edit`}
                          className="btn btn--ghost"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn--danger"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          onClick={() => handleDelete(product)}
                          disabled={deletingSlug === product.slug}
                        >
                          {deletingSlug === product.slug ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
