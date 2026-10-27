import { useState ,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { assetUrl, getErrorMessage } from "../../Service/AxiosInstant";
import { getMyProducts, deleteProduct } from "../../Service/FarmerService";
import NavBar from "../NavBar/NavBar";
import styles from  "./AdminProductPage.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  
    getMyProducts()
      .then(setProducts)
      .catch((error) => toast.error(getErrorMessage(error, "Could not load your products")));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Delete this product?")) return;
    deleteProduct(id)
      .then(() => {
        toast.success("Product deleted Sucessfully");
        setProducts((prev) => prev.filter((product) => product.id !== id));
      })
      .catch((error) => toast.error(getErrorMessage(error, "Could not delete the product")));
  };

  const handleEdit = (id) => {
    navigate(`/editProduct/${id}`);
  };

  return (
    <>
      <NavBar />
      <div className={styles.container}>
        <h2>My Products</h2>
        <div className={styles.productList}>
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <img
                  src={assetUrl(product.imageUrl)}
                  alt={product.title}
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <p>Price: ${product.price}{product.discount > 0 ? ` (${product.discount}% off: $${product.discountPrice})` : ""}</p>
                  <p>Stock: {product.stock}{!product.active ? " · Inactive" : ""}</p>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleEdit(product.id)}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No products found</p>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default MyProducts;
