import { configureStore } from "@reduxjs/toolkit";

import userReducer from "../state/user/userSlice";

export default configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
