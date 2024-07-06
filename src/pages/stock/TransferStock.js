import React, { useEffect, useState } from "react";
import { db } from "../../App";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  Timestamp,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../assets/utils/colors";
import {
  addDrivers,
  addStockDetails,
  addStockTransfers,
  selectDrivers,
  selectStockDetails,
} from "../../features/stockSlice";
import { addStations, selectStations } from "../../features/stationSlice";
import moment from "moment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { getFunctions, httpsCallable } from "firebase/functions";
import { selectUserInfo } from "../../features/userSlice";
import {
  addPrivateCustomers,
  selectPrivateCustomers,
} from "../../features/customerSlice";

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

const TransferStock = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [agoLitres, setAgoLitres] = useState("");
  const [pmsLitres, setPmsLitres] = useState("");
  const [agoPrice, setAgoPrice] = useState("");
  const [pmsPrice, setPmsPrice] = useState("");
  const [agoTotalPrice, setAgoTotal] = useState(0);
  const [pmsTotalPrice, setPmsTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [station, setStation] = useState("");
  const [customer, setCustomer] = useState("");
  const [destination, setDestinaion] = useState("");
  const [driver, setDriver] = useState("");
  const [truck, setTruck] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const functions = getFunctions();

  const getStockDetails = async () => {
    const docRef = doc(db, "stock", "info");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addStockDetails(data));
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
      dispatch(addStockDetails({}));
    }
  };

  useEffect(() => {
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
      } else {
        dispatch(addStations([]));
      }
    };

    const getCustomers = async () => {
      let customersArray = [];

      const q = query(
        collection(db, "customerBucket"),
        where("private", "==", true)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        customersArray.push(data);
      });

      if (customersArray.length > 0) {
        dispatch(addPrivateCustomers(customersArray));
      } else {
        dispatch(addPrivateCustomers([]));
      }
    };

    const getDrivers = async () => {
      let driversArray = [];

      const querySnapshot = await getDocs(collection(db, "driverBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        driversArray.push(data);
      });

      if (driversArray.length > 0) {
        dispatch(addDrivers(driversArray));
      } else {
        dispatch(addDrivers([]));
      }
    };

    getStations();
    getStockDetails();
    getCustomers();
    getDrivers();
  }, [dispatch]);

  useEffect(() => {
    let total = agoLitres * agoPrice;
    setAgoTotal(total);
  }, [agoLitres, agoPrice]);

  useEffect(() => {
    let total = pmsLitres * pmsPrice;
    setPmsTotal(total);
  }, [pmsLitres, pmsPrice]);

  useEffect(() => {
    let price1 = 0;
    let price2 = 0;

    if (agoTotalPrice) {
      price1 = agoTotalPrice;
    }

    if (pmsTotalPrice) {
      price2 = pmsTotalPrice;
    }

    let total = price1 + price2;
    setTotalPrice(total);
  }, [agoTotalPrice, pmsTotalPrice]);

  useEffect(() => {
    setTruck(driver?.data?.truckNumber || "");
  }, [driver]);

  const stations = useSelector(selectStations);
  const stock = useSelector(selectStockDetails);
  const user = useSelector(selectUserInfo);
  const customers = useSelector(selectPrivateCustomers);
  const drivers = useSelector(selectDrivers);
  const destinations = [
    { id: 1, name: "customer" },
    { id: 2, name: "station" },
  ];

  const sortedStations = stations.map((station) => ({
    id: station.id,
    label: station.name,
    data: station,
  }));

  const stationOnChange = (e, value) => {
    setStation(value);
  };

  const sortedCustomers = customers.map((customer) => ({
    id: customer.id,
    label: customer.name,
  }));

  const customerOnChange = (e, value) => {
    setCustomer(value);
  };

  const sortedDestinations = destinations.map((destiny) => ({
    id: destiny.id,
    label: destiny.name,
  }));

  const destinationOnChange = (e, value) => {
    setDestinaion(value?.label);
  };

  const sortedDrivers = drivers.map((driver) => ({
    id: driver.id,
    label: driver.name,
    data: driver,
  }));

  const driverOnChange = (e, value) => {
    setDriver(value);
  };

  const getStocks = async () => {
    let stocksArray = [];

    const querySnapshot = await getDocs(collection(db, "stockTransferBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      stocksArray.push(data);
    });

    if (stocksArray.length > 0) {
      dispatch(addStockTransfers(stocksArray));
    }
  };

  const stockTransfers = async (e) => {
    e.preventDefault();

    if (!agoLitres && !pmsLitres) {
      toast.error("Please enter transferred litres");
    } else if (!agoPrice && !pmsPrice) {
      toast.error("Please enter price per litre");
    } else if (!destination) {
      toast.error("Please select destination");
    } else if (destination === "station" && !station) {
      toast.error("Please select station");
    } else if (destination === "customer" && !customer) {
      toast.error("Please select customer");
    } else if (!driver) {
      toast.error("Please select driver");
    } else if (!truck) {
      toast.error("Please enter truck number");
    } else if (totalPrice < 1) {
      toast.error("Please enter transferred litres and prices");
    } else if (parseInt(agoLitres) > stock?.availableAgo) {
      toast.error(
        `Sorry! AGO litres can not be above ${stock?.availableAgo} litres available AGO stock`
      );
    } else if (parseInt(pmsLitres) > stock?.availablePms) {
      toast.error(
        `Sorry! PMS litres can not be above ${stock?.availablePms} litres available PMS stock`
      );
    } else {
      const litresAgo = agoLitres ? parseInt(agoLitres) : 0;
      const priceAgo = agoPrice ? parseInt(agoPrice) : 0;

      const litresPms = pmsLitres ? parseInt(pmsLitres) : 0;
      const pricePms = pmsPrice ? parseInt(pmsPrice) : 0;

      //start registration
      setLoading(true);
      try {
        // Add atock transfer
        const addStockTransfer = httpsCallable(functions, "stockTransfer");
        addStockTransfer({
          agoLitres: litresAgo,
          pmsLitres: litresPms,
          agoPrice: priceAgo,
          pmsPrice: pricePms,
          agoTotalPrice,
          pmsTotalPrice,
          totalPrice,
          stationID: station?.id,
          stationName: station?.label,
          stationLocation: station?.data?.location,
          customerID: customer?.id,
          customerName: customer?.label,
          destination,
          driver: driver?.data,
          truck,
          description,
          date: Timestamp.fromDate(new Date(date)),
          created_by: { name: user?.name, role: user?.role },
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            setLoading(false);
            setAgoLitres("");
            setPmsLitres("");
            setAgoPrice("");
            setPmsPrice("");
            setAgoTotal(0);
            setPmsTotal(0);
            setTotalPrice(0);
            setDescription("");
            setDate(null);
            setStation("");
            setCustomer("");
            setDriver("");
            setTruck("");
            setDestinaion("");

            toast.success(data.message);
            //fetch stocks
            getStockDetails();
            getStocks();
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
        <Add className="mt-2 py-0.5" /> <p className="py-2">Transfer Stock</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">
              Transfer Stock To Station / Private Customer
            </h3>
            <div>
              <div
                className={`w-full py-2 flex ${
                  destination ? "flex-row gap-2" : null
                } justify-center`}
              >
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedDestinations}
                  size="small"
                  freeSolo
                  className={`${destination ? "w-[45%]" : "w-[92%]"}`}
                  value={destination}
                  onChange={destinationOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Destination" />
                  )}
                />
                {destination ? (
                  <>
                    {destination === "station" ? (
                      <Autocomplete
                        id="combo-box-demo"
                        options={sortedStations}
                        size="small"
                        freeSolo
                        className="w-[45%]"
                        value={station}
                        onChange={stationOnChange}
                        renderInput={(params) => (
                          <TextField {...params} label="Select Station" />
                        )}
                      />
                    ) : (
                      <Autocomplete
                        id="combo-box-demo"
                        options={sortedCustomers}
                        size="small"
                        freeSolo
                        className="w-[45%]"
                        value={customer}
                        onChange={customerOnChange}
                        renderInput={(params) => (
                          <TextField {...params} label="Select Customer" />
                        )}
                      />
                    )}
                  </>
                ) : null}
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="AGO Litres"
                  variant="outlined"
                  className="w-[30%]"
                  value={agoLitres}
                  type={"number"}
                  onChange={(e) => setAgoLitres(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="AGO Price Per Litre"
                  variant="outlined"
                  className="w-[30%]"
                  value={agoPrice}
                  type={"number"}
                  onChange={(e) => setAgoPrice(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="AGO Total Price"
                  variant="outlined"
                  className="w-[30%]"
                  value={agoTotalPrice}
                  onChange={(e) => setAgoTotal(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="PMS Litres"
                  variant="outlined"
                  className="w-[30%]"
                  value={pmsLitres}
                  type={"number"}
                  onChange={(e) => setPmsLitres(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="PMS Price Per Litre"
                  variant="outlined"
                  className="w-[30%]"
                  value={pmsPrice}
                  type={"number"}
                  onChange={(e) => setPmsPrice(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="PMS Total Price"
                  variant="outlined"
                  className="w-[30%]"
                  value={pmsTotalPrice}
                  onChange={(e) => setPmsTotal(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Price"
                  variant="outlined"
                  className="w-[45%]"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                />
                <LocalizationProvider
                  dateAdapter={AdapterMoment}
                  dateLibInstance={moment.utc}
                >
                  <DatePicker
                    label="Select date"
                    slotProps={{ textField: { size: "small" } }}
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    className="w-[45%]"
                  />
                </LocalizationProvider>
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedDrivers}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={driver}
                  onChange={driverOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Driver" />
                  )}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Truck Number"
                  variant="outlined"
                  className="w-[45%]"
                  value={truck}
                  onChange={(e) => setTruck(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={1}
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

export default TransferStock;
