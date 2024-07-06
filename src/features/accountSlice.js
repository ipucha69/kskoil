import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    expenses: [],
    outstandings: [],
    debtors: [],
    sales: [],
    transactions: [],
    payments: [],
    purchases: [],
    accountDetails: "",
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        addAccountExpenses(state, action) {
        state.expenses = action.payload;
        },

        addAccountDebtors(state, action) {
        state.debtors = action.payload;
        },

        addAccountSales(state, action) {
        state.sales = action.payload;
        },

        addAccountTransactions(state, action) {
        state.transactions = action.payload;
        },

        addAccountOutstanding(state, action) {
        state.outstandings = action.payload;
        },

        addAccountPayments(state, action) {
        state.payments = action.payload;
        },

        addAccountPurchases(state, action) {
        state.purchases = action.payload;
        },
    },
});

export const {
    addAccountExpenses,
    addAccountDebtors,
    addAccountOutstanding,
    addAccountPayments,
    addAccountSales,
    addAccountTransactions,
    addAccountPurchases,
} = accountSlice.actions;

export const selectAccountExpenses = (state) => state.account.expenses;
export const selectAccountDebtors = (state) => state.account.debtors;
export const selectAccountSales = (state) => state.account.sales;
export const selectAccountTransactions = (state) => state.account.transactions;
export const selectAccountOutstandings = (state) => state.account.outstandings;
export const selectAccountPayments = (state) => state.account.payments;
export const selectAccountPurchases = (state) => state.account.purchases;

export default accountSlice.reducer;
