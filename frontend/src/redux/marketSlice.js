import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  prices: {},
  signals: {},
  loading: false,
  error: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setPrices: (state, action) => {
      state.prices = { ...state.prices, ...action.payload };
    },
    setSignals: (state, action) => {
      state.signals = { ...state.signals, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setPrices, setSignals, setLoading, setError } = marketSlice.actions;
export default marketSlice.reducer;
