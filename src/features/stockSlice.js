import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stocks: [],
    filteredStocks: [],

    stockTransfers: [],
    filteredStockTransfers: [],

    stockDetails: "",
    drivers: [],
};

const stockSlice = createSlice({
    name: "stock",
    initialState,
    reducers: {
        addStocks(state, action) {
        state.stocks = action.payload;
        },

        addFilteredStocks(state, action) {
        state.filteredStocks = action.payload;
        },

        addStockTransfers(state, action) {
        state.stockTransfers = action.payload;
        },

        addFilteredStockTransfers(state, action) {
        state.filteredStockTransfers = action.payload;
        },

        addStockDetails(state, action) {
        state.stockDetails = action.payload;
        },

        addDrivers(state, action) {
        state.drivers = action.payload;
        },
    },
});

export const {
    addStocks,
    addFilteredStocks,
    addStockTransfers,
    addFilteredStockTransfers,
    addStockDetails,
    addDrivers,
} = stockSlice.actions;

export const selectStocks = (state) => state.stock.stocks;
export const selectFilteredStocks = (state) => state.stock.filteredStocks;
export const selectStockTransfers = (state) => state.stock.stockTransfers;
export const selectFilteredStockTransfers = (state) =>state.stock.filteredStockTransfers;
export const selectStockDetails = (state) => state.stock.stockDetails;
export const selectDrivers = (state) => state.stock.drivers;

export default stockSlice.reducer;
