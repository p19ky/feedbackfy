import { createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../../../firebase";

const loginWithEmailAndPassword = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log("login error", error);
      return rejectWithValue(error);
    }
  }
);

export const reducers = {
  [loginWithEmailAndPassword.fulfilled]: (state) => {
    state.error = null;
    state.loading = false;
  },
  [loginWithEmailAndPassword.pending]: (state) => {
    state.error = null;
    state.loading = true;
  },
  [loginWithEmailAndPassword.rejected]: (state, action) => {
    state.error = action.payload;
    state.loading = false;
  },
};

export default loginWithEmailAndPassword;
