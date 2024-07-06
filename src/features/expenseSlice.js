import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    expenses: {},
};

const expenseSlice = createSlice({
    name: "expense",
    initialState,
    reducers: {

        addExpenses(state, action) {
        state.expenses = action.payload;
        },

    },
});

export const {addExpenses} = expenseSlice.actions;

export const selectExpenses = (state) => state.expense.expense;

export default expenseSlice.reducer;
