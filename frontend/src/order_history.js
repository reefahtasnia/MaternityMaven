import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CSS/order_history.css'; // Assuming you have some CSS styles like the design you shared

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch userId from local storage
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
  console.log("Retrieved userId:", userId);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${userId}`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching order history');
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrderHistory();
    }
  }, [userId]);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="order-history-container">
      <h1>Order History</h1>
      <div className="order-grid">
        {orders.length > 0 ? (
          orders.map(order => (
            <div /*key={order.order_id}*/ className="order-card">
              <img src="./assets/delivery.png" alt="Delivery Icon" className="order-image" />
              <div className="order-details">
                <h2>Order Id: {order.ORDER_ID}</h2>
                <p>Date: {new Date(order.DATE_T).toLocaleDateString()}</p>
                <p>Total Bill: Tk {order.BILL}</p>
                <button className="details-button">Details</button>
              </div>
            </div>
          ))
        ) : (
          <div>No orders found</div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
