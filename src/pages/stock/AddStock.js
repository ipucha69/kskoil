import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../assets/utils/colors";
import {
  addDrivers,
  addStocks,
  selectDrivers,
} from "../../features/stockSlice";
import { addSuppliers, selectSuppliers } from "../../features/supplierSlice";
import { getFunctions, httpsCallable } from "firebase/functions";
import moment from "moment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { selectUserInfo } from "../../features/userSlice";
import { addStations, selectStations } from "../../features/stationSlice";
import Checkbox from "../common/Checkbox";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 850,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

const AddStock = () => {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleClickOpen = () => {
    setDialog(true);
  };

  const handleClickClose = () => {
    setDialog(false);
  };

  const [agoLitres, setAgoLitres] = useState("");
  const [pmsLitres, setPmsLitres] = useState("");
  const [agoPrice, setAgoPrice] = useState("");
  const [pmsPrice, setPmsPrice] = useState("");
  const [station, setStation] = useState("");
  const [driver, setDriver] = useState("");
  const [truck, setTruck] = useState("");
  const [storage, setStorage] = useState(false);
  const [agoTotalPrice, setAgoTotal] = useState(0);
  const [pmsTotalPrice, setPmsTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const functions = getFunctions();

  useEffect(() => {
    const getSuppliers = async () => {
      let suppliersArray = [];

      const querySnapshot = await getDocs(collection(db, "supplierBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        suppliersArray.push(data);
      });

      if (suppliersArray.length > 0) {
        dispatch(addSuppliers(suppliersArray));
      } else {
        dispatch(addSuppliers([]));
      }
    };

    const getDrivers = async () => {
      let driverArray = [];

      const querySnapshot = await getDocs(collection(db, "driverBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        driverArray.push(data);
      });

      if (driverArray.length > 0) {
        dispatch(addDrivers(driverArray));
      } else {
        dispatch(addDrivers([]));
      }
    };

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

    getSuppliers();
    getStations();
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
    let total = agoTotalPrice + pmsTotalPrice;
    setTotalPrice(total);
  }, [agoTotalPrice, pmsTotalPrice]);

  useEffect(() => {
    setTruck(driver?.data?.truckNumber || "");
  }, [driver]);

  const suppliers = useSelector(selectSuppliers);
  const stations = useSelector(selectStations);
  const drivers = useSelector(selectDrivers);
  const user = useSelector(selectUserInfo);

  const sortedSuppliers = suppliers.map((supplier) => ({
    id: supplier.id,
    label: supplier.name,
  }));

  const supplierOnChange = (e, value) => {
    setSupplier(value);
  };

  const sortedStations = stations.map((station) => ({
    id: station.id,
    label: station.name,
    data: station,
  }));

  const stationOnChange = (e, value) => {
    setStation(value);
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

    const querySnapshot = await getDocs(collection(db, "stockBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      stocksArray.push(data);
    });

    if (stocksArray.length > 0) {
      dispatch(addStocks(stocksArray));
    }
  };

  const handleChangeStorage = () => {
    setStorage(!storage);
    handleClickClose();
  };

  const stockRegistration = async (e) => {
    e.preventDefault();

    if (!agoLitres && !pmsLitres) {
      toast.error("Please enter purchased litres");
    } else if (!agoPrice && !pmsPrice) {
      toast.error("Please enter price per litre");
    } else if (!supplier) {
      toast.error("Please select supplier");
    } else if (!station) {
      toast.error("Please select station");
    } else if (!driver) {
      toast.error("Please select driver");
    } else if (!truck) {
      toast.error("Please enter truck number");
    } else if (totalPrice < 1) {
      toast.error("Please enter purchased litres and prices");
    } else {
      //start registration
      setLoading(true);
      try {
        //create stock
        const addStock = httpsCallable(functions, "createStock");
        addStock({
          agoLitres,
          pmsLitres,
          agoPrice,
          pmsPrice,
          agoTotalPrice,
          pmsTotalPrice,
          totalPrice,
          supplierID: supplier?.id,
          supplierName: supplier?.label,
          stationID: station?.id,
          station: station?.data,
          driver: driver?.data,
          truck,
          description,
          storage,
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
            setSupplier("");
            setStation("");
            setDriver("");
            setTruck("");

            toast.success(data.message);
            //fetch stocks
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
        console.log("2");
        toast.error(error.message);
        console.log(error);
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
            onClick={(e) => stockRegistration(e)}
          >
            SAVE ORDER
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
        <Add className="mt-2 py-0.5" /> <p className="py-2">Add New Order</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Order Details</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedSuppliers}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={supplier}
                  onChange={supplierOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Supplier" />
                  )}
                />
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
                  className="w-[38%]"
                  value={truck}
                  onChange={(e) => setTruck(e.target.value)}
                />
                <div className="w-[7%] flex flex-row justify-center">
                  <div className="flex flex-col justify-center">
                    <Checkbox
                      onChange={handleClickOpen}
                      value={storage}
                      checked={storage}
                    />
                    <h4 className="text-xs text-center">Stock</h4>
                  </div>
                  <Dialog
                    open={dialog}
                    onClose={handleClickClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      {"Confirm Order Storage"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        {`Are you sure you want to send order direct into ${
                          storage ? "station" : "stock"
                        }?`}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClickClose}>cancel</Button>
                      <Button onClick={handleChangeStorage} autoFocus>
                        Ok
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
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
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    className="w-[45%]"
                    slotProps={{ textField: { size: "small" } }}
                  />
                </LocalizationProvider>
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

export default AddStock;
