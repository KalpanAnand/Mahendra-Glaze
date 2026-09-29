import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <img
          className="hero-photo"
          src="https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=2000"
          alt="Premium eyewear"
        />
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title" style={{ fontFamily: "'Cinzel Decorative', serif", textTransform: 'uppercase' }}>
            Mahendra Glaze
          </h1>
          <p className="hero-subtitle">
            Premium eyewear designed for the modern individual. Experience unparalleled comfort and style with our exclusive collection.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Shop Collection <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
