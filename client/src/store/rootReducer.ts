import { combineReducers, type Reducer } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authSlice from "./slices/authSlice";
const combinedReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authSlice,
});

type RootState = ReturnType<typeof combinedReducer>;

// Typed RootReducer with reset logic
const rootReducer: Reducer<RootState> = (state, action) => {
  if (action.type === "RESET_STORE") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export { rootReducer };
