import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    daySales: [],
    dayExpenses: [],
    dayDebtors: [],
    dayDebtorsSales: [],
    dayPumps: [],
    dayBook: "",
    daySale: "",
    creditCustomers: [],
};

const saleSlice = createSlice({
    name: "sale",
    initialState,
    reducers: {
        addDayBook(state, action) {
        state.dayBook = action.payload;
        },

        addDaySales(state, action) {
        state.daySales = action.payload;
        },
        addDayPumps(state, action) {
        state.dayPumps = action.payload;
        },

        addDayExpenses(state, action) {
        state.dayExpenses = action.payload;
        },

        addDayDebtors(state, action) {
        state.dayDebtors = action.payload;
        },

        addDayDebtorsSales(state, action) {
        state.dayDebtorsSales = action.payload;
        },

        addDaySale(state, action) {
        state.daySale = action.payload;
        },

        addCreditCustomers(state, action) {
        state.creditCustomers = action.payload;
        },
    },
});

export const {
    addDayBook,
    addDaySales,
    addDayExpenses,
    addDayDebtors,
    addDayDebtorsSales,
    addDaySale,
    addDayPumps,
    addCreditCustomers,
} = saleSlice.actions;

export const selectDayBook = (state) => state.sale.dayBook;
export const selectDaySales = (state) => state.sale.daySales;
export const selectDayPumps = (state) => state.sale.dayPumps;
export const selectDayDebtors = (state) => state.sale.dayDebtors;
export const selectDayExpenses = (state) => state.sale.dayExpenses;
export const selectDayDebtorsSales = (state) => state.sale.dayDebtorsSales;
export const selectDaySale = (state) => state.sale.daySale;
export const selectCreditCustomers = (state) => state.sale.creditCustomers;

export default saleSlice.reducer;
