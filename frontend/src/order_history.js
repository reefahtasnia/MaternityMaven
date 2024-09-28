import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CSS/order_history.css';
import './CSS/ordermodal.css'; // Assuming you have some CSS styles like the design you shared

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // Holds the order for which details are shown
  const [orderDetails, setOrderDetails] = useState([]); // Holds the details of a specific order
  const [modalVisible, setModalVisible] = useState(false); // Controls modal visibility

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

  // Fetch detailed order information for a specific order
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orderdetails/${orderId}`);
      setOrderDetails(response.data.data);
      setSelectedOrder(orderId);
      setModalVisible(true); // Show modal
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setOrderDetails([]);
    setSelectedOrder(null);
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="order-history-container">
      <h1>Order History</h1>
      <div className="order-grid">
        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order.ORDER_ID} className="order-card">
              <img src="./assets/delivery.png" alt="Delivery Icon" className="order-image" />
              <div className="order-details">
                <h2>Order Id: {order.ORDER_ID}</h2>
                <p>Date: {new Date(order.DATE_T).toLocaleDateString()}</p>
                <p>Total Bill: Tk {order.BILL}</p>
                <button className="details-button" onClick={() => fetchOrderDetails(order.ORDER_ID)}>
                  Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div>No orders found</div>
        )}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="order-modal">
        <div className="modal-content">
          <h2>Order ID: {selectedOrder.ORDER_ID}</h2>
          <p>Date: {orderDetails.length > 0 && new Date(orderDetails[0].DATE_T).toLocaleDateString()}</p>
      
          <table className="order-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map(item => (
                <tr key={item.PRODUCT_ID}>
                  <td>{item.TITLE}</td>
                  <td>{item.QUANTITY}</td>
                  <td>Tk {item.PRICE}</td>
                </tr>
              ))}
            </tbody>
          </table>
      
          <p>Shipping: Tk 50</p>
          <p>Total Bill: Tk {selectedOrder.BILL}</p>
      
          <button className="close-button" onClick={closeModal}>Close</button>
        </div>
      </div>
      
      )}
    </div>
  );
};

export default OrderHistory;
