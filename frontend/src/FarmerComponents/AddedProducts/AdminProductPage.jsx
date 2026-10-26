import { useState ,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Service/AxiosInstant";
import NavBar from "../NavBar/NavBar";
import styles from  "./AdminProductPage.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  
    axiosInstance.get("/admin/myproducts").then((response) => {
      setProducts(response.data);
    });
  }, []);

  const handleDelete = (id) => {
    axiosInstance.get(`/admin/deleteProduct/${id}`).then((response) => {
      if (response.data.includes("success")) {
        toast.success("Product deleted Sucessfully");
        setProducts(products.filter((product) => product.id !== id));
      }
    });
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
                  src={`${import.meta.env.VITE_API_URL}/img/product_img/${product.image}`}
                  alt={product.title}
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <p>Price: ${product.price}</p>
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
