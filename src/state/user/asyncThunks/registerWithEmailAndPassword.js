import { createAsyncThunk } from "@reduxjs/toolkit";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Timestamp, setDoc, doc } from "firebase/firestore";

import { auth, db } from "../../../firebase";
import { ROLES } from "../../../constants";

const registerWithEmailAndPassword = createAsyncThunk(
  "auth/register",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const newUserData = {
        ...response.user.providerData[0],
        uid: response.user.uid,
        createdAt: Timestamp.now(),
        role: ROLES.USER,
      };

      setDoc(doc(db, "users", response.user.uid), newUserData);
    } catch (error) {
      console.log("register error", error);
      return rejectWithValue(error);
    }
  }
);

export const reducers = {
  [registerWithEmailAndPassword.fulfilled]: (state) => {
    state.error = null;
    state.loading = false;
  },
  [registerWithEmailAndPassword.pending]: (state) => {
    state.error = null;
    state.loading = true;
  },
  [registerWithEmailAndPassword.rejected]: (state, action) => {
    state.error = action.payload;
    state.loading = false;
  },
};

export default registerWithEmailAndPassword;
