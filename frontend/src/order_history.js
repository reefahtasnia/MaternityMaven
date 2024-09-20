import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CSS/order_history.css'; // Assuming you have some CSS styles like the design you shared

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch userId from local storage
  const userId = JSON.parse(localStorage.getItem('user'))?.userId;

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
            <div key={order.order_id} className="order-card">
              <img src="./assets/delivery.png" alt="Delivery Icon" className="order-image" />
              <div className="order-details">
                <h2>Order Id: {order.order_id}</h2>
                <p>Date: {new Date(order.date_t).toLocaleDateString()}</p>
                <p>Total Bill: Tk {order.bill}</p>
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
