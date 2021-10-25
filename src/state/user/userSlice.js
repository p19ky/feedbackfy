import { createSlice } from "@reduxjs/toolkit";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

// async thunks and their reducers
import loginWithEmailAndPassword, {
  reducers as loginWithEmailAndPasswordReducers,
} from "./asyncThunks/loginWithEmailAndPassword.js";
import registerWithEmailAndPassword, {
  reducers as registerWithEmailAndPasswordReducers,
} from "./asyncThunks/registerWithEmailAndPassword";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    value: null,
    error: null,
    loading: false,
    initialized: false,
  },
  reducers: {
    logout: (state) => {
      state.value = null;
      signOut(auth);
    },
    updateUser: (state, action) => {
      state.value = action.payload;
      if (!state.initialized) {
        state.initialized = true;
      }
    },
    resetUser: (state) => {
      state.value = null;
    },
    resetUserError: (state) => {
      state.error = null;
    },
    resetUserLoading: (state) => {
      state.loading = false;
    },
  },
  extraReducers: {
    ...loginWithEmailAndPasswordReducers,
    ...registerWithEmailAndPasswordReducers,
  },
});

// export state reducers
export const {
  logout,
  updateUser,
  resetUser,
  resetUserError,
  resetUserLoading,
} = userSlice.actions;

// export async thunks
export { loginWithEmailAndPassword, registerWithEmailAndPassword };

export default userSlice.reducer;
