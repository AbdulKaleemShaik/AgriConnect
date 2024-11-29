import React, { useState } from 'react';
import styles from './AddProduct.module.css';
import NavBar from '../NavBar/NavBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addProductService } from '../../Service/AddProductService'; 

const AddProduct = () => {
  const [product, setProduct] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    image: null,
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProduct({
      ...product,
      [name]: files ? files[0] : value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    
    // Append the product object properties to formData
    formData.append('title', product.title);
    formData.append('description', product.description);
    formData.append('category', product.category);
    formData.append('price', product.price);
    formData.append('stock', product.stock);
    formData.append('isActive', product.isActive);
    
    // Append the image file separately
    formData.append('file', product.image);
  
    try {
      const response = await addProductService(formData);
      toast.success(response);
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product!');
    }
  };
  
  

  return (
    <>
      <NavBar />
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Insert Your New Product</h2>

        <label className={styles.label}>
          Product Title:
          <input
            type="text"
            name="title"
            value={product.title}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter Product title"
          />
        </label>

        <label className={styles.label}>
          Product Description:
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className={styles.textarea}
            placeholder="Enter Product Description"
          />
        </label>

        <label className={styles.label}>
          Product Categories:
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="">Select a Category</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
            <option value={"Crops"}>Crops</option>
          </select>
        </label>

        <label className={styles.label}>
          Product Price:
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter Product price"
          />
        </label>

        <label className={styles.label}>
          Product Stock:
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter Product Stock"
          />
        </label>

        <label className={styles.label}>
          Product Image:
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className={styles.inputFile}
          />
        </label>

        <label className={styles.label}>
          Product Active:
          <select
            name="isActive"
            value={product.isActive}
            onChange={handleChange}
            className={styles.select}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </label>

        <button type="submit" className={styles.button}>INSERT</button>
      </form>
      <ToastContainer />
    </>
  );
};

export default AddProduct;
