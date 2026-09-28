import { useCart } from '../context/CartContext';
import { X, Trash2 } from 'lucide-react';
import './CartSidebar.css';

export default function CartSidebar({ isOpen, onClose }) {
  const { cartItems, setCartItems, cartCount } = useCart();

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => (item.cartItemId || item.id) !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if ((item.cartItemId || item.id) === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    const message = `Hello Vision Eye Care, I would like to place an order:%0A%0A` + 
      cartItems.map(item => `${item.quantity}x ${item.name} - ₹${(item.price * item.quantity).toFixed(2)}`).join('%0A') +
      `%0A%0ATotal: ₹${total.toFixed(2)}`;
    
    setCartItems([]);
    onClose();
    window.open(`https://wa.me/919787698174?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={onClose}></div>
      <div className="cart-sidebar glass-panel">
        <div className="cart-header flex-between">
          <h2>Your Cart ({cartCount})</h2>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            cartItems.map(item => (
              <div key={item.cartItemId || item.id} className="cart-item flex-between">
                <div>
                  <h4>{item.name}</h4>
                  <p>₹{item.price.toFixed(2)}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.cartItemId || item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId || item.id, 1)}>+</button>
                  </div>
                </div>
                <button className="icon-btn delete-btn" onClick={() => removeFromCart(item.cartItemId || item.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="flex-between total-row">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary w-100" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
