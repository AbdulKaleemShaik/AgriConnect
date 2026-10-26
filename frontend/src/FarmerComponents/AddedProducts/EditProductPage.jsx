import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./EditProduct.module.css";
import axiosInstance from "../../Service/AxiosInstant";

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({
    id:"",
    title: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    discount: 0,
    discountPrice: 0,
    isActive: false,
  });

  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    axiosInstance.get(`/product/${id}`).then((response) => {
      setProduct({
        ...response.data,  
        id: response.data.id 
      });
    });
  }, [id]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCheckboxChange = (e) => {
    setProduct({ ...product, isActive: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", product.id);
    formData.append("title", product.title);
    formData.append("description", product.description);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("discount", product.discount);
    formData.append("discountPrice", product.discountPrice);
    formData.append("isActive", product.isActive);

    if (file) {
      formData.append("file", file);
    }

    try {
    
      const response = await axiosInstance.post("/admin/updateProduct", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

     
      if (response.status === 200) {
        toast.success("Product updated successfully!");
        navigate("/myproducts");
      } else {
        toast.error("Failed to update product. Try again!");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again!");
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={product.title}
            onChange={handleInputChange}
            className={styles.inputs}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            className={styles.inputs}
            name="description"
            value={product.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label>Category</label>
          <select
            name="category"
            value={product.category}
            onChange={handleInputChange}
            required
          >
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="millets">Millets</option>
            <option value="non-veg">Non-Veg</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Price</label>
          <input
            className={styles.inputs}
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Stock</label>
          <input
            className={styles.inputs}
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Discount (%)</label>
          <input
            className={styles.inputs}
            type="number"
            name="discount"
            value={product.discount}
            onChange={handleInputChange}
            min="0"
            max="100"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Discount Price</label>
          <input
            className={styles.inputs}
            type="number"
            name="discountPrice"
            value={product.discountPrice}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            <input
              className={styles.inputs}
              type="checkbox"
              name="isActive"
              checked={product.isActive}
              onChange={handleCheckboxChange}
            />
            Active
          </label>
        </div>

        <div className={styles.formGroup}>
          <label>Product Image</label>
          <input type="file" onChange={handleFileChange} />
        </div>

        <button type="submit" className={styles.submitBtn}>
          Update Product
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default EditProduct;
