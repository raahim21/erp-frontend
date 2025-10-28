import React, { createContext, useState, useCallback, useEffect } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { API_BASE_URL } from "../../config";

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: false,
    error: null,
  });

  const isAdmin = state.user?.role === "admin";
  const isManager = state.user?.role === "manager";
  const isStaff = state.user?.role === "staff";

  
  const fetchUser = useCallback(async () => {
  setState(prev => ({ ...prev, loading: true, error: null }));
  try {
    const data = await fetchWithAuth(`${API_BASE_URL}/api/auth/verify`);
    setState(prev => ({ ...prev, user: data, loading: false }));
  } catch (error) {
    console.error("fetchUser error:", error.message);
    setState(prev => ({
      ...prev,
      user: null,
      error: error.message,
      loading: false,
    }));
  }
}, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await fetchWithAuth(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
      });
      setState({ user: null, loading: false, error: null });
    } catch (error) {
      console.error("Logout error:", error.message);
      setState((prev) => ({ ...prev, error: error.message, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAdmin,
        isManager,
        isStaff,
        fetchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
// export default AuthProvider;

