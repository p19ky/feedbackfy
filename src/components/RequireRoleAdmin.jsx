import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import GlobalLoading from "./GlobalLoading";
import { ROLES } from "../constants";

const RequireAuth = ({ children }) => {
  const isUserInitialized = useSelector((state) => state.user.initialized);
  const user = useSelector((state) => state.user.value);

  if (!isUserInitialized) return <GlobalLoading />;

  if (user.role !== ROLES.ADMIN) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RequireAuth;
