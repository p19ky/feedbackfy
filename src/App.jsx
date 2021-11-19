import React from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
import RequireNotAuth from "./components/RequireNotAuth";
import RequireRoleAdmin from "./components/RequireRoleAdmin";
import RequireRoleManager from "./components/RequireRoleManager";
import GlobalLoading from "./components/GlobalLoading";
import LayoutWithNavbar from "./components/LayoutWithNavbar";

const Home = React.lazy(() => import("./views/Home"));
const Login = React.lazy(() => import("./views/Login"));
const Register = React.lazy(() => import("./views/Register"));
const ForgotPassword = React.lazy(() => import("./views/ForgotPassword"));
const Admin = React.lazy(() => import("./views/Admin"));
const Manager = React.lazy(() => import("./views/Manager"));
const Profile = React.lazy(() => import("./views/Profile"));
const PageNotFound = React.lazy(() => import("./views/PageNotFound"));

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <React.Suspense fallback={<GlobalLoading />}>
              <LayoutWithNavbar>
                <Home />
              </LayoutWithNavbar>
            </React.Suspense>
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRoleAdmin>
              <React.Suspense fallback={<GlobalLoading />}>
                <LayoutWithNavbar>
                  <Admin />
                </LayoutWithNavbar>
              </React.Suspense>
            </RequireRoleAdmin>
          </RequireAuth>
        }
      />

      <Route
        path="/manager"
        element={
          <RequireAuth>
            <RequireRoleManager>
              <React.Suspense fallback={<GlobalLoading />}>
                <LayoutWithNavbar>
                  <Manager />
                </LayoutWithNavbar>
              </React.Suspense>
            </RequireRoleManager>
          </RequireAuth>
        }
      />

      <Route
        path="/profile"
        element={
          <RequireAuth>
            <React.Suspense fallback={<GlobalLoading />}>
              <LayoutWithNavbar>
                <Profile />
              </LayoutWithNavbar>
            </React.Suspense>
          </RequireAuth>
        }
      />

      <Route
        path="/login"
        element={
          <RequireNotAuth>
            <React.Suspense fallback={<GlobalLoading />}>
              <Login />
            </React.Suspense>
          </RequireNotAuth>
        }
      />

      <Route
        path="/register"
        element={
          <RequireNotAuth>
            <React.Suspense fallback={<GlobalLoading />}>
              <Register />
            </React.Suspense>
          </RequireNotAuth>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <RequireNotAuth>
            <React.Suspense fallback={<GlobalLoading />}>
              <ForgotPassword />
            </React.Suspense>
          </RequireNotAuth>
        }
      />

      <Route
        path="*"
        element={
          <React.Suspense fallback={<GlobalLoading />}>
            <PageNotFound />
          </React.Suspense>
        }
      />
    </Routes>
  );
};

export default App;
