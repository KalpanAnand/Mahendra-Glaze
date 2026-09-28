import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            See the World in <br />
            <span className="heading-gradient">Perfect Clarity.</span>
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
        <div className="hero-overlay"></div>
      </section>
    </div>
  );
}
