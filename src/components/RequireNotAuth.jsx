import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import GlobalLoading from "./GlobalLoading";

const RequireNotAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const isUserInitialized = useSelector((state) => state.user.initialized);

  if (!isUserInitialized) return <GlobalLoading />;

  if (isAuthenticated) {
    // Redirect them to the / page if they're already authenticated.
    return <Navigate replace to="/" />;
  }

  return children;
};

export default RequireNotAuth;
