import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import settingReducer from "../features/settingSlice";
import stationReducer from "../features/stationSlice";
import customerReducer from "../features/customerSlice";
import stockReducer from "../features/stockSlice";
import supplierReducer from "../features/supplierSlice";
import saleReducer from "../features/saleSlice";
import accountReducer from "../features/accountSlice";
import paymentReducer from "../features/paymentSlice";
import appSlice from "../features/appSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        settings: settingReducer,
        station: stationReducer,
        customer: customerReducer,
        stock: stockReducer,
        supplier: supplierReducer,
        sale: saleReducer,
        account: accountReducer,
        payment: paymentReducer,
        app: appSlice
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: {
            // Ignore these action types
            ignoredActions: [
            "station/addPumps",
            "settings/addPumpTypes",
            "settings/addRoles",
            "settings/addPaymentType",
            ],
            // Ignore these field paths in all actions
            ignoredActionPaths: [
            "payload.date",
            "0.created_at",
            "payload.0.created_at",
            ],
            // Ignore these paths in the state
            ignoredPaths: [
            "payload.updated_at",
            "payload.created_at",
            "settings.roles.0.created_at",
            "settings.paymentTypes.0.created_at",
            ],
        },
    }),
});
