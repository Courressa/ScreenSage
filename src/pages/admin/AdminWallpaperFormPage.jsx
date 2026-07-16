import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createProduct,
  getProductBySlug,
  updateProduct,
} from '../../api/api';
import '../../styles/admin.css';
import '../../styles/forms.css';

const emptyForm = {
  id: '',
  type: 'individual',
  slug: '',
  title: '',
  contributor: '',
  category: '',
  mood: '',
  tags: '',
  description: '',
  price: '',
  imageCount: '',
  hasVideo: false,
  coverImage: '',
  devices: 'phone, tablet, desktop',
  resolutions: '4K',
  fullGallery: '',
  devicePreviewsPhone: '',
  devicePreviewsTablet: '',
  devicePreviewsDesktop: '',
  stripePriceId: '',
  paypalProductId: '',
};

const splitList = (value) =>
  String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const joinList = (value) => (Array.isArray(value) ? value.join(', ') : '');

export default function AdminWallpaperFormPage() {
  const { slug: editSlug } = useParams();
  const isEdit = Boolean(editSlug);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const product = await getProductBySlug(editSlug);
        if (cancelled) return;

        setForm({
          id: product.id ?? '',
          type: product.type || 'individual',
          slug: product.slug || '',
          title: product.title || '',
          contributor: product.contributor || '',
          category: product.category || '',
          mood: joinList(product.mood),
          tags: joinList(product.tags),
          description: product.description || '',
          price: product.price ?? '',
          imageCount: product.imageCount ?? '',
          hasVideo: Boolean(product.hasVideo),
          coverImage: product.coverImage || '',
          devices: joinList(product.devices),
          resolutions: joinList(product.resolutions),
          fullGallery: joinList(product.fullGallery),
          devicePreviewsPhone: joinList(product.devicePreviews?.phone),
          devicePreviewsTablet: joinList(product.devicePreviews?.tablet),
          devicePreviewsDesktop: joinList(product.devicePreviews?.desktop),
          stripePriceId: product.stripePriceId || '',
          paypalProductId: product.paypalProductId || '',
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load wallpaper');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [editSlug, isEdit]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const buildPayload = () => {
    const payload = {
      id: Number(form.id),
      type: form.type,
      slug: form.slug.trim(),
      title: form.title.trim(),
      contributor: form.contributor.trim() || undefined,
      category: form.category.trim(),
      mood: splitList(form.mood),
      tags: splitList(form.tags),
      description: form.description.trim(),
      price: Number(form.price),
      imageCount: Number(form.imageCount),
      hasVideo: Boolean(form.hasVideo),
      coverImage: form.coverImage.trim(),
      devices: splitList(form.devices),
      resolutions: splitList(form.resolutions),
      fullGallery: splitList(form.fullGallery),
      devicePreviews: {
        phone: splitList(form.devicePreviewsPhone),
        tablet: splitList(form.devicePreviewsTablet),
        desktop: splitList(form.devicePreviewsDesktop),
      },
      stripePriceId: form.stripePriceId.trim() || undefined,
      paypalProductId: form.paypalProductId.trim() || undefined,
    };

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = buildPayload();

      if (isEdit) {
        // Don't send id on update (backend strips it anyway)
        const { id, ...updateData } = payload;
        void id;
        await updateProduct(editSlug, updateData);
      } else {
        await createProduct(payload);
      }

      navigate('/admin/wallpapers');
    } catch (err) {
      setError(err.message || 'Failed to save wallpaper');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="admin-loading">Loading wallpaper…</p>;
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {isEdit ? 'Edit wallpaper' : 'New wallpaper'}
          </h1>
          <p className="admin-page__subtitle">
            Images are URL strings for now (Cloudinary can come later).
          </p>
        </div>
        <div className="admin-page__actions">
          <Link to="/admin/wallpapers" className="btn btn--ghost">
            Back to list
          </Link>
        </div>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-panel">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <div className="form-group">
              <label htmlFor="id">Numeric ID *</label>
              <input
                id="id"
                name="id"
                type="number"
                value={form.id}
                onChange={handleChange}
                required
                disabled={isEdit}
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="individual">Individual</option>
                <option value="collection">Collection</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="slug">Slug *</label>
              <input
                id="slug"
                name="slug"
                type="text"
                value={form.slug}
                onChange={handleChange}
                placeholder="my-wallpaper-name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                id="category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                placeholder="abstract"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageCount">Image count *</label>
              <input
                id="imageCount"
                name="imageCount"
                type="number"
                min="0"
                value={form.imageCount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contributor">Contributor</label>
              <input
                id="contributor"
                name="contributor"
                type="text"
                value={form.contributor}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="coverImage">Cover image URL *</label>
              <input
                id="coverImage"
                name="coverImage"
                type="text"
                value={form.coverImage}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
              {form.coverImage && (
                <div className="admin-form__preview">
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="mood">Moods (comma-separated)</label>
              <input
                id="mood"
                name="mood"
                type="text"
                value={form.mood}
                onChange={handleChange}
                placeholder="dreamy, calming"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={form.tags}
                onChange={handleChange}
                placeholder="neon, city"
              />
            </div>

            <div className="form-group">
              <label htmlFor="devices">Devices (comma-separated)</label>
              <input
                id="devices"
                name="devices"
                type="text"
                value={form.devices}
                onChange={handleChange}
                placeholder="phone, tablet, desktop"
              />
            </div>

            <div className="form-group">
              <label htmlFor="resolutions">Resolutions (comma-separated)</label>
              <input
                id="resolutions"
                name="resolutions"
                type="text"
                value={form.resolutions}
                onChange={handleChange}
                placeholder="4K, 8K"
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="fullGallery">Full gallery URLs (comma-separated)</label>
              <textarea
                id="fullGallery"
                name="fullGallery"
                value={form.fullGallery}
                onChange={handleChange}
                placeholder="https://..., https://..."
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="devicePreviewsPhone">Phone preview URLs</label>
              <input
                id="devicePreviewsPhone"
                name="devicePreviewsPhone"
                type="text"
                value={form.devicePreviewsPhone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="devicePreviewsTablet">Tablet preview URLs</label>
              <input
                id="devicePreviewsTablet"
                name="devicePreviewsTablet"
                type="text"
                value={form.devicePreviewsTablet}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="devicePreviewsDesktop">Desktop preview URLs</label>
              <input
                id="devicePreviewsDesktop"
                name="devicePreviewsDesktop"
                type="text"
                value={form.devicePreviewsDesktop}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stripePriceId">Stripe price ID</label>
              <input
                id="stripePriceId"
                name="stripePriceId"
                type="text"
                value={form.stripePriceId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="paypalProductId">PayPal product ID</label>
              <input
                id="paypalProductId"
                name="paypalProductId"
                type="text"
                value={form.paypalProductId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="hasVideo">
                <input
                  id="hasVideo"
                  name="hasVideo"
                  type="checkbox"
                  checked={form.hasVideo}
                  onChange={handleChange}
                  style={{ width: 'auto', marginRight: '0.5rem' }}
                />
                Includes video
              </label>
            </div>
          </div>

          <div className="admin-form__actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create wallpaper'}
            </button>
            <Link to="/admin/wallpapers" className="btn btn--ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
