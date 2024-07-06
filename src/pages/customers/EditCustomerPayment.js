import React, { useEffect, useState } from "react";
import { db } from "../../App";
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
import { colors } from "../../assets/utils/colors";
import { Edit } from "@mui/icons-material";
import {
  addCustomerDetails,
  addCustomerPayments,
  selectCustomerDetails,
} from "../../features/customerSlice";
import { useParams } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  addPaymentTypes,
  selectPaymentTypes,
} from "../../features/settingSlice";
import { selectUserInfo } from "../../features/userSlice";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { addSuppliers, selectSuppliers } from "../../features/supplierSlice";
import { addStations, selectStations } from "../../features/stationSlice";

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

const EditCustomerPayment = ({ payment }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { customerID } = useParams();

  const [amount, setAmount] = useState(payment?.amount);
  const [bank, setBank] = useState(payment?.bank);
  const [accountNumber, setAccountNumber] = useState(payment?.accountNumber);
  const [receiver, setReceiver] = useState({
    id:
      payment?.receiver === "Station"
        ? 1
        : payment?.receiver === "Supplier"
        ? 2
        : 3,
    label: payment?.receiver,
  });
  const [station, setStation] = useState(
    payment?.stationID
      ? {
          id: payment?.stationID,
          label: `${payment?.stationName} ${payment?.stationLocation}`,
          data: {
            id: payment?.stationID,
            name: payment?.stationName,
            location: payment?.stationLocation,
          },
        }
      : null
  );
  const [supplier, setSupplier] = useState(
    payment?.supplierID
      ? {
          id: payment?.supplierID,
          label: payment?.supplierName,
          data: { id: payment?.supplierID, name: payment?.supplierName },
        }
      : null
  );
  const [date, setDate] = useState(
    payment?.date ? moment.unix(payment?.date?.seconds) : null
  );
  const [paymentMethod, setMethod] = useState(payment?.paymentMethod);
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
    getStations();
    getSuppliers();
  }, [dispatch, customerID]);

  useEffect(() => {
    if (!receiver) {
      setStation("");
      setSupplier("");
    }

    if (paymentMethod?.label?.toLowerCase() === "cash") {
      setBank("");
      setAccountNumber("");
    }
  }, [receiver, paymentMethod]);

  const getCustomerDetails = async () => {
    const docRef = doc(db, "customerBucket", customerID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addCustomerDetails(data));
    }
  };

  const methods = useSelector(selectPaymentTypes);
  const customer = useSelector(selectCustomerDetails);
  const stations = useSelector(selectStations);
  const suppliers = useSelector(selectSuppliers);
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

  const stationOnChange = (e, value) => {
    setStation(value);
  };

  const sortedSuppliers = suppliers.map((supplier) => ({
    id: supplier?.id,
    label: `${supplier?.name}`,
    value: supplier,
  }));

  const supplierOnChange = (e, value) => {
    setSupplier(value);
  };

  const sortedReceivers = [
    { id: 1, label: "Station" },
    { id: 2, label: "Supplier" },
    { id: 3, label: "Both" },
  ];
  const receiverOnChange = (e, value) => {
    setReceiver(value);
  };

  const getCustomerPayments = async () => {
    let paymentsArray = [];

    const querySnapshot = await getDocs(
      collection(db, "customers", customerID, "payments")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      paymentsArray.push(data);
    });

    if (paymentsArray.length > 0) {
      dispatch(addCustomerPayments(paymentsArray));
    }
  };

  const paymentRegistration = async (e) => {
    e.preventDefault();

    if (!amount) {
      toast.error("Please enter paid amount");
    } else if (!date) {
      toast.error("Please select payment date");
    } else if (!paymentMethod) {
      toast.error("Please select payment method");
    } else if (paymentMethod?.label?.toLowerCase() === "bank" && !bank) {
      toast.error("Please enter bank name");
    } else if (
      paymentMethod?.label?.toLowerCase() === "bank" &&
      !accountNumber
    ) {
      toast.error("Please enter bank account number");
    } else if (receiver?.id == 1 && !station) {
      toast.error("Please select station");
    } else if (receiver?.id == 2 && !supplier) {
      toast.error("Please select supplier");
    } else if (receiver?.id == 3 && !supplier && !station) {
      toast.error("Please select supplier and station");
    } else {
      //start registration
      setLoading(true);
      try {
        //update customer payments
        const editPayment = httpsCallable(functions, "updateCustomerPayment");
        editPayment({
          amount: parseInt(amount),
          paymentMethod,
          customer,
          customerID,
          receiver,
          station,
          supplier,
          bank,
          accountNumber,
          description,
          payment,
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
              //fetch customer data
              getCustomerPayments();
              getCustomerDetails();
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
            EDIT CUSTOMER PAYMENT
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
              Edit Customer Payment Details
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
                    label="Select date"
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
                  freeSolo
                  className={"w-[45%]"}
                  value={paymentMethod}
                  onChange={methodOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Payment Method" />
                  )}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedReceivers}
                  size="small"
                  freeSolo
                  className={"w-[45%]"}
                  value={receiver}
                  onChange={receiverOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Receiver" />
                  )}
                />
              </div>
              {receiver ? (
                <>
                  {receiver?.id == 1 ? (
                    <div className="w-full py-2 flex justify-center">
                      <Autocomplete
                        id="combo-box-demo"
                        options={sortedStations}
                        size="small"
                        freeSolo
                        className="w-[92%]"
                        value={station}
                        onChange={stationOnChange}
                        renderInput={(params) => (
                          <TextField {...params} label="Select Station" />
                        )}
                      />
                    </div>
                  ) : (
                    <>
                      {receiver?.id == 2 ? (
                        <div className="w-full py-2 flex justify-center">
                          <Autocomplete
                            id="combo-box-demo"
                            options={sortedSuppliers}
                            size="small"
                            freeSolo
                            className="w-[92%]"
                            value={supplier}
                            onChange={supplierOnChange}
                            renderInput={(params) => (
                              <TextField {...params} label="Select Supplier" />
                            )}
                          />
                        </div>
                      ) : (
                        <>
                          {receiver?.id == 3 ? (
                            <div className="w-full py-2 flex flex-row gap-2 justify-center">
                              <Autocomplete
                                id="combo-box-demo"
                                options={sortedStations}
                                size="small"
                                freeSolo
                                className="w-[45%]"
                                value={station}
                                onChange={stationOnChange}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Select Station"
                                  />
                                )}
                              />
                              <Autocomplete
                                id="combo-box-demo"
                                options={sortedSuppliers}
                                size="small"
                                freeSolo
                                className="w-[45%]"
                                value={supplier}
                                onChange={supplierOnChange}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Select Supplier"
                                  />
                                )}
                              />
                            </div>
                          ) : null}
                        </>
                      )}
                    </>
                  )}
                </>
              ) : null}
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

export default EditCustomerPayment;
