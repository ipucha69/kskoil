import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import Box from "@mui/material/Box";
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
  IconButton,
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
import { Edit } from "@mui/icons-material";
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

const EditStock = ({ stock }) => {
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

  const [agoLitres, setAgoLitres] = useState(stock?.agoLitres);
  const [pmsLitres, setPmsLitres] = useState(stock?.pmsLitres);
  const [agoPrice, setAgoPrice] = useState(stock?.agoPrice);
  const [pmsPrice, setPmsPrice] = useState(stock?.pmsPrice);
  const [agoTotalPrice, setAgoTotal] = useState(stock?.agoTotalPrice);
  const [pmsTotalPrice, setPmsTotal] = useState(stock?.pmsTotalPrice);
  const [totalPrice, setTotalPrice] = useState(stock?.totalPrice);
  const [supplier, setSupplier] = useState({
    id: stock?.supplierID,
    label: stock?.supplierName,
  });
  const [station, setStation] = useState({
    id: stock?.stationID,
    label: stock?.stationName,
    data: {
      id: stock?.stationID,
      name: stock?.stationName,
      location: stock?.stationLocation,
      region: stock?.stationRegion,
      ewura: stock?.stationEwura,
      tin: stock?.stationTin,
    },
  });
  const [driver, setDriver] = useState({
    id: stock?.driverID,
    label: stock?.driverName,
    data: {
      id: stock?.driverID,
      name: stock?.driverName,
      licence: stock?.driverLicence,
      phone: stock?.driverPhone,
      truckNumber: stock?.truck,
    },
  });
  const [truck, setTruck] = useState(stock?.truck);
  const [date, setDate] = useState(
    stock?.date ? moment.unix(stock?.date?.seconds) : null
  );
  const [storage, setStorage] = useState(stock?.storage);
  const [description, setDescription] = useState(stock?.description);
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
    setTruck(driver?.data?.truckNumber);
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
    } else if (!driver) {
      toast.error("Please select driver");
    } else if (!truck) {
      toast.error("Please enter truck number");
    } else if (totalPrice < 1) {
      toast.error("Please enter purchased litres and prices");
    } else {
      //start updates
      setLoading(true);
      try {
        //get total prices difference
        const amount = totalPrice - stock?.totalPrice;
        const amountAgoPrice = agoTotalPrice - stock?.agoTotalPrice;
        const amountPmsPrice = pmsTotalPrice - stock?.pmsTotalPrice;

        const amountAgo = parseInt(agoLitres) - parseInt(stock?.agoLitres);
        const amountPms = parseInt(pmsLitres) - parseInt(stock?.pmsLitres);
        //update stock
        const editStock = httpsCallable(functions, "updateStock");
        editStock({
          agoLitres,
          pmsLitres,
          agoPrice,
          pmsPrice,
          agoTotalPrice,
          pmsTotalPrice,
          totalPrice,
          supplierID: supplier?.id,
          supplierName: supplier?.label,
          description,
          id: stock?.id,
          storage,
          truck,
          station: station?.data,
          driver: driver?.data,
          date: Timestamp.fromDate(new Date(date)),
          amount,
          amountAgo,
          amountPms,
          amountAgoPrice,
          amountPmsPrice,
          order: stock,
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            setLoading(false);

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
            onClick={(e) => stockRegistration(e)}
          >
            EDIT ORDER
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
            <h3 className="text-center text-xl py-4">Edit Order Details</h3>
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
                  className="w-[35%]"
                  value={truck}
                  onChange={(e) => setTruck(e.target.value)}
                />
                <div className="w-[10%] flex flex-row justify-center">
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

export default EditStock;
