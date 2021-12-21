import React from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
import RequireNotAuth from "./components/RequireNotAuth";
import RequireRoleAdmin from "./components/RequireRoleAdmin";
import GlobalLoading from "./components/GlobalLoading";
import LayoutWithNavbar from "./components/LayoutWithNavbar";
import RequireRoleNotAdmin from "./components/RequireRoleNotAdmin";

const Home = React.lazy(() => import("./views/Home"));
const Login = React.lazy(() => import("./views/Login"));
const Register = React.lazy(() => import("./views/Register"));
const ForgotPassword = React.lazy(() => import("./views/ForgotPassword"));
const Admin = React.lazy(() => import("./views/Admin"));
const Profile = React.lazy(() => import("./views/Profile"));
const Pegs = React.lazy(() => import("./views/Pegs"));
const Feedbacks = React.lazy(() => import("./views/Feedbacks"));
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
        path="/pegs"
        element={
          <RequireAuth>
            <RequireRoleNotAdmin>
              <React.Suspense fallback={<GlobalLoading />}>
                <LayoutWithNavbar>
                  <Pegs />
                </LayoutWithNavbar>
              </React.Suspense>
            </RequireRoleNotAdmin>
          </RequireAuth>
        }
      />

      <Route
        path="/feedbacks"
        element={
          <RequireAuth>
            <RequireRoleNotAdmin>
              <React.Suspense fallback={<GlobalLoading />}>
                <LayoutWithNavbar>
                  <Feedbacks />
                </LayoutWithNavbar>
              </React.Suspense>
            </RequireRoleNotAdmin>
          </RequireAuth>
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
