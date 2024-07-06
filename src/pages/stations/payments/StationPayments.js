import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../App";
import {
  addStationDetails,
  selectStationDetails,
} from "../../../features/stationSlice";
import StationCustomersPayments from "./StationCustomersPayments";
import StationSuppliersPayments from "./StationSuppliersPayments";

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

const StationPayment = () => {
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

  const renderUserTabs = () => {
    return (
      <div>
        <Box
          sx={{
            width: "100%",
            borderBottom: 1,
            borderColor: "divider",
          }}
          className="w-screen  "
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
            <Tab label="Customers Payments" {...a11yProps(0)} />
            <Tab label="Suppliers Payments" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <StationCustomersPayments />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <StationSuppliersPayments />
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

export default StationPayment;
