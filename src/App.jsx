import React from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
import RequireNotAuth from "./components/RequireNotAuth";
import RequireRoleAdmin from "./components/RequireRoleAdmin";
import GlobalLoading from "./components/GlobalLoading";
import PageNotFound from "./views/PageNotFound";
import Navbar from "./components/Navbar";

const Home = React.lazy(() => import("./views/Home"));
const Login = React.lazy(() => import("./views/Login"));
const Register = React.lazy(() => import("./views/Register"));
const ForgotPassword = React.lazy(() => import("./views/ForgotPassword"));
const Admin = React.lazy(() => import("./views/Admin"));
const Profile = React.lazy(() => import("./views/Profile"));

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route
          path="/"
          element={
            <RequireAuth>
              <React.Suspense fallback={<GlobalLoading />}>
                <Home />
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
                  <Admin />
                </React.Suspense>
              </RequireRoleAdmin>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <React.Suspense fallback={<GlobalLoading />}>
                <Profile />
              </React.Suspense>
            </RequireAuth>
          }
        />
      </Route>
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

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default App;
