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
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { useParams } from "react-router-dom";
import {
  addPaymentTypes,
  selectPaymentTypes,
} from "../../../features/settingSlice";
import {
  addSuppliers,
  selectSuppliers,
} from "../../../features/supplierSlice";
import { getFunctions, httpsCallable } from "firebase/functions";
import { selectUserInfo } from "../../../features/userSlice";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment from "moment";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  addStationDetails,
  selectStationDetails,
} from "../../../features/stationSlice";
import { addStationSupplierPayments } from "../../../features/paymentSlice";

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

const AddStationSupplierPayment = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { stationID } = useParams();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setMethod] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [supplier, setSupplier] = useState("");
  const [stationPayment, setStationPayment] = useState("");
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState("");
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

    getMethods();
    getSuppliers();
    getStationDetails();
  }, [dispatch, stationID]);

  const getStationDetails = async () => {
    const docRef = doc(db, "stationBucket", stationID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addStationDetails(data));
    }
  };

  const methods = useSelector(selectPaymentTypes);
  const station = useSelector(selectStationDetails);
  const suppliers = useSelector(selectSuppliers);
  const user = useSelector(selectUserInfo);

  const sortedMethods = methods.map((method) => ({
    id: method?.id,
    label: method?.name,
  }));

  const methodOnChange = (e, value) => {
    setMethod(value);
  };

  const sortedSuppliers = suppliers.map((supplier) => ({
    id: supplier?.id,
    label: `${supplier?.name}`,
    value: supplier,
  }));

  const supplierOnChange = (e, value) => {
    setSupplier(value);
  };

  const sortedStationPayments = [
    { id: 1, label: "Station Cash" },
    { id: 2, label: "Station Balance" },
  ];
  const stationPaymentOnChange = (e, value) => {
    setStationPayment(value);
  };

  const getStationSuppliersPayments = async () => {
    let paymentsArray = [];

    const querySnapshot = await getDocs(
      collection(db, "suppliers", stationID, "supplierPayments")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      paymentsArray.push(data);
    });

    if (paymentsArray.length > 0) {
      dispatch(addStationSupplierPayments(paymentsArray));
    } else {
      dispatch(addStationSupplierPayments([]));
    }
  };

  const paymentRegistration = async (e) => {
    e.preventDefault();

    if (!amount) {
      toast.error("Please enter paid amount");
    } else if (!date) {
      toast.error("Please select date");
    } else if (!supplier) {
      toast.error("Please select supplier");
    } else if (!paymentMethod) {
      toast.error("Please select payment method");
    } else if (paymentMethod?.label?.toLowerCase() === "bank" && !bank) {
      toast.error("Please enter bank name");
    } else if (
      paymentMethod?.label?.toLowerCase() === "bank" &&
      !accountNumber
    ) {
      toast.error("Please enter bank account number");
    } else if (!stationPayment) {
      toast.error("Please select station payment");
    } else {
      //start registration
      setLoading(true);
      try {
        //create supplier payments
        const addPayment = httpsCallable(functions, "createSupplierPayment");
        addPayment({
          amount: parseInt(amount),
          paymentMethod,
          supplier,
          supplierID: supplier?.id,
          bank,
          accountNumber,
          stationID: station?.id,
          stationName: station?.name,
          stationPayment,
          description,
          date: Timestamp.fromDate(new Date(date)),
          created_by: { name: user?.name, role: user?.role },
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            if (data.status > 300) {
              toast.error(data.message);
            } else {
              setAmount("");
              setMethod("");
              setDescription("");
              setDate(null);

              toast.success(data.message);
              //fetch station details
              getStationSuppliersPayments();
              getStationDetails();
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
            SAVE SUPPLIER PAYMENT
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-56 bg-primaryColor cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <Add className="mt-2 py-0.5" />{" "}
        <p className="py-2">Create New Payment</p>
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
              Add Station Supplier Payment
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
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedSuppliers}
                  size="small"
                  className={"w-[92%]"}
                  value={supplier}
                  onChange={supplierOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Supplier" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedMethods}
                  size="small"
                  className={"w-[45%]"}
                  value={paymentMethod}
                  onChange={methodOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Payment Method" />
                  )}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedStationPayments}
                  size="small"
                  className="w-[45%]"
                  value={stationPayment}
                  onChange={stationPaymentOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Station Payment" />
                  )}
                />
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

export default AddStationSupplierPayment;
