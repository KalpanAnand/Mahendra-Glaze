import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="container flex-between nav-content">
        <Link to="/" className="nav-brand heading-gradient">
          <span>Mahendra</span>
          <span>Glaze</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/sunglasses">Sunglasses</Link>
          <Link to="/magnetic-glasses">Magnetic Glasses</Link>
          <Link to="/system-glasses">System Glasses</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="nav-actions">
          {showSearch ? (
            <form onSubmit={handleSearch} style={{display: 'flex', alignItems: 'center'}}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'white', outline: 'none'}}
                autoFocus
              />
            </form>
          ) : (
            <button className="icon-btn" onClick={() => setShowSearch(true)}><Search size={20} /></button>
          )}
          
          <button className="icon-btn admin-btn" onClick={() => navigate('/admin')} title="Admin Login"><User size={20} /></button>
          <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={20} />
            <span className="cart-badge">{cartCount}</span>
          </button>
          <button
            className="icon-btn mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-dropdown">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/sunglasses" onClick={() => setIsMobileMenuOpen(false)}>Sunglasses</Link>
          <Link to="/magnetic-glasses" onClick={() => setIsMobileMenuOpen(false)}>Magnetic Glasses</Link>
          <Link to="/system-glasses" onClick={() => setIsMobileMenuOpen(false)}>System Glasses</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
        </div>
      )}
    </nav>
  );
}
