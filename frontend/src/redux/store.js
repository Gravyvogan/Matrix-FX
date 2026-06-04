import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import marketReducer from './marketSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    market: marketReducer,
  },
});

export default store;
