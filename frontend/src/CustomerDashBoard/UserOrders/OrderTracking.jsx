import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Stepper, Step, StepLabel } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import styles from './OrderTracking.module.css';
import axiosInstance from '../../Service/AxiosInstant';
import CustomerNav from '../../CustomerComponents/Authentication/CustomerNav';
import { Collapse } from '@mui/material';

const orderStages = [
    'Order placed',
    'Order confirmed',
    'Order processing',
    'Shipped/Dispatched',
    'In transit',
    'Out for delivery',
    'Delivered',
];

const icons = {
    1: <ShoppingCartIcon />,
    2: <PaymentIcon />,
    3: <LocalShippingIcon />,
    4: <LocalShippingIcon />,
    5: <LocalShippingIcon />,
    6: <CheckCircleIcon />,
};

const OrderTracking = () => {
    const [currentStage, setCurrentStage] = useState(0);
    const location = useLocation();
    const order = location.state;
    const [openDescription, setOpenDescription] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axiosInstance.get(`/user/api/getstatus/${order.id}`);
                const status = response.data;
                const stageIndex = orderStages.indexOf(status);
                setCurrentStage(stageIndex >= 0 ? stageIndex : 0);
            } catch (e) {
                console.log(e);
            }
        };
        fetchStatus();
    }, [order]);

    return (
        <>
        <CustomerNav />
            <div className={styles.orderTrackingContainer}>
                <div className={styles.header}>
                    <h2><strong>Tracking Order</strong> <br></br>{order.orderId}</h2>
                </div>

                <Stepper activeStep={currentStage} alternativeLabel>
                    {orderStages.map((label, index) => (
                        <Step key={index}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <div className={styles.customIconContainer}>
                                        <div className={`${styles.iconCircle} ${index <= currentStage ? styles.active : styles.inactive}`}>
                                            {icons[index + 1]}
                                        </div>
                                    </div>
                                )}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </div>

            <div className={styles.details}>
                <div className={styles.orderInfo}>
                    <h1>Order Details</h1>
                    <p>Ordered Date: <strong>{order.orderDate}</strong></p>
                    <p>Expected delivery: <strong>{order.orderDate + 7}</strong></p>
                    <p>Payment Type: <strong>{order.paymentType}</strong></p>
                    <p>Status: <strong>{order.status}</strong></p>
                    <p>Address: <strong>{`${order.orderAddress.address}, ${order.orderAddress.city}, ${order.orderAddress.pincode}`}</strong></p>
                </div>

                <div className={styles.productDetails}>
                    <h1>Product Details</h1>
                    <p>Name: <strong>{order.product.title}</strong></p>
                    <p>Category: <strong>{order.product.category}</strong></p>
                    <p>Category: <strong>{order.product.category}</strong></p>
                    <p>
                        Description: <strong>{order.product.description.length > 100 ? `${order.product.description.slice(0, 50)}...` : order.product.description}</strong>
                        {order.product.description.length > 100 && (
                            <span onClick={() => setOpenDescription(!openDescription)} className={styles.readMore}> Read More</span>
                        )}
                    </p>
                    <Collapse in={openDescription}>
                        <p>{order.product.description}</p>
                    </Collapse>
                    <p>Price: <strong>{order.price}</strong></p>
                </div>
            </div>
        </>
    );
};

export default OrderTracking;


// import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import PaymentIcon from '@mui/icons-material/Payment';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import styles from './OrderTracking.module.css';
// import axiosInstance from '../../Service/AxiosInstant';
// import CustomerNav from '../../CustomerComponents/Authentication/CustomerNav';
// import { Collapse } from '@mui/material';

// const orderStages = [
//     'Order placed',
//     'Order confirmed',
//     'Order processing',
//     'Shipped/Dispatched',
//     'In transit',
//     'Out for delivery',
//     'Delivered',
// ];

// const icons = {
//     1: <ShoppingCartIcon />,
//     2: <PaymentIcon />,
//     3: <LocalShippingIcon />,
//     4: <LocalShippingIcon />,
//     5: <LocalShippingIcon />,
//     6: <CheckCircleIcon />,
// };

// const OrderTracking = () => {
//     const [currentStage, setCurrentStage] = useState(0);
//     const [open, setOpen] = useState(false);
//     const [order, setOrder] = useState({});
//     const [openDescription, setOpenDescription] = useState(false);
//     const location = useLocation();

//     useEffect(() => {
//         const fetchStatus = async () => {
//             try {
//                 const response = await axiosInstance.get(`/user/api/getstatus/${location.state.id}`);
//                 const status = response.data;
//                 const stageIndex = orderStages.indexOf(status);
//                 setCurrentStage(stageIndex >= 0 ? stageIndex : 0);
//                 console.log(location.state);
//                 setOrder(location.state); // Set order data
//             } catch (e) {
//                 console.log(e);
//             }
//         };
//         fetchStatus();
//     }, [location.state]);

//     const handleOpen = () => setOpen(true);
//     const handleClose = () => setOpen(false);

//     return (
//         <>
//             <CustomerNav />
//             <div className={styles.orderTrackingContainer}>
//                 <div className={styles.header}>
//                     <h2><strong>Tracking Order</strong><br />{order.orderId}</h2>
//                 </div>

//                 <Stepper activeStep={currentStage} alternativeLabel>
//                     {orderStages.map((label, index) => (
//                         <Step key={index}>
//                             <StepLabel
//                                 StepIconComponent={() => (
//                                     <div className={styles.customIconContainer}>
//                                         <div className={`${styles.iconCircle} ${index <= currentStage ? styles.active : styles.inactive}`}>
//                                             {icons[index + 1]}
//                                         </div>
//                                     </div>
//                                 )}
//                             >
//                                 {label}
//                             </StepLabel>
//                         </Step>
//                     ))}
//                 </Stepper>
//             </div>

//             <div className={styles.details}>
//                 <div className={styles.orderInfo}>
//                     <h1>Order Details</h1>
//                     <p>Ordered Date: <strong>{order.orderDate}</strong></p>
//                     <p>Expected delivery: <strong>{new Date(order.orderDate).setDate(new Date(order.orderDate).getDate() + 7)}</strong></p>
//                     <p>Payment Type: <strong>{order.paymentType}</strong></p>
//                     <p>Status: <strong>{order.status}</strong></p>
//                     <p>Address: <strong>{`${order.orderAddress.address}, ${order.orderAddress.city}, ${order.orderAddress.pincode}`}</strong></p>
//                 </div>

//                 <div className={styles.productDetails}>
//                     <h1>Product Details</h1>
//                     <p>Name: <strong>{order.product.title}</strong></p>
//                     <p>Category: <strong>{order.product.category}</strong></p>
//                     <p>
//                         Description: <strong>{order.product.description.length > 100 ? `${order.product.description.slice(0, 100)}...` : order.product.description}</strong>
//                         {order.product.description.length > 100 && (
//                             <span onClick={() => setOpenDescription(!openDescription)} className={styles.readMore}> Read More</span>
//                         )}
//                     </p>
//                     <Collapse in={openDescription}>
//                         <p>{order.product.description}</p>
//                     </Collapse>
//                     <p>Price: <strong>{order.price}</strong></p>
//                 </div>
//             </div>

//             <Dialog open={open} onClose={handleClose}>
//                 <DialogTitle>Product Description</DialogTitle>
//                 <DialogContent>
//                     <p>{order.product.description}</p>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose} color="primary">Close</Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// };

// export default OrderTracking;

