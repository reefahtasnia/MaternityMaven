import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminPrivateComponent = () => {
    const adminAuth = localStorage.getItem('admin'); // Check for admin key

    return adminAuth ? <Outlet /> : <Navigate to="/login" />; // Redirect to login if not admin
};

export default AdminPrivateComponent;
