import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { optimizeImageUrl } from '../utils/image';
import { API_BASE } from '../api';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const { addToCart } = useCart();

  const navigateImage = (e, direction) => {
    e.stopPropagation();
    if (!product || !product.images) return;
    const currentIndex = product.images.findIndex(img => img.id === fullScreenImage.id);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = product.images.length - 1;
    if (nextIndex >= product.images.length) nextIndex = 0;
    setFullScreenImage(product.images[nextIndex]);
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not Found");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="loading-state" style={{paddingTop: '120px'}}>Loading Details...</div>;
  }

  if (!product) {
    return (
      <div className="empty-state" style={{paddingTop: '120px'}}>
        <h2>Product Not Found</h2>
        <Link to="/products" className="btn btn-outline" style={{marginTop: '20px'}}>Back to Collection</Link>
      </div>
    );
  }

  return (
    <>
      <div className="product-details-page animate-fade-in">
        <div className="container">
          <Link to="/products" className="back-link">
            <ArrowLeft size={18} /> Back to Collection
          </Link>
          
          <div className="details-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="badge" style={{ display: 'inline-block', marginBottom: '16px' }}>{product.category}</div>
            <h1 className="details-name details-name-responsive" style={{ marginBottom: '8px' }}>{product.name}</h1>
            <p className="details-brand" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>by {product.brand}</p>
            <div className="details-price details-price-responsive" style={{ fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '24px' }}>
              ₹{product.price.toFixed(2)}
            </div>
            <p className="details-description" style={{ maxWidth: '800px', margin: '0 auto 32px auto', fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {product.description}
            </p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>Available Styles ({product.images ? product.images.length : 0})</h3>
          </div>
          
          <div className="variant-gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {product.images && product.images.map((img) => (
              <div key={img.id} className="variant-card glass-panel" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', aspectRatio: '1/1' }}>
                <img 
                  src={optimizeImageUrl(img.imageUrl, 300)} 
                  alt="Style Variant" 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', cursor: 'pointer', background: '#fff' }} 
                  onClick={() => setFullScreenImage(img)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal - Placed outside animate-fade-in to escape stacking context */}
      {fullScreenImage && (
        <div 
          className="modal-container"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, height: '100vh', width: '100vw', background: 'rgba(0,0,0,0.95)', zIndex: 9999999 }}
          onClick={() => setFullScreenImage(null)}
        >
          <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn btn-outline" 
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={(e) => {
                e.stopPropagation();
                setFullScreenImage(null);
              }}
            >
              <ArrowLeft size={18} /> Back to Collection
            </button>
            {product && product.images && product.images.length > 0 && (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px' }}>
                {product.images.findIndex(img => img.id === fullScreenImage.id) + 1} / {product.images.length}
              </span>
            )}
          </div>
          
          {/* Left Side: Photo and Navigation */}
          <div className="modal-left" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', height: '100%' }} onClick={(e) => e.stopPropagation()}>
            {product && product.images && product.images.length > 1 && (
              <button 
                className="icon-btn" 
                style={{ position: 'absolute', left: '20px', color: 'white', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%', zIndex: 10 }}
                onClick={(e) => navigateImage(e, -1)}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <img 
              src={optimizeImageUrl(fullScreenImage.imageUrl, 1200)} 
              alt="Fullscreen Style" 
              style={{ width: '100%', height: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} 
            />

            {product && product.images && product.images.length > 1 && (
              <button 
                className="icon-btn" 
                style={{ position: 'absolute', right: '20px', color: 'white', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%', zIndex: 10 }}
                onClick={(e) => navigateImage(e, 1)}
              >
                <ChevronRight size={32} />
              </button>
            )}
          </div>
          
          {/* Right Side: Buttons */}
          <div className="modal-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '20px' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '1.2rem', display: 'flex', justifyContent: 'center' }}
              onClick={() => {
                addToCart(product, fullScreenImage);
                setFullScreenImage(null);
              }}
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <button 
              className="btn" 
              style={{ width: '100%', backgroundColor: '#25D366', color: 'white', border: 'none', padding: '16px', fontSize: '1.2rem', display: 'flex', justifyContent: 'center' }}
              onClick={() => {
                const message = `Hello Mahendra Glaze, I would like to place an order for a specific style:%0A%0A1x ${product.name} - ₹${product.price.toFixed(2)}%0AStyle Image: ${fullScreenImage.imageUrl}%0A%0ATotal: ₹${product.price.toFixed(2)}`;
                window.open(`https://wa.me/919787698174?text=${message}`, '_blank');
              }}
            >
              <MessageCircle size={20} /> Buy Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
