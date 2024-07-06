import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Card, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../App";
import {
  addPumpDetails,
  selectPumpDetails,
} from "../../../features/stationSlice";
import Description from "../../common/Description";
import Cards from "./Cards";

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

const Pump = () => {
  const [value, setValue] = useState(0);

  const dispatch = useDispatch();
  const { stationID, pumpID } = useParams();

  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };

  useEffect(() => {
    const getPumpDetails = async () => {
      const docRef = doc(db, "stations", stationID, "pumps", pumpID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addPumpDetails(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        dispatch(addPumpDetails({}));
      }
    };

    getPumpDetails();
  }, [dispatch, stationID, pumpID]);

  const pump = useSelector(selectPumpDetails);

  const renderPumpDetails = () => {
    return (
      <div className="py-2">
        <div className="py-4 mt-2 flex flex-row justify-center">
          <Card sx={{ width: 420, height: 150, bgcolor: "#E5E9ED" }}>
            <div className="px-4 py-3 h-full relative">
              <div className="absolute right-1">
                {/* <EditStation station={station} /> */}
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Pump Type :{" "}
                  <span className="text-primaryColor font-light">
                    {pump?.typeName}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Pump Number :{" "}
                  <span className="text-primaryColor font-light">
                    {pump?.name}
                  </span>
                </h4>
              </div>
              <div className="flex flex-row w-[100%] py-2">
                <h4 className="w-[50%]">
                  Status :{" "}
                  <span className="text-primaryColor font-light">
                    {pump?.status ? "ACTIVE" : "CLOSED"}
                  </span>
                </h4>
                <h4 className="w-[50%]">
                  Description :{" "}
                  <Description data={pump} title={"Pump Descriptions"} />
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
        <h4 className="text-center font-light text-xl py-2">
          {pump?.typeName} {pump?.name}
        </h4>
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
            <Tab label="CARDS" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          {renderPumpDetails()}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Cards />
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

export default Pump;
