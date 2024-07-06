import React, { useEffect, useState } from "react";
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
import { addStationPrices } from "../../../features/stationSlice";
import { selectUserInfo } from "../../../features/userSlice";
import { useParams } from "react-router-dom";
import { Button } from "@mui/material";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddPrice = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [petrolPrice, setPetrol] = useState("");
  const [dieselPrice, setDiesel] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();

  const user = useSelector(selectUserInfo);

  const getPrices = async () => {
    let pricesArray = [];

    const querySnapshot = await getDocs(
      collection(db, "stations", stationID, "prices")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      pricesArray.push(data);
    });

    if (pricesArray.length > 0) {
      dispatch(addStationPrices(pricesArray));
    }
  };

  const priceRegistration = async (e) => {
    e.preventDefault();

    if (!petrolPrice) {
      toast.error("Please enter petrol price");
    } else if (!dieselPrice) {
      toast.error("Please enter diesel price");
    } else {
      //start registration
      setLoading(true);
      try {
        // Add a new document with a generated id
        const dataRef = doc(collection(db, "priceBucket"));
        await setDoc(dataRef, {
          petrolPrice,
          dieselPrice,
          description,
          id: dataRef.id,
          stationID,
          created_by: {name: user?.name, role: user?.role},
          updated_by: {name: user?.name, role: user?.role},
          created_at: Timestamp.fromDate(new Date()),
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            //add data to station path
            addDataToStationPath({
              id: dataRef.id,
              petrolPrice,
              dieselPrice,
              description,
            });
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

  const addDataToStationPath = async ({
    id,
    petrolPrice,
    dieselPrice,
    description,
  }) => {
    try {
      // Add a new document with a generated id
      const dataRef = doc(db, "stations", stationID, "prices", id);
      await setDoc(dataRef, {
        petrolPrice,
        dieselPrice,
        description,
        id,
        stationID,
        created_by: {name: user?.name, role: user?.role},
        updated_by: {name: user?.name, role: user?.role},
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(async () => {
          //update price on station
          const dataRef = doc(db, "stations", stationID, "account", "info");
          await updateDoc(dataRef, {
            agoPrice: petrolPrice,
            pmsPrice: dieselPrice,
            updated_at: Timestamp.fromDate(new Date()),
          })
            .then(async () => {
              //
              const dataRef = doc(db, "stationBucket", stationID);
              await updateDoc(dataRef, {
                agoPrice: petrolPrice,
                pmsPrice: dieselPrice,
                updated_at: Timestamp.fromDate(new Date()),
              })
                .then(() => {
                  setPetrol("");
                  setDiesel("");
                  setDescription("");
                  getPrices();
                  setLoading(false);
                  toast.success("Price is saved successfully");
                })
                .catch((error) => {
                  // console.error("Error removing document: ", error.message);
                  toast.error(error.message);
                  setLoading(false);
                });
            })
            .catch((error) => {
              // console.error("Error removing document: ", error.message);
              toast.error(error.message);
              setLoading(false);
            });
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
            className="w-[82%] cursor-not-allowed"
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
            className="w-[82%]"
            sx={{
              background: `${colors.primary}`,
              "&:hover": {
                background: `${colors.bgColor6}`,
              },
            }}
            onClick={(e) => priceRegistration(e)}
          >
            SAVE PRICE
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
        <Add className="mt-2 py-0.5" /> <p className="py-2">Create New Price</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Price</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="AGO Price"
                  variant="outlined"
                  className="w-[40%]"
                  value={petrolPrice}
                  type={"number"}
                  onChange={(e) => setPetrol(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="PMS Price"
                  variant="outlined"
                  className="w-[40%]"
                  value={dieselPrice}
                  type={"number"}
                  onChange={(e) => setDiesel(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={2}
                  variant="outlined"
                  className="w-[82%]"
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

export default AddPrice;
