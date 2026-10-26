
import NavBar from '../NavBar/NavBar';
import styles from './MyProductPage.module.css';
import { useNavigate } from 'react-router-dom';

const MyProductPage = () => {
  const naviage = useNavigate();
  function handleAddProduct(e) {
    e.preventDefault();
    naviage("/addproduct")

  }
  return (
    <div className={styles.container}>
      {/* Navbar */}

      <NavBar />

      {/* Header */}
      <div className={styles.header}>
        <h2>All Products</h2>
        <button onClick={handleAddProduct} className={styles.addProductBtn}>
          Add New Product <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* Products Section */}
      <div className={styles.products}>
        {/* Product Card 1 */}
        <div className={styles.productCard}>
          <h3>Wheat Seeds</h3>
          <p>High-quality wheat seeds for better yield.</p>
        </div>

        {/* Product Card 2 */}
        <div className={styles.productCard}>
          <h3>Organic Fertilizer</h3>
          <p>Eco-friendly fertilizer to enhance soil fertility.</p>
        </div>

        {/* Product Card 3 */}
        <div className={styles.productCard}>
          <h3>Tractor Rental</h3>
          <p>Affordable tractor rental services for your farm.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <a href="/home">Home</a>
        <a href="/features">Features</a>
        <a href="/pricing">Pricing</a>
        <a href="/faqs">FAQs</a>
        <a href="/about">About</a>
      </footer>
    </div>
  );
};

export default MyProductPage;
