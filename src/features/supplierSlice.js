import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    suppliers: [],
    filteredSuppliers: [],

    supplierDetails: "",

    supplierTransactions: [],
    filteredTransactions: [],

    supplierPurchases: [],
    filteredPurchases: [],

    supplierStatement: "",

};

const supplierSlice = createSlice({
    name: "supplier",
    initialState,
    reducers: {
        addSuppliers(state, action) {
        state.suppliers = action.payload;
        },

        addFilteredSuppliers(state, action) {
        state.filteredSuppliers = action.payload;
        },

        addSupplierDetails(state, action) {
        state.supplierDetails = action.payload;
        },

        addSupplierTransactions(state, action) {
        state.supplierTransactions = action.payload;
        },

        addSupplierFilteredTransactions(state, action) {
        state.filteredTransactions = action.payload;
        },

        addSupplierPurchases(state, action) {
        state.supplierPurchases = action.payload;
        },

        addSupplierFilteredPurchases(state, action) {
        state.filteredPurchases = action.payload;
        },

        addSupplierStatement(state, action) {
        state.supplierStatement = action.payload;
        }
    },
});

export const {
    addSuppliers,
    addFilteredSuppliers,
    addSupplierDetails,
    addSupplierTransactions,
    addSupplierFilteredTransactions,
    addSupplierPurchases,
    addSupplierFilteredPurchases,
    addSupplierStatement,
} = supplierSlice.actions;

export const selectSuppliers = (state) => state.supplier.suppliers;
export const selectFilteredSuppliers = (state) => state.supplier.filteredSuppliers;
export const selectSupplierDetails = (state) => state.supplier.supplierDetails;
export const selectSupplierTransactions = (state) => state.supplier.supplierTransactions;
export const selectSupplierFilteredTransactions = (state) => state.supplier.filteredTransactions;
export const selectSupplierPurchases = (state) => state.supplier.supplierPurchases;
export const selectSupplierFilteredPurchases = (state) => state.supplier.filteredPurchases;
export const selectSupplierStatement = (state) => state.supplier.supplierStatement;

export default supplierSlice.reducer;
