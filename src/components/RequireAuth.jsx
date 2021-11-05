import { useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import GlobalLoading from "./GlobalLoading";

const RequireAuth = ({ children }) => {
  const isUserInitialized = useSelector((state) => state.user.initialized);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isUserInitialized) return <GlobalLoading />;

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
