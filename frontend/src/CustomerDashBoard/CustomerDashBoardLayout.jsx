import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import "./components/Navbar/Navbar";


const CustomerDashboardLayout = () => {

    return (
        <>
        <div>
            <main>
                <Outlet /> {/* Renders the child routes */}
            </main>
        </div>
        </>
    );
};

export default CustomerDashboardLayout;
