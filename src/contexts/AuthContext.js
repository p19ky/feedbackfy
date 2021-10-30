import React from "react";
import { onAuthStateChanged } from "@firebase/auth";
import { useSelector, useDispatch } from "react-redux";

import { db, auth } from "../firebase";
import { updateUser } from "../state/user/userSlice";
import { doc, onSnapshot } from "@firebase/firestore";

const AuthContext = React.createContext();

const useAuth = () => React.useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const user = useSelector((state) => state.user.value);
  const isUserInitialized = useSelector((state) => state.user.initialized);
  const dispatch = useDispatch();

  const isAuthenticated = Boolean(user);

  React.useEffect(() => {
    let unsubscribeUsersCollection = () => {};
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribeUsersCollection = onSnapshot(
          doc(db, "users", user.uid),
          (doc) => {
            if (!doc.exists) return;

            let data = doc.data();

            dispatch(updateUser(data));
          }
        );
      } else {
        dispatch(updateUser(null));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeUsersCollection();
    };
  }, [dispatch]);

  const value = {
    isAuthenticated,
    isUserInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, useAuth };
