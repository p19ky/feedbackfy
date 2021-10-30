import React from "react";
import { Switch } from "react-router-dom";

import Login from "./views/Login";
import Register from "./views/Register";
import Home from "./views/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./views/ForgotPassword";
import AuthenticationRoute from "./components/AuthenticationRoute";

const App = () => {
  return (
    <Switch>
      <ProtectedRoute component={Home} exact path="/" />
      <AuthenticationRoute exact path="/login" component={Login} />
      <AuthenticationRoute exact path="/register" component={Register} />
      <AuthenticationRoute
        exact
        path="/forgot-password"
        component={ForgotPassword}
      />
    </Switch>
  );
};

export default App;
