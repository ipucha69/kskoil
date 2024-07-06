import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import moment from "moment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useParams } from "react-router-dom";
import {
  addPumps,
  addStationDetails,
  addStationDistributions,
  selectPumps,
  selectStationDetails,
} from "../../../features/stationSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddStockDistribution = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [litres, setLitres] = useState("");
  const [price, setPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [pump, setPump] = useState();
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();

  const getStationDeatils = async () => {
    const docRef = doc(db, "stations", stationID, "account", "info");
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

  useEffect(() => {
    const getPumps = async () => {
      let pumpsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "pumps")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        pumpsArray.push(data);
      });

      if (pumpsArray.length > 0) {
        dispatch(addPumps(pumpsArray));
      }
    };

    getPumps();
    getStationDeatils();
  }, [dispatch]);

  useEffect(() => {
    getTotal();
  }, [litres, price]);

  const pumps = useSelector(selectPumps);
  const stationDetails = useSelector(selectStationDetails);

  const sortedPumps = pumps.map((pump) => ({
    id: pump.id,
    label: `${pump.typeName} ${pump.name}`,
    value: pump,
  }));

  const pumpOnChange = (e, value) => {
    setPump(value);
  };

  const getTotal = () => {
    let total = litres * price;
    setTotalPrice(total);
  };

  const getDistributions = async () => {
    let distributionsArray = [];

    const querySnapshot = await getDocs(
      collection(db, "stations", stationID, "distributions")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      distributionsArray.push(data);
    });

    if (distributionsArray.length > 0) {
      dispatch(addStationDistributions(distributionsArray));
    }
  };

  const stockTransfers = async (e) => {
    e.preventDefault();

    const name = pump?.value?.typeName;

    if (!litres) {
      toast.error("Please enter transferred litres");
    } else if (!price) {
      toast.error("Please enter price per litre");
    } else if (!pump) {
      toast.error("Please select pump");
    } else if (totalPrice < 1) {
      toast.error("Please enter transferred litres and prices");
    } else if (
      name?.toLowerCase() == "ago" &&
      parseInt(litres) > stationDetails?.availableAgoLitres
    ) {
      toast.error(
        `Sorry! AGO litres can not be above ${stationDetails?.availableAgoLitres} litres available AGO stock`
      );
    } else if (
      name?.toLowerCase() == "pms" &&
      parseInt(litres) > stationDetails?.availablePmsLitres
    ) {
      toast.error(
        `Sorry! PMS litres can not be above ${stationDetails?.availablePmsLitres} litres available PMS stock`
      );
    } else {
      //start registration
      setLoading(true);
      try {
        // Add atock transfer
        const distributeStock = httpsCallable(functions, "stockDistribution");
        distributeStock({
          litres,
          price,
          totalPrice,
          fuel: pump?.value?.typeName,
          pumpID: pump?.id,
          pumpName: pump?.label,
          stationID,
          description,
          date: Timestamp.fromDate(new Date(date)),
          user: {},
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            setLoading(false);
            setLitres("");
            setPrice("");
            setTotalPrice(0);
            setDescription("");
            setDate(null);
            setPump();

            toast.success(data.message);
            //fetch stocks
            getStationDeatils();
            getDistributions();
          })
          .catch((error) => {
            const message = error.message;
            console.log("1");
            console.log(error);
            setLoading(false);
            toast.error(message);
          });
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
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
            onClick={(e) => stockTransfers(e)}
          >
            TRANSFER STOCK
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
        <Add className="mt-2 py-0.5" /> <p className="py-2">Distribute Stock</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Transfer Stock To Pump</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedPumps}
                  size="small"
                  className="w-[82%]"
                  value={pump}
                  onChange={pumpOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Pump" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Litres"
                  variant="outlined"
                  className="w-[40%]"
                  value={litres}
                  type={"number"}
                  onChange={(e) => setLitres(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Price Per Litre"
                  variant="outlined"
                  className="w-[40%]"
                  value={price}
                  type={"number"}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="large"
                  id="outlined-basic"
                  label="Total Price"
                  variant="outlined"
                  className="w-[40%]"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                />
                <LocalizationProvider
                  dateAdapter={AdapterMoment}
                  dateLibInstance={moment.utc}
                >
                  <DatePicker
                    label="Select date"
                    size="small"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    className="w-[40%]"
                  />
                </LocalizationProvider>
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

export default AddStockDistribution;
