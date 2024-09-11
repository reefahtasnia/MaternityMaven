import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/cart.css'; // Adjust the path to your CSS file

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  useEffect(() => {
    // Fetch the cart data from the backend
    const fetchCartData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cart2');
	   const data = await response.data;
	   console.log("Cart data: ",data);
	   setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart data:', error);	
        setError('Error fetching cart data. Please try again later.');
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const handleQuantityChange = async (id, change) => {
    // Update local state
    setProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.productId === id) {
          const newQuantity = product.quantity + change;
          return { ...product, quantity: newQuantity > 0 ? newQuantity : product.quantity };
        }
        return product;
      })
    );

    // Update the quantity in the database
    try {
      await axios.put(`http://localhost:5000/api/cart/${id}`, { change });
    } catch (error) {
      console.error('Error updating cart data:', error);
    }
  };

  const handleRemove = async (id) => {
    try {
      // Make DELETE request to backend API
      await axios.delete(`http://localhost:5000/api/cart/${id}`);
      
      // Update local state after successful deletion
      setProducts(prevProducts => prevProducts.filter(product => product.productId !== id));
    } catch (error) {
      console.error('Error removing product from cart:', error);
      setError('Error removing product from cart. Please try again later.');
    }
  };

  //const navigate = useNavigate();

  const getUserFromLocalStorage = () => {
    const userString = localStorage.getItem("user");
    try {
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Failed to parse user from local storage:", error);
      return null;
    }
  };

  const auth = getUserFromLocalStorage();
  const userId = auth ? auth.userId : null;
  console.log("Retrieved userId:", userId); // Debug log the userId

  const handleConfirmOrder = async () => {
    setButtonsDisabled(true);

    try {
      const response = await axios.post('http://localhost:5000/api/order', { cartItems: products,  userId: userId });
      if (response.data.success) {
        setProducts([]);
        alert(`Order confirmed! Your order ID is ${response.data.orderId}`);
      } else {
        alert('Error confirming order');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Error confirming order. Please try again later.');
    }

    setButtonsDisabled(false);
  };

  const subtotal = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  //if (loading) return <div>Loading...</div>;
  //if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="container-fluid bg-secondary mb-5">
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '300px' }}>
          <h1 className="font-weight-semi-bold text-uppercase mb-3">Shopping Cart</h1>
          <div className="d-inline-flex">
            <p className="m-0"><a href="/">Home</a></p>
            <p className="m-0 px-2">-</p>
            <p className="m-0">Shopping Cart</p>
          </div>
        </div>
      </div>

      <div className="container-fluid pt-5">
        <div className="row px-xl-5">
          <div className="col-lg-8 table-responsive mb-5">
            <table className="table table-bordered text-center mb-0">
              <thead className="bg-secondary text-dark">
                <tr>
                  <th>Products</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {products.map(product => (
                  <tr key={product.PRODUCTID}>
                    <td className="align-middle">{product.TITLE}</td>
                    <td className="align-middle">Tk {product.PRICE}</td>
                    <td className="align-middle">
                      <div className="input-group quantity mx-auto" style={{ width: '100px' }}>
                        <div className="input-group-btn">
                          <button className="btn btn-sm btn-primary btn-minus" onClick={() => handleQuantityChange(product.PRODUCTID, -1)} disabled={buttonsDisabled}>
                            <i className="fa fa-minus"></i> -
                          </button>
                        </div>
                        <input type="text" className="form-control form-control-sm bg-secondary text-center" value={product.QUANTITY} readOnly />
                        <div className="input-group-btn">
                          <button className="btn btn-sm btn-primary btn-plus" onClick={() => handleQuantityChange(product.PRODUCTID, 1)} disabled={buttonsDisabled}>
                            <i className="fa fa-plus"></i> +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">Tk {product.PRICE * product.QUANTITY}</td>
                    <td className="align-middle">
                      <button className="btn btn-sm btn-primary" onClick={() => handleRemove(product.PRODUCTID)} disabled={buttonsDisabled}>
                        <i className="fa fa-times"></i> X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-lg-4">
            <div className="card border-secondary mb-5">
              <div className="card-header bg-secondary border-0">
                <h4 className="font-weight-semi-bold m-0">Cart Summary</h4>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3 pt-1">
                  <h6 className="font-weight-medium">Subtotal</h6>
                  <h6 className="font-weight-medium">Tk {subtotal}</h6>
                </div>
                <div className="d-flex justify-content-between">
                  <h6 className="font-weight-medium">Shipping</h6>
                  <h6 className="font-weight-medium">Tk {shipping}</h6>
                </div>
              </div>
              <div className="card-footer border-secondary bg-transparent">
                <div className="d-flex justify-content-between mt-2">
                  <h5 className="font-weight-bold">Total</h5>
                  <h5 className="font-weight-bold">Tk {total}</h5>
                </div>
                <button className="btn btn-block btn-primary my-3 py-3" onClick={handleConfirmOrder} disabled={buttonsDisabled}>Confirm Order</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
