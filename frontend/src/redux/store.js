import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import reducer from "../redux/reducer";

const store = configureStore({
  reducer,
  devTools: true,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default store;
