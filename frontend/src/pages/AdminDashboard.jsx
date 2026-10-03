import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Image as ImageIcon, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE } from '../api';
import { optimizeImageUrl } from '../utils/image';
import './Admin.css';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', category: 'SUNGLASSES', brand: '', price: ''
  });

  // Image Upload State
  const [selectedProductForImage, setSelectedProductForImage] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchProducts();
  }, [token, navigate]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleCreateOrUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${API_BASE}/api/products/admin/${editingId}`
        : `${API_BASE}/api/products/admin`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price)
        })
      });
      if (res.ok) {
        setShowAddForm(false);
        setEditingId(null);
        setNewProduct({ name: '', description: '', category: 'SUNGLASSES', brand: '', price: '' });
        showToast(editingId ? "Product updated successfully!" : "Product created successfully!");
        fetchProducts(); 
      } else {
        showToast("Failed to save product. Please check inputs.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred.", "error");
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/admin/${productToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast("Product deleted successfully!");
        fetchProducts();
      } else {
        showToast("Failed to delete product.", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductToDelete(null);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFiles || imageFiles.length === 0 || !selectedProductForImage) return;

    setIsUploading(true);
    let successCount = 0;

    try {
      const product = products.find((p) => p.id === selectedProductForImage);
      const hasPrimary = product?.images?.some((img) => img.isPrimary);
      const files = Array.from(imageFiles);

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('isPrimary', !hasPrimary && i === 0);

        const res = await fetch(`${API_BASE}/api/products/admin/${selectedProductForImage}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (res.ok) successCount++;
      }

      if (successCount > 0) {
        showToast(`${successCount} image(s) uploaded successfully!`);
        setSelectedProductForImage(null);
        setImageFiles([]);
        fetchProducts();
      } else {
        showToast("Failed to upload images.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred during upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/admin/image/${imageId}/primary`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Primary image updated!');
        fetchProducts();
      } else {
        showToast('Failed to set primary image.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error setting primary image.', 'error');
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/admin/image/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Image deleted successfully!");
        fetchProducts();
      } else {
        showToast("Failed to delete image.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting image.", "error");
    }
  };

  const handleDeleteAllImages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products/admin/${selectedProductForImage}/images`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("All images deleted successfully!");
        fetchProducts();
      } else {
        showToast("Failed to delete all images.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting all images.", "error");
    }
  };

  const activeProduct = products.find(p => p.id === selectedProductForImage);
  return (
    <div className="admin-dashboard animate-fade-in">
      <div className="container">
        <header className="dashboard-header flex-between">
          <h1 className="heading-gradient">Admin Dashboard</h1>
          <button className="btn btn-outline" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </header>

        {/* Custom Toast Notification */}
        {toast.show && (
          <div className={`admin-toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => {
            setEditingId(null);
            setNewProduct({ name: '', description: '', category: 'SUNGLASSES', brand: '', price: '' });
            setShowAddForm(!showAddForm);
          }}>
            <Plus size={20} /> Add New Product
          </button>
        </div>

        {showAddForm && (
          <div className="admin-form-card glass-panel">
            <h3>{editingId ? "Edit Product" : "Create Product"}</h3>
            <form onSubmit={handleCreateOrUpdateProduct}>
              <div className="form-grid">
                <input type="text" className="input-field" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                <input type="text" className="input-field" placeholder="Brand" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} required />
                <select className="input-field" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  <option value="SUNGLASSES">Sunglasses</option>
                  <option value="MAGNETIC_GLASSES">Magnetic Glasses</option>
                  <option value="SYSTEM_GLASSES">System Glasses</option>
                </select>
                <input type="number" step="0.01" className="input-field" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
              </div>
              <textarea className="input-field mt-3" placeholder="Description" rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required></textarea>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{editingId ? "Update Product" : "Save Product"}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {productToDelete && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <h3 style={{ marginBottom: '16px', color: '#000000', fontSize: '1.5rem', fontWeight: 'bold' }}>Confirm Deletion</h3>
              <p style={{ marginBottom: '24px', color: '#333333', lineHeight: '1.5', fontSize: '1.1rem' }}>Are you sure you want to delete this product?<br/><b>This action cannot be undone.</b></p>
              <div className="flex" style={{ gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-outline" style={{ borderColor: '#666', color: '#333' }} onClick={() => setProductToDelete(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#ff4757', borderColor: '#ff4757', color: '#fff' }} onClick={confirmDeleteProduct}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {selectedProductForImage && (
          <div className="admin-form-card glass-panel">
            <h3>Manage Images for Product ID: {selectedProductForImage}</h3>
            
            {activeProduct && activeProduct.images && activeProduct.images.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: 0 }}>Existing Images ({activeProduct.images.length})</h4>
                  <button className="btn btn-outline" style={{ borderColor: '#ff4757', color: '#ff4757', padding: '6px 12px', fontSize: '0.9rem' }} onClick={handleDeleteAllImages}>
                    Delete All
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {activeProduct.images.map(img => (
                    <div key={img.id} style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                      <img src={optimizeImageUrl(img.imageUrl, 200)} alt="product" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      {img.isPrimary && (
                        <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#2ed573', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px' }}>
                          Primary
                        </span>
                      )}
                      {!img.isPrimary && (
                        <button
                          onClick={() => handleSetPrimaryImage(img.id)}
                          style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.65rem', padding: '2px 6px', cursor: 'pointer' }}
                          title="Set as primary image"
                        >
                          Set Primary
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteImage(img.id)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Delete this image"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleImageUpload} className="upload-form" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <h4 style={{ marginBottom: '16px' }}>Upload New Images</h4>
              <input
                type="file"
                className="file-input-visible"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(e.target.files)}
                required
              />
              {imageFiles && imageFiles.length > 0 && (
                <p className="file-selected-count">{imageFiles.length} image{imageFiles.length > 1 ? 's' : ''} selected</p>
              )}
              <div className="upload-actions">
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => { setSelectedProductForImage(null); setImageFiles([]); }} disabled={isUploading}>Close</button>
              </div>
            </form>
          </div>
        )}

        <h2>Inventory Overview</h2>
        <div className="admin-table-container glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Images</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Loading...</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price.toFixed(2)}</td>
                  <td>{p.images ? p.images.length : 0}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="icon-btn" onClick={() => setSelectedProductForImage(p.id)} title="Upload Image" style={{ marginRight: '8px' }}>
                      <ImageIcon size={18} />
                    </button>
                    <button className="icon-btn" onClick={() => handleEditClick(p)} title="Edit Product" style={{ marginRight: '8px' }}>
                      <Edit2 size={18} />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => setProductToDelete(p.id)} title="Delete Product" style={{ color: 'var(--accent-primary)' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
