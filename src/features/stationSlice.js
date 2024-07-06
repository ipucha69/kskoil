import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    stations: [],
    stationDetails: "",
    filteredStations: [],

    pumps: [],
    pumpCards: [],
    pumpDetails: "",

    stocks: [],

    prices: [],

    managers: [],
    drivers: [],

    expenses: [],

    distributions: [],
    filteredDistributions: [],

    accounts: [],
    accountDetails: "",
    filteredAccounts: [],
};

const stationSlice = createSlice({
    name: "station",
    initialState,
    reducers: {
        addStations(state, action) {
        state.stations = action.payload;
        },

        addStationDetails(state, action) {
        state.stationDetails = action.payload;
        },

        addFilteredStations(state, action) {
        state.filteredStations = action.payload;
        },

        addPumps(state, action) {
        state.pumps = action.payload;
        },

        addPumpCards(state, action) {
        state.pumpCards = action.payload;
        },

        addPumpDetails(state, action) {
        state.pumpDetails = action.payload;
        },

        addStationPrices(state, action) {
        state.prices = action.payload;
        },

        addStationManagers(state, action) {
        state.managers = action.payload;
        },

        addStationStocks(state, action) {
        state.stocks = action.payload;
        },

        addStationDrivers(state, action) {
        state.drivers = action.payload;
        },

        addStationExpenses(state, action) {
        state.expenses = action.payload;
        },

        addStationDistributions(state, action) {
        state.distributions = action.payload;
        },

        addFiltredDistributions(state, action) {
        state.filteredDistributions = action.payload;
        },

        addStationAccounts(state, action) {
        state.accounts = action.payload;
        },

        addStationAccountDetails(state, action) {
        state.accountDetails = action.payload;
        },

        addFiltredStationAccounts(state, action) {
        state.filteredAccounts = action.payload;
        },
    },
});

export const {
    addStations,
    addStationDetails,
    addFilteredStations,
    addPumps,
    addPumpCards,
    addPumpDetails,
    addStationPrices,
    addStationDrivers,
    addStationManagers,
    addStationStocks,
    addStationExpenses,
    addStationDistributions,
    addFiltredDistributions,
    addStationAccounts,
    addFiltredStationAccounts,
    addStationAccountDetails,
} = stationSlice.actions;

export const selectStations = (state) => state.station.stations;
export const selectStationDetails = (state) => state.station.stationDetails;
export const selectFilteredStations = (state) => state.station.filteredStations;
export const selectPumps = (state) => state.station.pumps;
export const selectPumpCards = (state) => state.station.pumpCards;
export const selectPumpDetails = (state) => state.station.pumpDetails;
export const selectStationPrices = (state) => state.station.prices;
export const selectStationManagers = (state) => state.station.managers;
export const selectStationStocks = (state) => state.station.stocks;
export const selectStationDrivers = (state) => state.station.drivers;
export const selectStationExpenses = (state) => state.station.expenses;
export const selectStationDistributions = (state) => state.station.distributions;
export const selectFiltredDistributions = (state) => state.station.filteredDistributions;
export const selectStationAccounts = (state) => state.station.accounts;
export const selectStationAccountDetails = (state) => state.station.accountDetails;
export const selectFiltredStationAccounts = (state) => state.station.filteredAccounts;

export default stationSlice.reducer;
