// FILE: src/redux/store.js - UPDATED WITH ACCEPTER
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import donorReducer from "./slices/donorSlice";
import staffReducer from "./slices/staffSlice";
import adminReducer from "./slices/adminSlice";
import receiverReducer from "./slices/receiverSlice";
import accepterReducer from "./slices/accepterSlice"; // ✅ IMPORT ADD KAREIN

// ✅ Centralized Redux Store Configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    donor: donorReducer,
    staff: staffReducer,
    admin: adminReducer,
    receiver: receiverReducer,
    accepter: accepterReducer, // ✅ YEH ADD KAREIN
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['accepter/setAccepter'],
      },
    }),
});

export default store;