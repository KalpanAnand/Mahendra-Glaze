import { MapPin, Phone, User, Mail } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="animate-fade-in" style={{ paddingTop: '120px', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="heading-gradient" style={{ fontSize: '3rem', marginBottom: '16px' }}>Contact Us</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>We'd love to hear from you. Get in touch with us!</p>
        </div>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <div className="glass-panel" style={{ padding: '40px', flex: '1', minWidth: '300px', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,199,0,0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent-primary)' }}>
              <User size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Store Manager</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>M. Mahendran</p>
          </div>

          <div className="glass-panel" style={{ padding: '40px', flex: '1', minWidth: '300px', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,199,0,0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent-primary)' }}>
              <Phone size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Phone / WhatsApp</h3>
            <a href="https://wa.me/918148112924" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', textDecoration: 'underline' }}>
              +91 81481 12924
            </a>
          </div>

          <div className="glass-panel" style={{ padding: '40px', flex: '1', minWidth: '300px', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,199,0,0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent-primary)' }}>
              <MapPin size={30} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Store Address</h3>
            <a href="https://maps.google.com/?q=Vision+Eye+Care,+Main+Street,+Tech+Park,+Chennai,+Tamil+Nadu" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', display: 'block', textDecoration: 'underline' }}>
              Vision Eye Care<br />
              Main Street, Tech Park<br />
              Chennai, Tamil Nadu
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
