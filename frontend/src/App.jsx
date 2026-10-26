import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './HomePage/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';

import CustomerLogin from './CustomerComponents/Authentication/CustomerLogin';
import CustomerRegister from './CustomerComponents/Authentication/CustomerRegister'
import FarmerLogin from './FarmerComponents/FarmerLoginPage/FarmerLogin'
import FarmerRegestration from './FarmerComponents/Regestration/FarmerRegistration'
import CustomerDashboard from './CustomerDashBoard/CustomerDashBoard'
import Cart from "./CustomerDashBoard/pages/Cart/Cart";
import PlaceOrder from "./CustomerDashBoard/pages/PlaceOrder/PlaceOrder";
import Dashboard from './FarmerComponents/DashBoard/DashBoard'
import ProductsPage from './FarmerComponents/MyProductPage/MyProductPage'
import AddProduct from './FarmerComponents/AddProduct/AddProduct'
import Transcations from './FarmerComponents/TranscationPage/Transcations'
import FarmerProfile from './FarmerComponents/ProfilePage/ProfilePage'
import AskEmailPage from './ForgetPassWord/AskEmailPage';
import ResetPassword from './ForgetPassword/ResetPasswordPage';
import AdminProductPage from './FarmerComponents/AddedProducts/AdminProductPage'
import EditProduct from './FarmerComponents/AddedProducts/EditProductPage';
import ProductDetails from './CustomerDashBoard/components/ProductDetails/ProductDetails';
import { UserProvider } from './Context/UserContext';
import CustomerDashboardLayout from './CustomerDashBoard/CustomerDashBoardLayout';
import PaymentOptions from './CustomerDashBoard/pages/paymentOptions/PaymentOptions';
import ProtectedRoute from './ProtectedRoute';
import CustomerOrdersPage from './CustomerDashBoard/UserOrders/UserOrders'
import FarmerOrders from './FarmerComponents/OrdersPage/FarmerOrdersPage'
import OrderTracking from './CustomerDashBoard/UserOrders/OrderTracking';
import CustomerProfilePage from './CustomerDashBoard/pages/ProfilePage/CustomerProfilePage'

import MSP from './FarmerComponents/DashBoard/MSP'

function App() {
  return (
    <UserProvider>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<CustomerDashboard />} />
        <Route path='/forgetPassword' element={<AskEmailPage />} />
        <Route path='/HomeLogin' element={<Home/>}/>
        <Route path='/customerlogin' element={<CustomerLogin />} />
        <Route path='/customerregestration' element={<CustomerRegister />} />
        <Route path='/farmerlogin' element={<FarmerLogin />} />
        <Route path='/farmerorders' element={<FarmerOrders />}></Route>
        <Route path='/farmerregistration' element={<FarmerRegestration />} />
        <Route path='/minimum-support-prize' element={<MSP />}></Route>
        <Route path='/resetPassword/:email' element={<ResetPassword />} />
        <Route path='customerdashboard/product/:id' element={<ProductDetails />} />

        {/* Protected Routes */}
        <Route path='/customerdashboard' element={<ProtectedRoute allowedRoles={['ROLE_USER']} />}>
          <Route element={<CustomerDashboardLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path='cart' element={<Cart />} />
            <Route path='customerorders' element={<CustomerOrdersPage />}></Route>
           

            <Route path="order" element={<PlaceOrder />} />
            <Route path='customer-profilepage' element={<CustomerProfilePage />}></Route>
            <Route path="tracking-page" element={<OrderTracking />}></Route>
            <Route path='paymentoptions' element={<PaymentOptions />} />
          </Route>
        </Route>




        {/* Admin-Only Routes */}
        <Route path="/productspage" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="" element={<ProductsPage />} />
        </Route>

        <Route path="/farmerdashboard" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="" element={<Dashboard />} />
        </Route>

        <Route path="/addproduct" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="" element={<AddProduct />} />
        </Route>

        <Route path="/transcationspage" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="" element={<Transcations />} />
        </Route>

        <Route path="/farmerprofile" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="" element={<FarmerProfile />} />
        </Route>

        <Route path="/myproducts" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="" element={<AdminProductPage />} />
        </Route>

        <Route path="/editProduct/:id" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="" element={<EditProduct />} />
        </Route>
      </Routes>
      <ToastContainer /> 
    </UserProvider>
  );
}

export default App;
