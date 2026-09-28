import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Filter, ChevronDown, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { optimizeImageUrl } from '../utils/image';
import './Products.css';

export default function Products({ defaultCategory = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // added sorting state
  const { addToCart } = useCart();
  
  const navigate = useNavigate();
  
  // Custom hook to parse query parameters
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get('search');

  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:8080/api/products';
    
    // Add query parameters based on route or search bar
    if (search) {
      url += `?search=${search}`;
    } else if (defaultCategory) {
      url += `?category=${defaultCategory}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.length === 1 && !search) {
          navigate(`/products/${data[0].id}`, { replace: true });
        } else {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
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
              sortedProducts.map((product) => (
                <div key={product.id} className="product-card glass-panel">
                  <div className="product-image-container">
                    <img 
                      src={product.images && product.images.length > 0 
                        ? optimizeImageUrl(product.images.find(img => img.isPrimary)?.imageUrl || product.images[0].imageUrl)
                        : "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600"} 
                      alt={product.name} 
                      className="product-image"
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
              ))
            )}
          </div>
      </div>
    </div>
  );
}
