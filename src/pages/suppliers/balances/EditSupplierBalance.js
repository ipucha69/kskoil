import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { Edit } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import {
  addSupplierDetails,
  addSupplierTransactions,
  selectSupplierDetails,
} from "../../../features/supplierSlice";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  addPaymentTypes,
  selectPaymentTypes,
} from "../../../features/settingSlice";
import { selectUserInfo } from "../../../features/userSlice";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { addStations, selectStations } from "../../../features/stationSlice";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const EditSupplierBalance = ({ payment }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { supplierID } = useParams();

  const [amount, setAmount] = useState(payment?.amount);
  const [paymentMethod, setMethod] = useState(payment?.paymentMethod);
  const [bank, setBank] = useState(payment?.bank);
  const [accountNumber, setAccountNumber] = useState(payment?.accountNumber);
  const [station, setStation] = useState(
    payment?.stationID
      ? {
          id: payment?.stationID,
          label: payment?.stationName,
        }
      : null
  );
  const [stationPayment, setStationPayment] = useState({
    id: payment?.stationPayment === "Station Cash" ? 1 : 2,
    label: payment?.stationPayment,
  });
  const [date, setDate] = useState(
    payment?.date ? moment.unix(payment?.date?.seconds) : null
  );
  const [description, setDescription] = useState(payment?.description);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const functions = getFunctions();

  useEffect(() => {
    const getMethods = async () => {
      let methodsArray = [];

      const querySnapshot = await getDocs(collection(db, "paymentTypes"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        methodsArray.push(data);
      });

      if (methodsArray.length > 0) {
        dispatch(addPaymentTypes(methodsArray));
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

    getMethods();
    getSupplierDetails();
  }, [dispatch, supplierID]);

  const getSupplierDetails = async () => {
    const docRef = doc(db, "supplierBucket", supplierID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addSupplierDetails(data));
    }
  };

  const methods = useSelector(selectPaymentTypes);
  const stations = useSelector(selectStations);
  const supplier = useSelector(selectSupplierDetails);
  const user = useSelector(selectUserInfo);

  const sortedMethods = methods.map((method) => ({
    id: method.id,
    label: method.name,
  }));

  const methodOnChange = (e, value) => {
    setMethod(value);
  };

  const sortedStations = stations.map((station) => ({
    id: station?.id,
    label: `${station?.name} ${station?.location || ""}`,
    value: station,
  }));

  //   // Create a new station object
  // const noneStation = {
  //   id: 1,
  //   label: "NONE",
  //   value: {}
  // };

  // // Add the new station to the beginning of the sortedStations array
  // sortedStations.unshift(noneStation);

  const stationOnChange = (e, value) => {
    setStation(value);
  };

  const sortedStationPayments = [
    { id: 1, label: "Station Cash" },
    { id: 2, label: "Station Balance" },
  ];
  const stationPaymentOnChange = (e, value) => {
    setStationPayment(value);
  };

  const getSupplierPayments = async () => {
    let paymentsArray = [];

    const querySnapshot = await getDocs(
      collection(db, "suppliers", supplierID, "payments")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      paymentsArray.push(data);
    });

    if (paymentsArray.length > 0) {
      dispatch(addSupplierTransactions(paymentsArray));
    }
  };

  const paymentRegistration = async (e) => {
    e.preventDefault();
    if (!amount) {
      toast.error("Please enter paid amount");
    } else if (!date) {
      toast.error("Please select date");
    } else if (!paymentMethod) {
      toast.error("Please select payment method");
    } else if(paymentMethod?.label?.toLowerCase() === "bank" && !bank){
      toast.error("Please enter bank name");
    }  else if(paymentMethod?.label?.toLowerCase() === "bank" && !accountNumber){
      toast.error("Please enter bank account number");
    } else if(station && !stationPayment){
      toast.error("Please select station payment");
    } else {
      //start registration
      setLoading(true);
      try {
        //update supplier payments
        const addPayment = httpsCallable(functions, "updateSupplierPayment");
        addPayment({
          amount: parseInt(amount),
          paymentMethod,
          supplier,
          supplierID,
          bank,
          accountNumber,
          stationID: station?.id,
          stationName: station?.name,
          stationPayment,
          description,
          date: Timestamp.fromDate(new Date(date)),
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            if (data.status > 300) {
              toast.error(data.message);
            } else {
              toast.success(data.message);
              //fetch supplier
              getSupplierPayments();
              getSupplierDetails();
            }
          })
          .catch((error) => {
            const message = error.message;
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
            onClick={(e) => paymentRegistration(e)}
          >
            EDIT SUPPLIER PAYMENT
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
            <h3 className="text-center text-xl py-4">
              Edit Supplier Payment Details
            </h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Paid Amount"
                  variant="outlined"
                  className="w-[45%]"
                  value={amount}
                  type={"number"}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <LocalizationProvider
                  dateAdapter={AdapterMoment}
                  dateLibInstance={moment.utc}
                >
                  <DatePicker
                    label="Select Payment Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    className="w-[45%]"
                    slotProps={{ textField: { size: "small" } }}
                  />
                </LocalizationProvider>
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedMethods}
                  size="small"
                  className={station ? "w-[30%]" : "w-[45%]"}
                  value={paymentMethod}
                  onChange={methodOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Payment Method" />
                  )}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedStations}
                  size="small"
                  className={station ? "w-[30%]" : "w-[45%]"}
                  value={station}
                  onChange={stationOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Station" />
                  )}
                />
                {station ? (
                  <Autocomplete
                    id="combo-box-demo"
                    options={sortedStationPayments}
                    size="small"
                    className="w-[30%]"
                    value={stationPayment}
                    onChange={stationPaymentOnChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Station Payment" />
                    )}
                  />
                ) : null}
              </div>
              {paymentMethod?.label ? (
                <>
                  {paymentMethod?.label?.toLowerCase() === "bank" ? (
                    <div className="w-full py-2 flex flex-row gap-2 justify-center">
                      <TextField
                        size="small"
                        id="outlined-basic"
                        label="Bank Name"
                        variant="outlined"
                        className="w-[45%]"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                      />
                      <TextField
                        size="small"
                        id="outlined-basic"
                        label="Account Number"
                        variant="outlined"
                        className="w-[45%]"
                        value={accountNumber}
                        type={"number"}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
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

export default EditSupplierBalance;
