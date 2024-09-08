/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const { initializeApp } = require("firebase-admin/app");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({ maxInstances: 10 });

const helloWorld = require("./src/helloWorld");
const createUser = require("./src/createUser");
const updateUser = require("./src/updateUser");
const updatePassword = require("./src/updatePassword");

const createManager = require("./src/createManager");
const updateManager = require("./src/updateManager");
const createStock = require("./src/stocks/createStock");
const updateStock = require("./src/stocks/updateStock");

const updateStockTransfer = require("./src/stocks/updateSTockTransfer");
const stockTransfer = require("./src/stocks/stockTransfer");
const stockDistribution = require("./src/stocks/stockDistribution");

//================SUPPLIERS ========================

const createSupplier = require("./src/supplier/createSupplier");
const updateSupplier = require("./src/supplier/updateSupplier");
const createSupplierPayment = require("./src/supplier/createSupplierPayment");
const updateSupplierPayment = require("./src/supplier/updateSupplierPayment");
const supplierFinancialStatements = require("./src/supplier/SupplierFinancialStatements");
const dailySupplierFinancialStatements = require("./src/supplier/dailySupplierFinancialStatements");
const monthlySupplierFinancialStatements = require("./src/supplier/monthlySupplierFinancialStatements");
const annualSupplierFinancialStatements = require("./src/supplier/annualSupplierFinancialStatements");


//================ CUSTOMERS ========================

const createCustomer = require("./src/customer/createCustomer");
const updateCustomer = require("./src/customer/updateCustomer");
const createCustomerPayment = require("./src/customer/CreateCustomerPayment");
const updateCustomerPayment = require("./src/customer/EditCustomerPayment");
const customerDebtSettings = require("./src/customer/CustomertDebtSetting");
const customerFinancialStatements = require("./src/customer/CustomerFinancialStatement");
const dailyCustomerFinancialStatement = require("./src/customer/dailyCustomerFinancialStatement");
const monthlyCustomerFinancialStatement = require("./src/customer/monthlyCustomerFinancialStatement");
const annualCustomerFinancialStatement = require("./src/customer/annualCustomerFinancialStatement");
const customerInvoice = require("./src/customer/CustomerInvoice");
const dailyCustomerInvoice = require("./src/customer/dailyCustomerInvoice");
const monthlyCustomerInvoice = require("./src/customer/monthlyCustomerInvoice");
const annualCustomerInvoice = require("./src/customer/annualCustomerInvoice");

//================ STATION ========================

const createPump = require("./src/station/CreatePump");
const deletePump = require("./src/station/DeletePump");
const createPumpCard = require("./src/station/CreatePumpCard");

//================ SALES ========================

const initializeDayBook = require("./src/sales/InitializeDayBook");
const fetchDayBook = require("./src/sales/FetchDayBook");
const createNewBook = require("./src/sales/CreateNewBook");
const createSale = require("./src/sales/CreateSale");
const createPriceTwoSale = require("./src/sales/CreatePriceTwoSale");
const createDebtor = require("./src/sales/CreateDebtor");
const createExpense = require("./src/sales/CreateExpense");
const createDebtorCash = require("./src/sales/CreateDebtorCash");
const updateDebtor = require("./src/sales/UpdateDebtor");
const updateExpense = require("./src/sales/UpdateExpense");
const closeDayBook = require("./src/sales/CloseDayBook");
const fetchSalesBook = require("./src/sales/FetchSalesBook");
const fetchSalesAccount = require("./src/sales/FetchSalesAccount");
const createExcessStock = require("./src/sales/CreateExcessStock");
const createAdditionalStock = require("./src/sales/CreateAdditionalStock");


//================= APP ==========================
const fetchAnalytics = require("./src/app/FetchAnalyticsData");
const monthlySalesAnalytics = require("./src/app/MonthlySalesAnalytics");
const dailySalesAnalytics = require("./src/app/DailySalesAnalytics");

//================= STATION APP ==========================
const fetchStationAnalytics = require("./src/app/StationAnalyticsData");

exports.helloworld = helloWorld.helloWorld;
exports.createUser = createUser.createUser;
exports.updateUser = updateUser.updateUser;
exports.updatePassword = updatePassword.updatePassword;

exports.createManager = createManager.createManager;
exports.updateManager = updateManager.updateManager;

exports.createStock = createStock.createStock;
exports.updateStock = updateStock.updateStock;

exports.updateStockTransfer = updateStockTransfer.updateStockTransfer;
exports.stockTransfer = stockTransfer.stockTransfer;
exports.stockDistribution = stockDistribution.stockDistribution;

exports.createSupplier = createSupplier.createSupplier;
exports.updateSupplier = updateSupplier.updateSupplier;
exports.createSupplierPayment = createSupplierPayment.createSupplierPayment;
exports.updateSupplierPayment = updateSupplierPayment.updateSupplierPayment;
exports.supplierFinancialStatements = supplierFinancialStatements.supplierFinancialStatements;
exports.dailySupplierFinancialStatements = dailySupplierFinancialStatements.dailySupplierFinancialStatements;
exports.monthlySupplierFinancialStatements = monthlySupplierFinancialStatements.monthlySupplierFinancialStatements;
exports.annualSupplierFinancialStatements = annualSupplierFinancialStatements.annualSupplierFinancialStatements


exports.createCustomer = createCustomer.createCustomer;
exports.updateCustomer = updateCustomer.updateCustomer;
exports.createCustomerPayment = createCustomerPayment.createCustomerPayment;
exports.updateCustomerPayment = updateCustomerPayment.updateCustomerPayment;
exports.customerDebtSettings = customerDebtSettings.customerDebtSettings;
exports.customerFinancialStatements = customerFinancialStatements.customerFinancialStatements;
exports.dailyCustomerFinancialStatement = dailyCustomerFinancialStatement.dailyCustomerFinancialStatement;
exports.monthlyCustomerFinancialStatement = monthlyCustomerFinancialStatement.monthlyCustomerFinancialStatement;
exports.annualCustomerFinancialStatement = annualCustomerFinancialStatement.annualCustomerFinancialStatement;
exports.customerInvoice = customerInvoice.customerInvoice;
exports.dailyCustomerInvoice = dailyCustomerInvoice.dailyCustomerInvoice;
exports.monthlyCustomerInvoice = monthlyCustomerInvoice.monthlyCustomerInvoice;
exports.annualCustomerInvoice = annualCustomerInvoice.annualCustomerInvoice;

exports.createPump = createPump.createPump;
exports.deletePump = deletePump.deletePump;
exports.createPumpCard = createPumpCard.createPumpCard;


exports.initializeDayBook = initializeDayBook.initializeDayBook;
exports.fetchDayBook = fetchDayBook.fetchDayBook;
exports.createNewBook = createNewBook.createNewBook;
exports.createSale = createSale.createSale;
exports.createPriceTwoSale = createPriceTwoSale.createPriceTwoSale;
exports.createDebtor = createDebtor.createDebtor;
exports.createExpense = createExpense.createExpense;
exports.createDebtorCashSale = createDebtorCash.createDebtorCash;
exports.updateDebtor = updateDebtor.updateDebtor;
exports.updateExpense = updateExpense.updateExpense;
exports.closeDayBook = closeDayBook.closeDayBook;
exports.fetchSalesBook = fetchSalesBook.fetchSalesBook;
exports.fetchSalesAccount = fetchSalesAccount.fetchSalesAccount;
exports.createExcessStock = createExcessStock.createExcessStock;
exports.createAdditionalStock = createAdditionalStock.createAdditionalStock;


exports.fetchAnalytics = fetchAnalytics.fetchAnalytics;
exports.monthlySalesAnalytics = monthlySalesAnalytics.monthlySalesAnalytics;
exports.dailySalesAnalytics = dailySalesAnalytics.dailySalesAnalytics;

exports.fetchStationAnalytics = fetchStationAnalytics.stationAnalyticsData;
