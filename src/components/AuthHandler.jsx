import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import FullPageSpinner from "./FullPageSpinner.jsx";

const AuthHandler = () => {
  const {
    user,
    fetchUser,
    loading: authLoading,
  } = useContext(AuthContext) || {};
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const publicPaths = ["/login", "/register"];

  useEffect(() => {
    if (publicPaths.includes(location.pathname)) {
      setLoading(false); // no need to fetch user
      return;
    }

    const verifyAuth = async () => {
      if (user) {
        // Skip if user is already set
        setLoading(false);
        return;
      }
      try {
        await fetchUser();
      } catch (err) {
        console.error("AuthHandler: verify error", err);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [location.pathname, fetchUser, user]); // Added user to dependencies to skip if already authenticated

  if (loading || authLoading) return <FullPageSpinner />;

  if (publicPaths.includes(location.pathname)) return <Outlet />;

  if (!user) {
    console.log("AuthHandler: No user, redirecting to /login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthHandler;
