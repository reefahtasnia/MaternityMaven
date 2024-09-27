import React, { useState } from "react";
import "./CSS/AddProduct.css";

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [productImage, setProductImage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false); // State to toggle add form
  const [showUpdateForm, setShowUpdateForm] = useState(false); // State to toggle update for
  const handleSubmit = async (event) => {
    event.preventDefault();
    const productData = { productName, category, price, stock, productImage };
    console.log("Submitting Form data:", productData);

    try {
      const response = await fetch('http://localhost:5000/api/add-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });
      const responseData = await response.json();
      console.log("Response Data:", responseData);
      alert(responseData.message);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const updateData = { productName, stock };
    console.log("Updating Form data:", updateData);

    try {
      const response = await fetch('http://localhost:5000/api/update-quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      const responseData = await response.json();
      alert(responseData.message);
    } catch (error) {
      console.error("Failed to update product stock:", error);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const toggleUpdateForm = () => {
    setShowUpdateForm(!showUpdateForm);
  };

  return (
    <div className="add-product-container">
      <button className="update-stock-button" onClick={toggleAddForm}>
        {showAddForm ? "Hide Add Product Form" : "Show Add Product Form"}
      </button>
      {showAddForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <h2>Add New Product</h2>
          <div className="input-group">
            <label htmlFor="productImage">Product Name</label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a Category</option>
              <option value="maternity">Maternity Products</option>
              <option value="baby">Baby Products & Toys</option>
              <option value="food">Food</option>
              <option value="clothes">Clothes</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="productImage">Product Image</label>
            <input
              type="text"
              id="productImage"
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
              required
            />
          </div>
          <button className="product" type="submit">
            Add Product
          </button>
        </form>
      )}
      <button className="update-stock-button" onClick={toggleUpdateForm}>
        {showUpdateForm ? "Hide Update Stock Form" : "Show Update Stock Form"}
      </button>
      {showUpdateForm && (
        <form className="update-form" onSubmit={handleUpdate}>
          <h3>Update Product Stock</h3>
          <div className="input-group">
            <label htmlFor="updateProductName">Product Name</label>
            <input
              type="text"
              id="updateProductName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="updateStock">New Stock Quantity</label>
            <input
              type="number"
              id="updateStock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <button className="product" type="submit">
            Update Stock
          </button>
        </form>
      )}
    </div>
  );
};

export default AddProduct;
