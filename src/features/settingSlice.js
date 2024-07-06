import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    paymentTypes: [],
    pumpTypes: [],
    expenseTypes: [],
    roles: [],
};

const settingSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {

        addPaymentTypes(state, action) {
        state.paymentTypes = action.payload;
        },

        addPumpTypes(state, action) {
        state.pumpTypes = action.payload;
        },

        addExpenseTypes(state, action) {
        state.expenseTypes = action.payload;
        },

        addRoles(state, action) {
        state.roles = action.payload;
        },
    },
});

export const { addPaymentTypes, addPumpTypes, addExpenseTypes, addRoles} = settingSlice.actions;


export const selectPaymentTypes = (state) => state.settings.paymentTypes;
export const selectPumpTypes = (state) => state.settings.pumpTypes;
export const selectExpenseTypes = (state) => state.settings.expenseTypes;
export const selectRoles = (state) => state.settings.roles;

export default settingSlice.reducer;
