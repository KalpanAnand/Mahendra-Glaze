import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getPrimaryImageUrl, withPrimaryImageOnly } from '../utils/image';
import { API_BASE, fetchJson } from '../api';
import './Products.css';

export default function Products({ defaultCategory = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const { addToCart } = useCart();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get('search');

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      let url = `${API_BASE}/api/products`;
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      } else if (defaultCategory) {
        url += `?category=${encodeURIComponent(defaultCategory)}`;
      }

      try {
        const data = await fetchJson(url, { signal: controller.signal });
        if (cancelled) return;
        const list = (Array.isArray(data) ? data : []).map(withPrimaryImageOnly);
        setProducts(list);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        console.error('Failed to fetch products:', err);
        setProducts([]);
        setError(err.message || 'Unable to load products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [defaultCategory, search, retryCount]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="products-page animate-fade-in">
      <div className="container">
        <header className="products-header flex-between">
          <div>
            <h1 className="heading-gradient">
              {search ? `Search: ${search}` : defaultCategory ? defaultCategory.replace('_', ' ') : 'All Collection'}
            </h1>
            <p className="products-count">
              {loading
                ? 'Loading products...'
                : error
                  ? 'Unable to load products'
                  : `${sortedProducts.length} Products Found`}
            </p>
          </div>
        </header>

        <div className="product-grid">
          {loading ? (
            <p className="empty-state">Loading products…</p>
          ) : error ? (
            <div className="empty-state products-error">
              <p>{error}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Retry
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <p className="empty-state">No products match your criteria.</p>
          ) : (
            sortedProducts.map((product) => {
              const listingImageUrl = getPrimaryImageUrl(product, 600);
              return (
                <div key={product.id} className="product-card glass-panel">
                  <div className="product-image-container">
                    <img
                      src={listingImageUrl}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                      width="600"
                      height="600"
                    />
                    <div className="product-category-badge">{product.category}</div>
                  </div>
                  <div className="product-info">
                    <p className="product-brand">{product.brand}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-bottom flex-between">
                      <span className="product-price">₹{product.price.toFixed(2)}</span>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <Link to={`/products/${product.id}`} className="btn btn-outline buy-btn">View Details</Link>
                        <button
                          className="btn btn-primary buy-btn"
                          onClick={() => addToCart(product)}
                          title="Add to Cart"
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
