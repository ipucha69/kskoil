import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Grid, Tab, Tabs } from "@mui/material";
import AccountExpenses from "./AccountExpenses";
import AccountDebtors from "./AccountDebtors";
import AccountSales from "./AccountSales";
import AccountPayments from "./AccountPayments";
import AccountPurchases from "./AccountPurchases";
import AccountTransactions from "./AccountTransactions";

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

const Accounts = () => {
    const [value, setValue] = useState(0);
    const [pageLoading, setPageLoading] = useState(false);

  const renderUserTabs = () => {
        return (
        <div>
            <h4 className="text-center font-light text-xl py-2"></h4>
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
                sx={{ textColor: "#0A365C" }}
            >
                <Tab label="DETAILS" {...a11yProps(0)} />
                <Tab label="SALES" {...a11yProps(1)} />
                <Tab label="DEBTORS" {...a11yProps(2)} />
                <Tab label="PAYMENTS" {...a11yProps(3)} />
                <Tab label="EXPENSES" {...a11yProps(4)} />
                <Tab label="PURCHASES" {...a11yProps(5)} />
                <Tab label="TRANSACTIONS" {...a11yProps(6)} />
                <Tab label="OUTSTANDINGS" {...a11yProps(7)} />
            </Tabs>
            </Box>
            <TabPanel value={value} index={0}></TabPanel>
            <TabPanel value={value} index={1}>
            <AccountSales/>
            </TabPanel>
            <TabPanel value={value} index={2}>
            <AccountDebtors/>
            </TabPanel>
            <TabPanel value={value} index={3}>
            <AccountPayments/>
            </TabPanel>
            <TabPanel value={value} index={4}>
            <AccountExpenses/>
            </TabPanel>
            <TabPanel value={value} index={5}>
            <AccountPurchases/>
            </TabPanel>
            <TabPanel value={value} index={6}>
            <AccountTransactions/>
            </TabPanel>
            <TabPanel value={value} index={7}></TabPanel>
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

export default Accounts;
