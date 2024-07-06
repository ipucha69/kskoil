import React, { useState } from "react";
import { db } from "../../../App";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { addStationDrivers } from "../../../features/stationSlice";
import { selectUserInfo } from "../../../features/userSlice";
import { useParams } from "react-router-dom";
import { Button, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";

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

const EditDriver = ({ driver }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState(driver?.name);
  const [truckNumber, setTruck] = useState(driver?.truckNumber);
  const [licence, setLicence] = useState(driver?.licence);
  const [phone, setPhone] = useState(driver?.phone);
  const [description, setDescription] = useState(driver?.description);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();

  const user = useSelector(selectUserInfo);

  const getDrivers = async () => {
    let driversArray = [];

    const querySnapshot = await getDocs(
      collection(db, "stations", stationID, "drivers")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      driversArray.push(data);
    });

    if (driversArray.length > 0) {
      dispatch(addStationDrivers(driversArray));
    } else {
      dispatch(addStationDrivers([]));
    }
  };

  const driverRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter driver name");
    } else if (!truckNumber) {
      toast.error("Please enter truck number");
    } else if (!licence) {
      toast.error("Please enter driver licence number");
    } else if (!phone) {
      toast.error("Please enter driver phone number");
    } else {
      //start registration
      setLoading(true);
      try {
        // Add a new document with a generated id
        const dataRef = doc(collection(db, "driverBucket", driver?.id));
        await updateDoc(dataRef, {
          name,
          truckNumber,
          licence,
          phone,
          description,
          updated_by: { name: user?.name, role: user?.role },
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            //update data to station path
            addDataToStationPath();
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

  const addDataToStationPath = async () => {
    try {
      // Add a new document with a generated id
      const dataRef = doc(db, "stations", stationID, "drivers", driver?.id);
      await updateDoc(dataRef, {
        name,
        truckNumber,
        licence,
        phone,
        description,
        updated_by: { name: user?.name, role: user?.role },
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(async () => {
          getDrivers();
          setLoading(false);
          toast.success("Driver is updated successfully");
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
            onClick={(e) => driverRegistration(e)}
          >
            EDIT DRIVER
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <IconButton onClick={handleOpen} className="flex justify-center">
        <Edit className="text-primaryColor text-xl cursor-pointer" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Edit Driver Details</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Driver Name"
                  variant="outlined"
                  className="w-[45%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Phone Number"
                  variant="outlined"
                  className="w-[45%]"
                  value={phone}
                  type={"number"}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Truck Number"
                  variant="outlined"
                  className="w-[45%]"
                  value={truckNumber}
                  onChange={(e) => setTruck(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Driver Licence Number"
                  variant="outlined"
                  className="w-[45%]"
                  value={licence}
                  type={"number"}
                  onChange={(e) => setLicence(e.target.value)}
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

export default EditDriver;
