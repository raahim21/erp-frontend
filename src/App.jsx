import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DarkModeContext } from "./context/DarkmodeContext.jsx"; // Import DarkModeContext
import { useAuth } from "./context/AuthContext.jsx";
import ScheduleForm from "./components/ScheduleForm.jsx";
import Logs from "./components/Logs.jsx";
import LeftNavbar from "./components/LeftNavBar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import IssueOrderView from "./components/IssueOrderView.jsx";
import ProductView from "./components/ProductView.jsx";
import ProductList from "./components/ProductList.jsx";
import ProductForm from "./components/ProductForm.jsx";
import PurchaseList from "./components/PurchaseList.jsx";
import PurchaseView from "./components/PurchaseView.jsx";
import PurchaseForm from "./components/PurchaseForm.jsx";
import IssueOrderList from "./components/IssueOrderList.jsx";
import IssueOrderForm from "./components/IssueOrderForm.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import AuthHandler from "./components/AuthHandler.jsx";
import UserForm from "./components/UserForm.jsx";
import UserList from "./components/UserList.jsx";
import UserView from "./components/UserView.jsx";
import { ToastContainer } from "react-toastify";
import ScheduleList from "./components/ScheduleList.jsx";
import ScheduleDetailsPage from "./components/ScheduleDetailsPage.jsx";
import ModuleSelection from "./components/ModuleSelection.jsx"; // Add this import
import "react-toastify/dist/ReactToastify.css"; // Import default toast styles
import VendorForm from "./components/VendorForm.jsx";
import VendorList from "./components/VendorList.jsx";
import CustomerForm from "./components/CustomerForm.jsx";
import CustomerList from "./components/CustomerList.jsx";
import LeaveRequestForm from "./components/LeaveRequestForm.jsx";
import LeaveRequestList from "./components/LeaveRequestList.jsx";

const App = () => {
  const { darkMode } = useContext(DarkModeContext); // Access darkMode
  const { user, isAdmin, isManager, isStaff } = useAuth() || {
    user: null,
    isAdmin: false,
  };

  // Toggle dark class on root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-800"
      }`}
    >
      <div className="flex flex-1">
        <LeftNavbar />
        <div
          className={`flex-1 p-4 md:ml-64 transition-all duration-300 ${
            darkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <Routes>
            <Route path="/" element={<AuthHandler />}>
              <Route index element={<Navigate to="/modules" replace />} />

              {/* Module selection */}
              <Route path="/modules" element={<ModuleSelection />} />

              {/* IMS Module Routes */}
              <Route path="/ims">
                <Route index element={<Navigate to="/ims/products" replace />} />
                <Route path="products" element={<ProductList />} />
                <Route path="products/:id" element={<ProductView />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
                <Route path="purchases" element={<PurchaseList />} />
                <Route path="purchases/:id" element={<PurchaseView />} />
                <Route path="purchases/new" element={<PurchaseForm />} />
                <Route path="purchases/edit/:id" element={<PurchaseForm />} />
                <Route path="vendors/new" element={<VendorForm />} />
                <Route path="vendors" element={ <VendorList /> } />
                <Route path="vendors/:id" element={<VendorForm />} />
                <Route path="vendors/edit/:id" element={<VendorForm />} />
                <Route path="issue-orders" element={<IssueOrderList />} />
                <Route path="issue-orders/new" element={<IssueOrderForm />} />
                <Route path="issue-orders/edit/:id" element={<IssueOrderForm />} />
                <Route path="issue-orders/:id" element={<IssueOrderView />} />
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/new" element={<CustomerForm />} />
                <Route path="customers/:id" element={<CustomerForm />} />
                <Route path="customers/edit/:id" element={<CustomerForm />} />
              </Route>

              {/* HR Module Routes */}
              <Route path="/hr">
                <Route index element={<Navigate to="/hr/schedules" replace />} />
                <Route path="schedules" element={<ScheduleList />} />
                
                {/* Specific routes must come before parameterized routes */}
                <Route
                  path="schedules/new"
                  element={
                    (user && isAdmin) || isManager ? (
                      <ScheduleForm />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
                <Route path="schedules/edit/:id" element={<ScheduleForm />} />
                
                {/* Parameterized route is last */}
                <Route path="schedules/:id" element={<ScheduleDetailsPage />} />
                
                {/* <Route path="view-shifts" element={<ShiftForm />} /> Assuming ShiftForm handles view-shifts; adjust if separate component */}
                
                {/* Leave Management Routes */}
                <Route path="leave-request/new" element={user ? <LeaveRequestForm /> : <Navigate to="/login" replace />}/>
                <Route path="leave-requests" element={(isAdmin || isManager) ? <LeaveRequestList /> : <Navigate to="/modules" />} />
              </Route>

              {/* Common Protected Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user/new" element={<UserForm />} />
              <Route path="/user/edit/:id" element={<UserForm />} />
              <Route path="/user/:id" element={<UserView />} />
              <Route path="/users" element={<UserList />} />
              <Route
                path="/logs"
                element={
                  isAdmin || isManager ? <Logs /> : <Navigate to="/modules" />
                }
              />

              {/* Public routes */}
              <Route
                path="/login"
                element={user ? <Navigate to="/modules" replace /> : <Login />}
              />
              <Route
                path="/register"
                element={
                  user && isAdmin ? (
                    <Register />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Route>
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={darkMode ? "dark" : "colored"} // Switch toast theme based on darkMode
          />
        </div>
      </div>
      
    </div>
  );
};

export default App;