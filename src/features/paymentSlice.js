import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    customersPayments: [],
    filteredCustomersPayments: [],

    suppliersPayments: [],
    filteredSuppliersPayments: [],
};

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        addStationCustomersPayments(state, action) {
        state.customersPayments = action.payload;
        },

        addFilteredStationCustomersPayments(state, action) {
        state.filteredCustomersPayments = action.payload;
        },

        addStationSupplierPayments(state, action) {
        state.suppliersPayments = action.payload;
        },

        addFilteredStationSupplierPayments(state, action) {
        state.filteredSuppliersPayments = action.payload;
        },
    },
});

export const {
    addStationCustomersPayments,
    addFilteredStationCustomersPayments,
    addStationSupplierPayments,
    addFilteredStationSupplierPayments,
} = paymentSlice.actions;

export const selectStationCustomersPayments = (state) => state.payment.customerPayments;
export const selectFilteredStationCustomersPayments = (state) => state.payment.filteredCustomerPayments;
export const selectStationSuppliersPayments = (state) => state.payment.suppliersPayments;
export const selectFilteredStationSuppliersPayments = (state) => state.payment.filteredSuppliersPayments;

export default paymentSlice.reducer;
