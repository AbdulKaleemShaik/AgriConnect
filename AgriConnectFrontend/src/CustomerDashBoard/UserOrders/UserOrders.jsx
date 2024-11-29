import React, { useState, useEffect } from 'react';
import './userOrder.css';
import axiosInstance from '../../Service/AxiosInstant';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { Modal, Button } from 'react-bootstrap'; 
import { Navigate, useNavigate } from 'react-router-dom';
import CustomerNav from '../../CustomerComponents/Authentication/CustomerNav';
import Navbar from '../components/Navbar/Navbar'

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get('/user/user-orders');
                setOrders(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch orders. Please try again later.');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleShowModal = (order) => {
        navigate('/customerdashboard/tracking-page', { state: order });
        setShowModal(true);
        setSelectedOrder(order);
    };

    const handleCancelOrder = (order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
    };

    const confirmCancelOrder = async () => {
        try {
            setCanceling(true);
            await axiosInstance.delete(`/user/cancel-order/${selectedOrder.id}`);
            setOrders((prevOrders) => prevOrders.filter((o) => o.orderId !== selectedOrder.orderId));
            setShowCancelModal(false);
        } catch (err) {
            setError('Failed to cancel the order. Please try again.');
        } finally {
            setCanceling(false);
        }
    };
    

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setSelectedOrder(null);
    };

    if (loading) {
        return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <>
        <Navbar />
    <CustomerNav/>
        <div className="container my-5">
            <h2 className="text-center mb-4">My Orders</h2>
            {orders.length === 0 ? (
                <p className="text-center">You have no orders yet.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>Order ID</th>
                                <th>Product Image</th>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Order Date</th>
                                <th>Order Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.orderId}</td>
                                    <td>
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/img/product_img/${order.product.image}`}
                                            alt={order.product.title}
                                            className="img-fluid product-image"
                                        />
                                    </td>
                                    <td>{order.product.title}</td>
                                    <td>{order.quantity}</td>
                                    <td>₹{order.price * order.quantity}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>{order.orderAddress.address}, {order.orderAddress.city}</td>
                                    <td>
                                        <button
                                            onClick={() => handleShowModal(order)}
                                            className="view_status_button"
                                        >
                                            Status
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleCancelOrder(order)}
                                            
                                            className="cancle_button"
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Cancel Order Confirmation */}
            <Modal show={showCancelModal} onHide={handleCloseCancelModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Cancel Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to cancel order #{selectedOrder?.orderId}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseCancelModal}>
                        No
                    </Button>
                    <Button variant="danger" onClick={confirmCancelOrder} disabled={canceling}>
                        {canceling ? 'Cancelling...' : 'Yes, Cancel'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
        </>
    );
};

export default UserOrders;
