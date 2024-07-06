import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    userDetails: "",
    userInfo: "",
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {

        addUsers(state, action) {
        state.users = action.payload;
        },

        addUserDetails(state, action) {
        state.userDetails = action.payload;
        },

        addUserInfo(state, action) {
        state.userInfo = action.payload;
        },
    },
});

export const { addUsers, addUserDetails, addUserInfo} = userSlice.actions;


export const selectUsers = (state) => state.user.users;
export const selectUserDetails = (state) => state.user.userDetails;
export const selectUserInfo = (state) => state.user.userInfo;

export default userSlice.reducer;