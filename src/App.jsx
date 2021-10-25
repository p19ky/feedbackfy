import React from "react";
import { Route, Switch } from "react-router-dom";

import Login from "./views/Login";
import Register from "./views/Register";
import Home from "./views/Home";

const App = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/register">
        <Register />
      </Route>
    </Switch>
  );
};

export default App;
