import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs, query, where } from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useParams } from "react-router-dom";
import { addCustomers, selectCustomers } from "../../../features/customerSlice";
import {
  addDayDebtorsSales,
  addDaySale,
  selectDayDebtors,
  selectDaySale,
} from "../../../features/saleSlice";
import { selectUserInfo } from "../../../features/userSlice";
import {
  addPaymentTypes,
  selectPaymentTypes,
} from "../../../features/settingSlice";

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

const AddDayCashBook = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [customer, setCustomer] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [payment, setPayment] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();

  const getSales = async () => {
    try {
      //fetch day book
      const daySalesBook = httpsCallable(functions, "fetchDayBook");
      daySalesBook({ stationID })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          //add day
          const sales = data?.data?.dayBook;
          const debtorsCashSales = data?.data?.debtorsCashSales;
          // console.log(sales);
          dispatch(addDaySale(sales));
          dispatch(addDayDebtorsSales(debtorsCashSales));
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getCustomers = async () => {
      let customersArray = [];

      const q = query(
        collection(db, "customerBucket"),
        where("private", "==", false),
        where("status", "==", true)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        customersArray.push(data);
      });

      if (customersArray.length > 0) {
        dispatch(addCustomers(customersArray));
      } else {
        dispatch(addCustomers([]));
      }
    };

    const getTypes = async () => {
      let typesArray = [];

      const querySnapshot = await getDocs(collection(db, "paymentTypes"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        typesArray.push(data);
      });

      if (typesArray.length > 0) {
        dispatch(addPaymentTypes(typesArray));
      }
    };

    getCustomers();
    getSales();
    getTypes();
  }, [dispatch, stationID]);

  const customers = useSelector(selectCustomers);
  const sales = useSelector(selectDaySale);
  const debtors = useSelector(selectDayDebtors);
  const paymentTypes = useSelector(selectPaymentTypes);
  const user = useSelector(selectUserInfo);

  const sortedCustomers = customers.map((customer) => ({
    id: customer.id,
    label: customer.name,
    value: customer,
  }));

  const customerOnChange = (e, value) => {
    setCustomer(value);
  };

  const sortedPaymentTypes = paymentTypes.map((payment) => ({
    id: payment.id,
    label: payment.name,
  }));

  const paymentOnChange = (e, value) => {
    setPayment(value);
  };

  const saveDebtor = async (e) => {
    e.preventDefault();

    if (!customer) {
      toast.error("Please select customer");
    } else if (!payment) {
      toast.error("Please select payment method");
    } else if (!totalAmount) {
      toast.error("Please enter total litres and price");
    } else {
      //start registration
      setLoading(true);
      try {
        // Add debtor
        const newDebtor = httpsCallable(functions, "createDebtorCashSale");
        newDebtor({
          customerName: customer?.label,
          customerID: customer?.id,
          totalAmount,
          paymentMethodID: payment?.id,
          paymentMethod: payment?.label,
          stationID,
          description,
          day: sales?.day,
          dayBookID: sales?.id,
          created_by: { name: user?.name, role: user?.role },
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            if (data.status < 400) {
              setLoading(false);
              setPayment("");
              setTotalAmount("");
              setDescription("");
              setCustomer("");

              toast.success(data.message);
              //fetch data
              getSales();
            } else {
              toast.error(data.message);
              setLoading(false);
            }
          })
          .catch((error) => {
            const message = error.message;
            // console.log("1");
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
            onClick={(e) => saveDebtor(e)}
          >
            SAVE DEBTOR CASH SALE
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-8 w-48 bg-primaryColor cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <Add className="mt-1 py-0.5" />
        <p className="py-1 text-white">Debtor Cash Sale</p>
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
              Add Debtor Cash Sale Details
            </h3>
            <div>
              <div className="w-full py-2 flex-row gap-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedCustomers}
                  size="small"
                  freeSolo
                  className="w-[92%]"
                  value={customer}
                  onChange={customerOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Customer" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Amount"
                  variant="outlined"
                  className="w-[45%]"
                  value={totalAmount}
                  type={"number"}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedPaymentTypes}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={payment}
                  onChange={paymentOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Payment Method" />
                  )}
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

export default AddDayCashBook;
