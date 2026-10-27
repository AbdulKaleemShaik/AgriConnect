import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./EditProduct.module.css";
import { getErrorMessage } from "../../Service/AxiosInstant";
import { getProductById, updateProduct } from "../../Service/FarmerService";
import { fetchCategories } from "../../Service/UserService";

const FALLBACK_CATEGORIES = ["Vegetables", "Fruits", "Legumes", "Oilseeds", "Grains", "Tuber Crops", "Spices", "Ornamental"];

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({
    id: "",
    title: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    discount: 0,
    active: false,
  });
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProductById(id)
      .then((data) => {
        setProduct({
          id: data.id,
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          price: data.price ?? 0,
          stock: data.stock ?? 0,
          discount: data.discount ?? 0,
          active: !!data.active,
        });
      })
      .catch((error) => toast.error(getErrorMessage(error, "Could not load the product")));
  }, [id]);

  useEffect(() => {
    fetchCategories()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) setCategories(list.map((c) => c.name));
      })
      .catch(() => {});
  }, []);

  // The discounted price is computed by the server; shown here for reference
  const discountPrice = (Number(product.price || 0) * (100 - Number(product.discount || 0)) / 100).toFixed(2);
  const categoryOptions = product.category && !categories.includes(product.category)
    ? [product.category, ...categories]
    : categories;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCheckboxChange = (e) => {
    setProduct({ ...product, active: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", product.title);
    formData.append("description", product.description);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("discount", product.discount);
    formData.append("active", product.active);

    if (file) {
      formData.append("image", file);
    }

    try {
      await updateProduct(product.id || id, formData);
      toast.success("Product updated successfully!");
      navigate("/myproducts");
    } catch (error) {
      toast.error(getErrorMessage(error, "An error occurred. Please try again!"));
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
            {categoryOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
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
            min="0.01"
            step="0.01"
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
            min="0"
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
            value={discountPrice}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            <input
              className={styles.inputs}
              type="checkbox"
              name="active"
              checked={product.active}
              onChange={handleCheckboxChange}
            />
            Active
          </label>
        </div>

        <div className={styles.formGroup}>
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
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
