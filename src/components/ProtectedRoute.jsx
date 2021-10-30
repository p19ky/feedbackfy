import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import GlobalLoading from "./GlobalLoading";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const isUserInitialized = useSelector((state) => state.user.initialized);

  if (!isUserInitialized) return <GlobalLoading />;

  return (
    <Route
      {...rest}
      component={(props) =>
        isAuthenticated ? (
          <Component {...rest} {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: rest.path },
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute;
