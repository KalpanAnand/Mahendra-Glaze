import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ContactUs from './pages/ContactUs';
import CartSidebar from './components/CartSidebar';
import { useCart } from './context/CartContext';

function App() {
  const { isCartOpen, setIsCartOpen } = useCart();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sunglasses" element={<Products defaultCategory="SUNGLASSES" />} />
          <Route path="/magnetic-glasses" element={<Products defaultCategory="MAGNETIC_GLASSES" />} />
          <Route path="/system-glasses" element={<Products defaultCategory="SYSTEM_GLASSES" />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default App;
