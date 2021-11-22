import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import GlobalLoading from "./GlobalLoading";
import { ROLES } from "../utils/constants";

const RequireRoleAdmin = ({ children }) => {
  const isUserInitialized = useSelector((state) => state.user.initialized);
  const user = useSelector((state) => state.user.value);

  if (!isUserInitialized) return <GlobalLoading />;

  if (user?.role !== ROLES.ADMIN) {
    return <Navigate replace to="/" />;
  }

  return children;
};

export default RequireRoleAdmin;
