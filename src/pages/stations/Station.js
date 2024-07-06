import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Card, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../App";
import {
  addStationDetails,
  selectStationDetails,
} from "../../features/stationSlice";
import Pumps from "./pumps/Pumps"; 
import StationStock from "./stock/StationStock";
import StationExpenses from "./expenses/StationExpenses"; 
import StationAccounts from "./accounts/StationAccounts"; 
import NewBook from "./sales/NewBook"; 
import Description from "../common/Description";
import Employees from "./Employees";
import EditStation from "./EditStation"; 
import StationCustomersPayments from "./payments/StationCustomersPayments";
import StationSuppliersPayments from "./payments/StationSuppliersPayments";

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

const Station = () => {
  const [value, setValue] = useState(0);

  const dispatch = useDispatch();
  const { stationID } = useParams();

  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };

  useEffect(() => {
    const getStationDetails = async () => {
      const docRef = doc(db, "stationBucket", stationID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addStationDetails(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        dispatch(addStationDetails({}));
      }
    };

    getStationDetails();
  }, [dispatch, stationID]);

  const station = useSelector(selectStationDetails);

  const renderStationDetails = () => {
    return (
      <div className="py-2">
        <div className="py-4 mt-2 flex flex-row justify-center">
          <Card sx={{ width: 760, height: 200, bgcolor: "#E5E9ED" }}>
            <div className="px-4 py-3 h-full relative">
              <div className="absolute right-1">
                <EditStation station={station} />
              </div>
              <h4 className="py-2">
                Station Name :{" "}
                <span className="text-primaryColor font-light">
                  {station?.name}
                </span>
              </h4>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Station Location :{" "}
                  <span className="text-primaryColor font-light">
                    {station?.location}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Region :{" "}
                  <span className="text-primaryColor font-light">
                    {station?.region}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  EWURA :{" "}
                  <span className="text-primaryColor font-light">
                    {station?.ewura}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  TIN Number :{" "}
                  <span className="text-primaryColor font-light">
                    {station?.tin}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Manager :{" "}
                  <span className="text-primaryColor font-light">
                    {station?.manager}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Description :{" "}
                  <Description data={station} title={"Station Descriptions"} />
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
        <h4 className="text-center font-light text-xl py-2">{station?.name}</h4>
        <Box
          sx={{
            width: "100%",
            borderBottom: 1,
            borderColor: "divider",
          }}
          className="w-screen flex flex-row justify-between"
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            textColor={`${primary}`}
            indicatorColor="primary"
            sx={{ textColor: "#0A365C" }}
          >
            <Tab label="Details" {...a11yProps(0)} />
            <Tab label="Pumps" {...a11yProps(1)} />
            <Tab label="Sales" {...a11yProps(2)} />
            <Tab label="Expenses" {...a11yProps(3)} />
            <Tab label="Accounts" {...a11yProps(4)} />
            <Tab label="Stocks" {...a11yProps(5)} />
            <Tab label="Customers Pays" {...a11yProps(6)} />
            <Tab label="Suppliers Pays" {...a11yProps(7)} />
            <Tab label="Settings" {...a11yProps(8)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <div>{renderStationDetails()}</div>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Pumps />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <NewBook />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <StationExpenses />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <StationAccounts />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <StationStock />
        </TabPanel>
        <TabPanel value={value} index={6}>
          <StationCustomersPayments />
        </TabPanel>
        <TabPanel value={value} index={7}>
          <StationSuppliersPayments />
        </TabPanel>
        <TabPanel value={value} index={8}>
          <Employees />
        </TabPanel>
      </div>
    );
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container>
      <Grid item sm={12}>
        {renderUserTabs()}
      </Grid>
    </Grid>
  );
};

export default Station;
