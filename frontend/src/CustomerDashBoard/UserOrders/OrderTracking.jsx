import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Stepper, Step, StepLabel } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import styles from './OrderTracking.module.css';
import { getOrderByIdService } from '../../Service/UserService';
import CustomerNav from '../../CustomerComponents/Authentication/CustomerNav';
import { Collapse } from '@mui/material';

// Fulfilment stages, in the order of the backend OrderStatus enum
const orderStages = [
    { status: 'PLACED', label: 'Order placed' },
    { status: 'CONFIRMED', label: 'Order confirmed' },
    { status: 'PROCESSING', label: 'Order processing' },
    { status: 'SHIPPED', label: 'Shipped/Dispatched' },
    { status: 'IN_TRANSIT', label: 'In transit' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
    { status: 'DELIVERED', label: 'Delivered' },
];

const icons = {
    1: <ShoppingCartIcon />,
    2: <PaymentIcon />,
    3: <LocalShippingIcon />,
    4: <LocalShippingIcon />,
    5: <LocalShippingIcon />,
    6: <CheckCircleIcon />,
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

const OrderTracking = () => {
    const location = useLocation();
    const [order, setOrder] = useState(location.state);
    const [openDescription, setOpenDescription] = useState(false);

    // Refresh the order (GET /api/orders/{id}) so the status is current
    useEffect(() => {
        if (!location.state?.id) return;
        getOrderByIdService(location.state.id)
            .then(setOrder)
            .catch((e) => console.log(e));
    }, [location.state]);

    if (!order) {
        return <Navigate to="/customerdashboard/customerorders" />;
    }

    const stageIndex = orderStages.findIndex((s) => s.status === order.status);
    const currentStage = stageIndex >= 0 ? stageIndex : 0;
    const expected = order.orderDate ? new Date(new Date(order.orderDate).getTime() + 7 * 24 * 60 * 60 * 1000) : null;
    const description = order.product?.description || '';
    const address = order.shippingAddress || {};

    return (
        <>
        <CustomerNav />
            <div className={styles.orderTrackingContainer}>
                <div className={styles.header}>
                    <h2><strong>Tracking Order</strong> <br></br>{order.orderNumber}</h2>
                </div>

                {order.status === 'CANCELLED' ? (
                    <p style={{ textAlign: 'center' }}><strong>{order.statusLabel}</strong></p>
                ) : (
                <Stepper activeStep={currentStage} alternativeLabel>
                    {orderStages.map((stage, index) => (
                        <Step key={stage.status}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <div className={styles.customIconContainer}>
                                        <div className={`${styles.iconCircle} ${index <= currentStage ? styles.active : styles.inactive}`}>
                                            {icons[index + 1]}
                                        </div>
                                    </div>
                                )}
                            >
                                {stage.label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
                )}
            </div>

            <div className={styles.details}>
                <div className={styles.orderInfo}>
                    <h1>Order Details</h1>
                    <p>Ordered Date: <strong>{formatDate(order.orderDate)}</strong></p>
                    <p>Expected delivery: <strong>{expected ? expected.toLocaleDateString() : '-'}</strong></p>
                    <p>Payment Type: <strong>{order.paymentType}</strong></p>
                    <p>Status: <strong>{order.statusLabel}</strong></p>
                    <p>Address: <strong>{`${address.address || ''}, ${address.city || ''}, ${address.pincode || ''}`}</strong></p>
                </div>

                <div className={styles.productDetails}>
                    <h1>Product Details</h1>
                    <p>Name: <strong>{order.product?.title}</strong></p>
                    <p>Category: <strong>{order.product?.category}</strong></p>
                    <p>
                        Description: <strong>{description.length > 100 ? `${description.slice(0, 50)}...` : description}</strong>
                        {description.length > 100 && (
                            <span onClick={() => setOpenDescription(!openDescription)} className={styles.readMore}> Read More</span>
                        )}
                    </p>
                    <Collapse in={openDescription}>
                        <p>{description}</p>
                    </Collapse>
                    <p>Price: <strong>₹{order.totalPrice}</strong></p>
                </div>
            </div>
        </>
    );
};

export default OrderTracking;
