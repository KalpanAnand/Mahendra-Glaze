import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getPrimaryImageUrl, withPrimaryImageOnly } from '../utils/image';
import { API_BASE } from '../api';
import './Products.css';

export default function Products({ defaultCategory = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // added sorting state
  const { addToCart } = useCart();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get('search');

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE}/api/products`;
    
    // Add query parameters based on route or search bar
    if (search) {
      url += `?search=${search}`;
    } else if (defaultCategory) {
      url += `?category=${defaultCategory}`;
    }

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json();
      })
      .then(data => {
        const list = (Array.isArray(data) ? data : []).map(withPrimaryImageOnly);
        setProducts(list);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setProducts([]);
        setLoading(false);
      });
  }, [defaultCategory, search, location.search]);

  // Apply sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0; // newest/default
  });

  return (
    <div className="products-page animate-fade-in">
      <div className="container">
        <header className="products-header flex-between">
          <div>
            <h1 className="heading-gradient">
              {search ? `Search: ${search}` : defaultCategory ? defaultCategory.replace('_', ' ') : 'All Collection'}
            </h1>
            <p className="products-count">{sortedProducts.length} Products Found</p>
          </div>
        </header>

        <div className="product-grid">
            {sortedProducts.length === 0 ? (
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
