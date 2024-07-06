import React from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "../pages/layouts/AppLayout";
import Login from "../pages/auth/Login";
import Home from "../pages/Home";
import Users from "../pages/users/Users";
import Profile from "../pages/users/Profile";
import Station from "../pages/stations/Station";
import Customer from "../pages/customers/Customer";
import Stations from "../pages/stations/Stations";
import Settings from "../pages/settings/Settings";
import Transactions from "../pages/transactions/Transactions";
import Expenses from "../pages/expenses/Expenses";
import Reports from "../pages/reports/Reports";
import Accounts from "../pages/accounts/Accounts";
import Pump from "../pages/stations/pumps/Pump";
import Suppliers from "../pages/suppliers/Suppliers";
import Supplier from "../pages/suppliers/Supplier";
import StockManager from "../pages/stock/StockManager";
import StationAccount from "../pages/stations/accounts/StationAccount";
import CustomerManager from "../pages/customers/CustomerManager";
import ManagerStation from "../pages/manager/ManagerStation";
import ManagerSettings from "../pages/manager/ManagerSettings";
import ManagerReports from "../pages/manager/ManagerReports";

const LoginElement = () => <Login />;

const DashboardElement = () => (
  <AppLayout>
    <Home />
  </AppLayout>
);

const UsersElement = () => (
  <AppLayout>
    <Users />
  </AppLayout>
);

const SettingElement = () => (
  <AppLayout>
    <Settings />
  </AppLayout>
);

const StationsElement = () => (
  <AppLayout>
    <Stations />
  </AppLayout>
);

const StationElement = () => (
  <AppLayout>
    <Station />
  </AppLayout>
);

const CustomersElement = () => (
  <AppLayout>
    <CustomerManager />
  </AppLayout>
);

const CustomerElement = () => (
  <AppLayout>
    <Customer />
  </AppLayout>
);

const ProfileElement = () => (
  <AppLayout>
    <Profile />
  </AppLayout>
);

const ExpensesElement = () => (
  <AppLayout>
    <Expenses />
  </AppLayout>
);

const TransactionsElement = () => (
  <AppLayout>
    <Transactions />
  </AppLayout>
);

const ReportsElement = () => (
  <AppLayout>
    <Reports />
  </AppLayout>
);

const AccountsElement = () => (
  <AppLayout>
    <Accounts />
  </AppLayout>
);

const PumpElement = () => (
  <AppLayout>
    <Pump />
  </AppLayout>
);

const StocksElement = () => (
  <AppLayout>
    <StockManager />
  </AppLayout>
);

const SuppliersElement = () => (
  <AppLayout>
    <Suppliers />
  </AppLayout>
);

const SupplierElement = () => (
  <AppLayout>
    <Supplier />
  </AppLayout>
);

const StationAccountElement = () => (
  <AppLayout>
    <StationAccount />
  </AppLayout>
);

const ManagerStationElement = () => (
  <AppLayout>
    <ManagerStation />
  </AppLayout>
);

const ManagerReportsElement = () => (
  <AppLayout>
    <ManagerReports />
  </AppLayout>
);

const StationSettingsElement = () => (
  <AppLayout>
    <ManagerSettings />
  </AppLayout>
);

// const LoadingElement = () => (
//   <AppLayout>
//     <LoadingPage />
//   </AppLayout>
// );

const App = () => {
  return (
    <React.Fragment>
      <Routes>
        <Route>
          <Route path="/login" element={<LoginElement />} />
        </Route>

        <Route>
          <Route path="/" element={<DashboardElement />} />
          <Route path="/users" element={<UsersElement />} />
          <Route path="/settings" element={<SettingElement />} />
          <Route path="/stations" element={<StationsElement />} />
          <Route path="/customers" element={<CustomersElement />} />
          <Route path="/transactions" element={<TransactionsElement />} />
          <Route path="/expenses" element={<ExpensesElement />} />
          <Route path="/profile" element={<ProfileElement />} />
          <Route path="/reports" element={<ReportsElement />} />
          <Route path="/accounts" element={<AccountsElement />} />
          <Route path="/stocks" element={<StocksElement />} />
          <Route path="/suppliers" element={<SuppliersElement />} />
          <Route
            path="/station-settings"
            element={<StationSettingsElement />}
          />
          <Route path="/station-reports" element={<ManagerReportsElement />} />
          <Route path="/station" element={<ManagerStationElement />} />

          <Route path="/customers/:customerID" element={<CustomerElement />} />
          <Route path="/stations/:stationID" element={<StationElement />} />
          <Route
            path="/stations/:stationID/pumps/:pumpID"
            element={<PumpElement />}
          />
          <Route
            path="/stations/:stationID/accounts/:dayBookID"
            element={<StationAccountElement />}
          />

          <Route
            path="/station/:stationID/pumps/:pumpID"
            element={<PumpElement />}
          />
          <Route
            path="/station/:stationID/accounts/:dayBookID"
            element={<StationAccountElement />}
          />

          <Route path="/suppliers/:supplierID" element={<SupplierElement />} />
        </Route>
      </Routes>
    </React.Fragment>
  );
};

export default App;
