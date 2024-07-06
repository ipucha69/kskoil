import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    customers: [],
    filteredCustomers: [],

    privateCustomers: [],
    filteredPrivateCustomers: [],

    badDebtors: [],
    filteredBadDebtors: [],

    customerDetails: "",

    customerPayments: [],
    filteredCustomerPayments: [],

    customerExpenses: [],
    filteredCustomerExpenses: [],

    customerPrices: [],
    customerSettings: [],
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
        addCustomers(state, action) {
        state.customers = action.payload;
        },

        addFilteredCustomers(state, action) {
        state.filteredCustomers = action.payload;
        },

        addPrivateCustomers(state, action) {
        state.privateCustomers = action.payload;
        },

        addFilteredPrivateCustomers(state, action) {
        state.filteredPrivateCustomers = action.payload;
        },

        addBadDebtors(state, action) {
        state.badDebtors = action.payload;
        },

        addFilteredBadDebtors(state, action) {
        state.filteredBadDebtors = action.payload;
        },

        addCustomerDetails(state, action) {
        state.customerDetails = action.payload;
        },

        addCustomerPayments(state, action) {
        state.customerPayments = action.payload;
        },

        addFilteredCustomerPayments(state, action) {
        state.filteredCustomerPayments = action.payload;
        },

        addCustomerExpenses(state, action) {
        state.customerExpenses = action.payload;
        },

        addFilteredCustomerExpenses(state, action) {
        state.filteredCustomerExpenses = action.payload;
        },

        addCustomerPrices(state, action) {
        state.customerPrices = action.payload;
        },

        addCustomerSettings(state, action) {
        state.customerSettings = action.payload;
        },
    },
});

export const {
    addCustomers,
    addFilteredCustomers,
    addCustomerPayments,
    addFilteredCustomerPayments,
    addCustomerExpenses,
    addFilteredCustomerExpenses,
    addCustomerDetails,
    addCustomerPrices,
    addPrivateCustomers,
    addFilteredPrivateCustomers,
    addBadDebtors,
    addFilteredBadDebtors,
    addCustomerSettings,
} = customerSlice.actions;

export const selectCustomers = (state) => state.customer.customers;
export const selectFilteredCustomers = (state) => state.customer.filteredCustomers;
export const selectCustomerDetails = (state) => state.customer.customerDetails;
export const selectCustomerPayments = (state) => state.customer.customerPayments;
export const selectFilteredCustomerPayments = (state) => state.customer.filteredCustomerPayments;
export const selectCustomerExpenses = (state) => state.customer.customerExpenses;
export const selectCustomerPrices = (state) => state.customer.customerPrices;
export const selectFilteredCustomerExpenses = (state) => state.customer.filteredCustomerExpenses;
export const selectPrivateCustomers = (state) => state.customer.privateCustomers;
export const selectFilteredPrivateCustomers = (state) => state.customer.filteredPrivateCustomers;
export const selectBadDebtors = (state) => state.customer.badDebtors;
export const selectFilteredBadDebtors = (state) => state.customer.filteredBadDebtors;
export const selectCustomerSettings = (state) => state.customer.customerSettings;

export default customerSlice.reducer;
