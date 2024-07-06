import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    appAnalysis: {},
    totalStations: 0,
    totalSales: 0,
    totalCashSales: 0,
    totalDebtSales: 0,
    totalExpensesAmount: 0,
    availableStock: 0,
    totalPurchases: 0,
    fuelAnalytics: [],
    stationSalesAnalytics: [],
    stationsSalesPercentage: [],
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {

        addUsers(state, action) {
            state.appAnalysis = action.payload;
        },

        addAppAnalysis(state, action) {
            state.totalStations = action.payload.totalStations
            state.totalSales = action.payload.totalSales
            state.totalCashSales = action.payload.totalCashSales
            state.totalDebtSales = action.payload.totalDebtSales
            state.totalExpensesAmount = action.payload.totalExpensesAmount
            state.availableStock = action.payload.availableStock
            state.totalPurchases = action.payload.totalPurchases
            state.fuelAnalytics = action.payload.fuelAnalytics
            state.stationSalesAnalytics = action.payload.stationSalesAnalytics
            state.stationsSalesPercentage = action.payload.stationsSalesPercentage
        },
    },
});

export const { addAppAnalysis, addUsers} = appSlice.actions;


export const selectTotalStations = (state) => state.app.totalStations;
export const selectTotalSales = (state) => state.app.totalSales;
export const selectTotalCashSales = (state) => state.app.totalCashSales;
export const selectTotalDebtSales = (state) => state.app.totalDebtSales;
export const selectTotalExpensesAmount = (state) => state.app.totalExpensesAmount;
export const selectAvailableStock = (state) => state.app.availableStock;
export const selectTotalPurchases = (state) => state.app.totalPurchases;
export const selectFuelAnalytics = (state) => state.app.fuelAnalytics;
export const selectStationSalesAnalytics = (state) => state.app.stationSalesAnalytics;
export const selectStationsSalesPercentage = (state) => state.app.stationsSalesPercentage;


export default appSlice.reducer;