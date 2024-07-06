import React, { useState } from "react";
import { db } from "../../App";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../assets/utils/colors";
import { addStations } from "../../features/stationSlice";
import { selectUserInfo } from "../../features/userSlice";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddStation = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("");
  const [ewura, setEwura] = useState("");
  const [tin, setTin] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const getStations = async () => {
    let stationsArray = [];

    const querySnapshot = await getDocs(collection(db, "stationBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      stationsArray.push(data);
    });

    if (stationsArray.length > 0) {
      dispatch(addStations(stationsArray));
    }
  };

  const user = useSelector(selectUserInfo);

  const stationRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter station name");
    } else if (!location) {
      toast.error("Please enter station location");
    } else if (!ewura) {
      toast.error("Please enter ewura registration");
    } else if (!tin) {
      toast.error("Please enter TIN number");
    } else if (!region) {
      toast.error("Please enter station region");
    } else {
      //start registration
      setLoading(true);
      try {
        // Add a new document with a generated id
        const dataRef = doc(collection(db, "stationBucket"));
        await setDoc(dataRef, {
          name,
          location,
          region,
          ewura,
          tin,
          description,
          id: dataRef.id,
          status: true,
          agoLitres: 0,
          pmsLitres: 0,
          availableAgoLitres: 0,
          availablePmsLitres: 0,
          soldAgoLitres: 0,
          soldPmsLitres: 0,
          totalFuelAmount: 0,
          totalExpensesAmount: 0,
          totalSalesAmount: 0,
          created_by: { name: user?.name, role: user?.role },
          updated_by: { name: user?.name, role: user?.role },
          created_at: Timestamp.fromDate(new Date()),
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            //add data to station path
            addDataToStationPath({ id: dataRef.id, name, status: true });
          })
          .catch((error) => {
            // console.error("Error removing document: ", error.message);
            toast.error(error.message);
            setLoading(false);
          });
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    }
  };

  const addDataToStationPath = async ({ id, name, status }) => {
    try {
      // Add a new document with a generated id
      const dataRef = doc(db, "stations", id, "account", "info");
      await setDoc(dataRef, {
        name,
        location,
        region,
        ewura,
        tin,
        id,
        status,
        agoLitres: 0,
        pmsLitres: 0,
        availableAgoLitres: 0,
        availablePmsLitres: 0,
        soldAgoLitres: 0,
        soldPmsLitres: 0,
        totalFuelAmount: 0,
        totalExpensesAmount: 0,
        totalSalesAmount: 0,
        created_by: { name: user?.name, role: user?.role },
        updated_by: { name: user?.name, role: user?.role },
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(() => {
          setName("");
          setLocation("");
          setEwura("");
          setTin("");
          setRegion("");
          setDescription("");
          getStations();
          toast.success("Station is saved successfully");
          setLoading(false);
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
          setLoading(false);
        });
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const renderButton = () => {
    if (loading) {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[92%] cursor-not-allowed"
            sx={{
              background: `${colors.primary}`,
            }}
            disabled
          >
            <svg
              className="animate-spin h-5 w-5 mr-3 ..."
              viewBox="0 0 24 24"
            ></svg>
            Loading...
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[92%]"
            sx={{
              background: `${colors.primary}`,
              "&:hover": {
                background: `${colors.bgColor6}`,
              },
            }}
            onClick={(e) => stationRegistration(e)}
          >
            SAVE STATION
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-52 bg-primaryColor cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <Add className="mt-2 py-0.5" />{" "}
        <p className="py-2">Create New Station</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Station</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Station Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Station Location"
                  variant="outlined"
                  className="w-[45%]"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Station Region"
                  variant="outlined"
                  className="w-[45%]"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Station Ewura"
                  variant="outlined"
                  className="w-[45%]"
                  value={ewura}
                  onChange={(e) => setEwura(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Station TIN Number"
                  variant="outlined"
                  className="w-[45%]"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={2}
                  variant="outlined"
                  className="w-[92%]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="w-full py-2 pt-3 flex justify-center">
                {renderButton()}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddStation;
