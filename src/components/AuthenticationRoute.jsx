import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";

import GlobalLoading from "./GlobalLoading";
import { useAuth } from "../contexts/AuthContext";

const AuthenticationRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const isUserInitialized = useSelector((state) => state.user.initialized);

  if (!isUserInitialized) return <GlobalLoading />;

  return (
    <Route
      {...rest}
      component={(props) =>
        !isAuthenticated ? (
          <Component {...rest} {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/",
            }}
          />
        )
      }
    />
  );
};

export default AuthenticationRoute;
