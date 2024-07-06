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
import { PiGasCanLight } from "react-icons/pi";
import {
  addSupplierDetails,
  addSupplierPurchases,
  addSupplierTransactions,
  selectSupplierDetails,
  selectSupplierPurchases,
  selectSupplierTransactions,
} from "../../features/supplierSlice";
import { GiMoneyStack } from "react-icons/gi";
import SupplierBalance from "./balances/supplierBalances";
import { MdOutlineAttachMoney } from "react-icons/md";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import SupplierExpenses from "./expenses/supplierExpenses";
import Description from "../common/Description";
import SupplierStatement from "./SupplierStatement";

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

const formatter = new Intl.NumberFormat("en-US");

const Supplier = () => {
  const [value, setValue] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  const dispatch = useDispatch();
  const { supplierID } = useParams();

  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };

  useEffect(() => {
    const getSupplierDetails = async () => {
      setPageLoading(true);
      const docRef = doc(db, "supplierBucket", supplierID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addSupplierDetails(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        dispatch(addSupplierDetails({}));
      }
    };

    const getSupplierPurchases = async () => {
      let purchasesArray = [];

      const querySnapshot = await getDocs(
        collection(db, "suppliers", supplierID, "purchases")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        purchasesArray.push(data);
      });

      if (purchasesArray.length > 0) {
        dispatch(addSupplierPurchases(purchasesArray));
      } else {
        dispatch(addSupplierPurchases([]));
      }
    };

    const getSupplierPayments = async () => {
      let paymentsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "suppliers", supplierID, "payments")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        paymentsArray.push(data);
      });

      if (paymentsArray.length > 0) {
        dispatch(addSupplierTransactions(paymentsArray));
        setPageLoading(false);
      } else {
        dispatch(addSupplierTransactions([]));
        setPageLoading(false);
      }
    };

    getSupplierDetails();
    getSupplierPayments();
    getSupplierPurchases();
  }, [dispatch, supplierID]);

  const supplier = useSelector(selectSupplierDetails);
  const purchases = useSelector(selectSupplierPurchases);
  const payments = useSelector(selectSupplierTransactions);

  const purchaseAmount = purchases.reduce(
    (sum, purchase) => sum + purchase.totalPrice,
    0
  );
  const paymentAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const purchaseLitres = purchases.reduce(
    (sum, purchase) => sum + purchase.totalLitres,
    0
  );
  const agoLitres = purchases.reduce(
    (sum, purchase) => sum + parseInt(purchase.agoLitres || 0),
    0
  );
  const pmsLitres = purchases.reduce(
    (sum, purchase) => sum + parseInt(purchase.pmsLitres || 0),
    0
  );
  const agoTotalPrice = purchases.reduce(
    (sum, purchase) => sum + purchase.agoTotalPrice,
    0
  );
  const pmsTotalPrice = purchases.reduce(
    (sum, purchase) => sum + purchase.pmsTotalPrice,
    0
  );

  // const balance = paymentAmount - purchaseAmount;
  // const totalDebt = purchaseAmount - paymentAmount;

  const renderBalance = () => {
    if (supplier?.debt > 0) {
      return (
        <>
          <p className="text-xs">Debt</p>
          <p className="text-sm">TZS {formatter.format(supplier?.debt)}</p>
        </>
      );
    } else {
      return (
        <>
          {" "}
          <p className="text-xs">Balance</p>
          <p className="text-sm">TZS {formatter.format(supplier?.balance)}</p>
        </>
      );
    }
  };

  const renderSuppplierDetails = () => {
    return (
      <div className="px-4 py-2 w-full">
        <div className="w-[100%] flex flex-row gap-2 py-2">
          <div className="w-[25%] flex flex-row gap-2">
            <div className="h-10 w-10 rounded-full bg-purple-500 flex justify-center items-center">
              <p className="text-white text-xl font-bold">
                <PiGasCanLight />{" "}
              </p>
            </div>
            <div>
              <p className="text-xs">Total Purchased Litres</p>
              <p className="text-sm">
                {formatter.format(purchaseLitres)} Litres
              </p>
            </div>
          </div>
          <div className="w-[25%] flex flex-row gap-2">
            <div className="h-10 w-10 rounded-full bg-orange-500 flex justify-center items-center">
              <p className="text-white text-xl font-bold">
                <MdOutlineAttachMoney />{" "}
              </p>
            </div>
            <div>
              <p className="text-xs">Total Purchases Amount</p>
              <p className="text-sm">TZS {formatter.format(purchaseAmount)}</p>
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
          <Card sx={{ width: 760, height: 300, bgcolor: "#E5E9ED" }}>
            <div className="px-4 py-3 h-full">
              <h4 className="py-2">
                Supplier Name :{" "}
                <span className="text-primaryColor font-light">
                  {supplier?.name}
                </span>
              </h4>

              <div className="flex flex-row w-[100%] py-1">
                <h4 className="w-[50%]">
                  Supplier Contact:{" "}
                  <span className="text-primaryColor font-light">
                    {supplier?.phone}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Opening Balance:{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(supplier?.openingBalance)}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-1">
                <h4 className="w-[50%]">
                  Total AGO Litres :{" "}
                  <span className="text-primaryColor font-light">
                    {formatter.format(agoLitres)} Ltrs
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Total AGO Amount :{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(agoTotalPrice)}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Total PMS Litres :{" "}
                  <span className="text-primaryColor font-light">
                    {formatter.format(pmsLitres)} Ltrs
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Total PMS Amount :{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(pmsTotalPrice)}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[100%]">
                  Total Purchases Amount :{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(purchaseAmount)}
                  </span>
                </h4>
              </div>

              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Total Paid Amount :{" "}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(paymentAmount)}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Balance Amount :{" "}
                  {/* <span className="text-primaryColor font-light">
                    {balance < 0 ? (
                      <>TZS 0</>
                    ) : (
                      <>TZS {formatter.format(balance)}</>
                    )}
                  </span> */}
                  <span className="text-primaryColor font-light">
                    TZS {formatter.format(supplier?.balance)}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Total Debt Amount :{" "}
                  <span className="text-primaryColor font-light">
                    {/* {balance < 0 ? (
                      <>
                        TZS{" "}
                        {formatter.format(totalDebt)}
                      </>
                    ) : (
                      <>TZS 0</>
                    )} */}
                    TZS {formatter.format(supplier?.debt)}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Description :{" "}
                  <Description
                    data={supplier}
                    title={"Supplier Descriptions"}
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
        <h4 className="text-center font-light text-xl">{supplier?.name}</h4>
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
            <Tab label="Details" {...a11yProps(0)} />
            <Tab label="Purchases" {...a11yProps(1)} />
            <Tab label="Transactions" {...a11yProps(2)} />
            <Tab label="Financial Statement" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          {renderSuppplierDetails()}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <SupplierExpenses />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <SupplierBalance />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <SupplierStatement supplierID={supplierID}/>
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

export default Supplier;
