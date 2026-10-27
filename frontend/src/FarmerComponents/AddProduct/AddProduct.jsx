import React, { useEffect, useState } from 'react';
import styles from './AddProduct.module.css';
import NavBar from '../NavBar/NavBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addProductService } from '../../Service/AddProductService';
import { fetchCategories } from '../../Service/UserService';
import { getErrorMessage } from '../../Service/AxiosInstant';

const FALLBACK_CATEGORIES = ['Vegetables', 'Fruits', 'Legumes', 'Oilseeds', 'Grains', 'Tuber Crops', 'Spices', 'Ornamental'];

const EMPTY_PRODUCT = {
  title: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  discount: 0,
  image: null,
  isActive: true,
};

const AddProduct = () => {
  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [formKey, setFormKey] = useState(0); // remounts the form to reset the file input

  // Categories come from GET /api/categories (fallback to the defaults)
  useEffect(() => {
    fetchCategories()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) setCategories(list.map((c) => c.name));
      })
      .catch(() => {});
  }, []);

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
    formData.append('discount', product.discount || 0);
    formData.append('active', String(product.isActive) === 'true');
    
    // Append the image file separately
    if (product.image) {
      formData.append('image', product.image);
    }
  
    try {
      const created = await addProductService(formData);
      toast.success(`Product "${created.title}" added successfully!`);
      setProduct(EMPTY_PRODUCT);
      setFormKey((k) => k + 1);
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error(getErrorMessage(error, 'Failed to add product!'));
    }
  };
  
  

  return (
    <>
      <NavBar />
      <form key={formKey} onSubmit={handleSubmit} className={styles.form}>
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
            {categories.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
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
          Product Discount (%):
          <input
            type="number"
            name="discount"
            min="0"
            max="100"
            value={product.discount}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter Discount (0-100)"
          />
        </label>

        <label className={styles.label}>
          Product Image:
          <input
            type="file"
            name="image"
            accept="image/*"
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
