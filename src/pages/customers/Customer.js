import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Card, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../App";
import {
  addCustomerDetails,
  addCustomerExpenses,
  addCustomerPayments,
  selectCustomerDetails,
  selectCustomerExpenses,
  selectCustomerPayments,
} from "../../features/customerSlice";
import CustomerPayments from "./CustomerPayments";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { PiGasCanLight } from "react-icons/pi";
import { MdOutlineAttachMoney } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import Description from "../common/Description";
import CustomerExpenses from "./CustomerExpenses";
import { formatter } from "../../helpers/Helpers";
import CustomerSetting from "./CustomerSetting";
import CustomerStatement from "./CustomerStatement";
import PrivateStatement from "./PrivateStatement";
import CustomerBalance from "./CustomerBalance";
import CustomerInvoice from "./CustomerInvoice";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const primary = "#0A365C";

const Customer = () => {
  const [value, setValue] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  const dispatch = useDispatch();
  const { customerID } = useParams();

  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };

  useEffect(() => {
    const getCustomerDetails = async () => {
      setPageLoading(true);
      const docRef = doc(db, "customerBucket", customerID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addCustomerDetails(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        dispatch(addCustomerDetails({}));
      }
    };

    const getCustomerExpenses = async () => {
      let expensesArray = [];

      const querySnapshot = await getDocs(
        collection(db, "customers", customerID, "expenses")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        expensesArray.push(data);
      });

      if (expensesArray.length > 0) {
        dispatch(addCustomerExpenses(expensesArray));
      } else {
        dispatch(addCustomerExpenses([]));
      }
    };

    const getCustomerPayments = async () => {
      let paymentsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "customers", customerID, "payments")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        paymentsArray.push(data);
      });

      if (paymentsArray.length > 0) {
        dispatch(addCustomerPayments(paymentsArray));
        setPageLoading(false);
      } else {
        dispatch(addCustomerPayments([]));
        setPageLoading(false);
      }
    };

    getCustomerDetails();
    getCustomerExpenses();
    getCustomerPayments();
  }, [dispatch, customerID]);

  const customer = useSelector(selectCustomerDetails);
  const expenses = useSelector(selectCustomerExpenses);
  const payments = useSelector(selectCustomerPayments);

  const expensesAmount = expenses.reduce(
    (sum, expense) => sum + expense.totalAmount,
    0
  );
  const paymentAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const litres = expenses.reduce(
    (sum, expense) => sum + parseInt(expense?.quantity),
    0
  );

  const agoQuantity = expenses.reduce((sum, debt) => {
    if (debt.fuel === "AGO") {
      return sum + parseInt(debt.quantity);
    } else {
      return sum;
    }
  }, 0);

  const pmsQuantity = expenses.reduce((sum, debt) => {
    if (debt.fuel === "PMS") {
      return sum + parseInt(debt.quantity);
    } else {
      return sum;
    }
  }, 0);

  const agoAmount = expenses.reduce((sum, debt) => {
    if (debt.fuel === "AGO") {
      return sum + debt.totalAmount;
    } else {
      return sum;
    }
  }, 0);

  const pmsAmount = expenses.reduce((sum, debt) => {
    if (debt.fuel === "PMS") {
      return sum + debt.totalAmount;
    } else {
      return sum;
    }
  }, 0);

  const renderStatus = () => {
    if (customer?.status && !customer?.private) {
      return "NORMAL";
    } else if (customer?.status && customer?.private) {
      return "PRIVATE";
    } else if (!customer?.status) {
      return "BAD DEBTOR";
    } else {
      return "";
    }
  };

  const renderBalance = () => {
    if (customer?.debt > 0) {
      return (
        <>
          <p className="text-xs">Debt</p>
          <p className="text-sm">TZS {formatter.format(customer?.debt)}</p>
        </>
      );
    } else {
      return (
        <>
          {" "}
          <p className="text-xs">Balance</p>
          <p className="text-sm">TZS {formatter.format(customer?.balance)}</p>
        </>
      );
    }
  };

  const renderCustomerDetails = () => {
    return (
      <div className="px-4 py-2">
        <div className="w-[100%] flex flex-row gap-2 py-2">
          <div className="w-[25%] flex flex-row gap-2">
            <div className="h-10 w-10 rounded-full bg-purple-500 flex justify-center items-center">
              <p className="text-white text-xl font-bold">
                <PiGasCanLight />{" "}
              </p>
            </div>
            <div>
              <p className="text-xs">Total Purchased Litres</p>
              <p className="text-sm">{formatter.format(litres)} Litres</p>
            </div>
          </div>
          <div className="w-[25%] flex flex-row gap-2">
            <div className="h-10 w-10 rounded-full bg-orange-500 flex justify-center items-center">
              <p className="text-white text-xl font-bold">
                <MdOutlineAttachMoney />{" "}
              </p>
            </div>
            <div>
              <p className="text-xs">Total Expenses Amount</p>
              <p className="text-sm">TZS {formatter.format(expensesAmount)}</p>
            </div>
          </div>
          <div className="w-[25%] flex flex-row gap-2">
            <div className="h-10 w-10 rounded-full bg-green-500 flex justify-center items-center">
              <p className="text-white text-xl font-bold">
                <FaRegMoneyBillAlt />{" "}
              </p>
            </div>
            <div>
              <p className="text-xs">Total Paid Amount</p>
              <p className="text-sm">TZS {formatter.format(paymentAmount)}</p>
            </div>
          </div>
          <div className="w-[25%] flex flex-row gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex justify-center items-center">
              <p className="text-white text-xl font-bold">
                <GiMoneyStack />{" "}
              </p>
            </div>
            <div>{renderBalance()}</div>
          </div>
        </div>
        <div className="py-4 mt-2 flex flex-row justify-center">
          <Card sx={{ width: 760, height: 330, bgcolor: "#E5E9ED" }}>
            <div className="px-4 py-3 h-full">
              <h4 className="py-2">
                Customer Name :{" "}
                <span className="text-primaryColor font-light">
                  {customer?.name}
                </span>
              </h4>
              <div className="flex flex-row w-[100%] py-1">
                <h4 className="w-[50%]">
                  Customer Contact :{" "}
                  <span className="text-primaryColor font-light">
                    {customer?.phone}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Status :{" "}
                  <span className="text-primaryColor font-light">
                    {renderStatus()}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-1">
                <h4 className="w-[50%]">
                  Total AGO Litres :{" "}
                  <span className="text-primaryColor font-light">
                    {formatter.format(agoQuantity)}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Total AGO Amount :{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(agoAmount)}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Total PMS Litres :{" "}
                  <span className="text-primaryColor font-light">
                    {formatter.format(pmsQuantity)}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Total PMS Amount :{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(pmsAmount)}
                  </span>
                </h4>
              </div>
              <h4 className="py-2">
                Total Expenses Amount :{" "}
                <span className="text-primaryColor font-light">
                  TZS {formatter.format(expensesAmount)}
                </span>
              </h4>

              <h4 className="py-2">
                Total Paid Amount :{" "}
                <span className="text-primaryColor font-light">
                  TZS {formatter.format(paymentAmount)}
                </span>
              </h4>

              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Total Debt Amount :{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(customer?.debt || 0)}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Balance Amount :{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(customer?.balance || 0)}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Payment Deadline :{" "}
                  <span className="text-primaryColor font-light"></span>
                </h4>
                <h4 className="w-[50%]">
                  Descriptions :{" "}
                  <Description
                    data={customer}
                    title={"Customer Descriptions"}
                  />
                </h4>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderUserTabs = () => {

    return (
      <div>
        <h4 className="text-center font-light text-xl">{customer?.name}</h4>
        <Box
          sx={{
            width: "100%",
            borderBottom: 1,
            borderColor: "divider",
          }}
          className="flex flex-row justify-between"
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            textColor={`${primary}`}
            indicatorColor="primary"
            sx={{ color: "#0A365C" }}
          >
            <Tab label="DETAILS" {...a11yProps(0)} />
            <Tab label="EXPENSES" {...a11yProps(1)} />
            <Tab label="PAYMENTS" {...a11yProps(2)} />
            <Tab label="BALANCE TRANSACTIONS" {...a11yProps(3)} />
            <Tab label="FINANCIAL STATEMENT" {...a11yProps(4)} />
            <Tab label="INVOICES" {...a11yProps(5)} />
            <Tab label="SETTINGS" {...a11yProps(6)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          {renderCustomerDetails()}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <CustomerExpenses />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <CustomerPayments />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <CustomerBalance/>
        </TabPanel>
        <TabPanel value={value} index={4}>
          {customer?.private ? <PrivateStatement /> : <CustomerStatement customerID={customerID} />}
        </TabPanel>
        <TabPanel value={value} index={5}>
          <CustomerInvoice customerID={customerID}/>
        </TabPanel>
        <TabPanel value={value} index={6}>
          <CustomerSetting />
        </TabPanel>
      </div>
    );
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container sx={{ px: 2 }}>
      <Grid item sm={12}>
        <div className="relative">
          {pageLoading ? (
            <div className="py-4 w-full flex justify-center items-center overflow-hidden">
              <div className="absolute bg-white bg-opacity-70 z-10 h-[300vh] w-full flex items-center justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4"></div>
              </div>
            </div>
          ) : null}
        </div>
        {renderUserTabs()}
      </Grid>
    </Grid>
  );
};

export default Customer;
