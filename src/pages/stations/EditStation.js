import React, { useState } from "react";
import { db } from "../../App";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../assets/utils/colors";
import { addStationDetails, addStations } from "../../features/stationSlice";
import { Edit } from "@mui/icons-material";
import { selectUserInfo } from "../../features/userSlice";
import { useParams } from "react-router-dom";

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

const EditStation = ({ station }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState(station?.name);
  const [location, setLocation] = useState(station?.location);
  const [region, setRegion] = useState(station?.region);
  const [ewura, setEwura] = useState(station?.ewura);
  const [tin, setTin] = useState(station?.tin);
  const [description, setDescription] = useState(station?.description);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();

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
        // update
        const dataRef = doc(db, "stationBucket", station?.id);
        //
        await updateDoc(dataRef, {
          name,
          location,
          region,
          ewura,
          tin,
          description,
          updated_by: { name: user?.name, role: user?.role },
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            updateDataToStationPath({
              id: station?.id,
              name,
              status: station?.status,
            });
          })
          .catch((error) => {
            toast.error(error.message);
            setLoading(false);
          });
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    }
  };

  const updateDataToStationPath = async ({ id, name, status }) => {
    try {
      //
      const dataRef = doc(db, "stations", id, "account", "info");
      await updateDoc(dataRef, {
        name,
        status,
        location,
        region,
        ewura,
        tin,
        updated_by: { name: user?.name, role: user?.role },
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(() => {
          getStationDetails();
          getStations();
          toast.success("Station is updated successfully");
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
            EDIT STATION
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <IconButton onClick={handleOpen} className="flex justify-center">
        <Edit className="text-primaryColor cursor-pointer" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Edit Station Details</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Station Name"
                  variant="outlined"
                  className="w-[90%]"
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

export default EditStation;
