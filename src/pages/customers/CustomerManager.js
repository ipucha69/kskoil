import React, { useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import Customers from "./Customers";
import PrivateCustomers from "./PrivateCustomers";
import BadDebtors from "./BadDebtors";

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

const CustomerManager = () => {
  const [value, setValue] = useState(0);

  const renderUserTabs = () => {
    return (
      <div>
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
            <Tab label="CUSTOMERS" {...a11yProps(0)} />
            <Tab label="BAD DEBTORS" {...a11yProps(1)} />
            <Tab label="PRIVATE CUSTOMERS" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Customers />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <BadDebtors />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <PrivateCustomers />
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
        {renderUserTabs()}
      </Grid>
    </Grid>
  );
};

export default CustomerManager;
