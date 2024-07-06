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
  addCreditCustomers,
  addDayDebtors,
  addDaySale,
  selectCreditCustomers,
  selectDayDebtors,
  selectDaySale,
} from "../../../features/saleSlice";
import { selectUserInfo } from "../../../features/userSlice";

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

const AddDayDebtor = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [customer, setCustomer] = useState();
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [customerPrice, setCustomerPrice] = useState(0);
  const [ewuraPrice, setEwuraPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customerTotalAmount, setCustomerTotalAmount] = useState(0);
  const [fuel, setFuel] = useState("");
  const [truck, setTruck] = useState("");
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
          const debtors = data?.data?.debtors;
          // console.log(sales);
          dispatch(addDaySale(sales));
          dispatch(addDayDebtors(debtors));
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
        dispatch(addCreditCustomers(customersArray));
      } else {
        dispatch(addCreditCustomers([]));
      }
    };

    getCustomers();
    getSales();
  }, [dispatch, stationID]);

  const customers = useSelector(selectCreditCustomers);
  const sales = useSelector(selectDaySale);
  const debtors = useSelector(selectDayDebtors);
  const user = useSelector(selectUserInfo);

  useEffect(() => {
    if (quantity && price) {
      let total = quantity * price;
      setTotalAmount(total);
    }
  }, [quantity, price]);

  useEffect(() => {
    if (quantity && customerPrice) {
      let total = quantity * customerPrice;
      setCustomerTotalAmount(total);
    }
  }, [quantity, customerPrice]);

  useEffect(() => {
    if (fuel === "AGO") {
      setPrice(sales?.agoPrice);
    } else if (fuel === "PMS") {
      setPrice(sales?.pmsPrice);
    }
  }, [fuel, customer, sales]);

  const sortedCustomers = customers.map((customer) => ({
    id: customer.id,
    label: customer.name,
    value: customer,
  }));

  const customerOnChange = (e, value) => {
    setCustomer(value);
  };

  const fuelOnChange = (e, value) => {
    setFuel(value?.label);
  };

  const fuelTypes = [
    { label: "AGO", id: 1 },
    { label: "PMS", id: 2 },
  ];

  const agoDebt = sales?.agoTotal - sales?.agoCash;
  const pmsDebt = sales?.pmsTotal - sales?.pmsCash;
  const agoLitres = agoDebt / parseInt(sales?.agoPrice);
  const pmsLitres = pmsDebt / parseInt(sales?.pmsPrice);

  const agoQuantity = debtors.reduce((sum, debt) => {
    if (debt?.fuel === "AGO") {
      return sum + debt.quantity;
    } else {
      return sum;
    }
  }, 0);

  const pmsQuantity = debtors.reduce((sum, debt) => {
    if (debt?.fuel === "PMS") {
      return sum + debt.quantity;
    } else {
      return sum;
    }
  }, 0);

  let agoDiff = (agoLitres - agoQuantity).toFixed(2);
  let pmsDiff = (pmsLitres - pmsQuantity).toFixed(2);
  // Remove decimal places if they are .00
  if (agoDiff.includes(".00")) {
    agoDiff = agoDiff.replace(".00", "");
  }

  if (pmsDiff.includes(".00")) {
    pmsDiff = pmsDiff.replace(".00", "");
  }

  const saveDebtor = async (e) => {
    e.preventDefault();

    if (!customer) {
      toast.error("Please select customer");
    } else if (!price) {
      toast.error("Please enter price per litre");
    } else if (!fuel) {
      toast.error("Please select fuel type");
    } else if (!quantity) {
      toast.error("Please enter total litres");
    } else if (totalAmount < 1) {
      toast.error("Please enter total litres and price");
    } else if (fuel === "AGO" && quantity > agoDiff) {
      toast.error(`Sorry! Quantity must not exceed ${agoDiff} AGO Litres`);
    } else if (fuel === "PMS" && quantity > pmsDiff) {
      toast.error(`Sorry! Quantity must not exceed ${pmsDiff} PMS Litres`);
    } else {
      //start registration
      setLoading(true);
      try {
        // Add debtor
        const newDebtor = httpsCallable(functions, "createDebtor");
        newDebtor({
          quantity,
          customerName: customer?.label,
          customerID: customer?.id,
          customerPrice,
          ewuraPrice,
          stationPrice: price,
          totalAmount,
          customerDebt: customerTotalAmount,
          fuel,
          stationID,
          truck,
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
              setFuel("");
              setTruck("");
              setPrice(0);
              setCustomerPrice(0);
              setEwuraPrice(0);
              setQuantity(0);
              setTotalAmount(0);
              setCustomerTotalAmount(0);
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
            SAVE DAY DEBTOR DETAILS
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
        <p className="py-1 text-white">Create Debtor</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add Debtor Details</h3>
            <div>
              <div className="w-full py-2 flex-row gap-2 flex justify-center">
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
              <div className="w-full py-2 flex-row gap-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={fuelTypes}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={fuel}
                  onChange={fuelOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Fuel Type" />
                  )}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Litres"
                  variant="outlined"
                  className="w-[45%]"
                  type={"number"}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex-row gap-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Station Price"
                  variant="outlined"
                  className="w-[30%]"
                  value={price}
                  type={"number"}
                  // onChange={(e) => setPrice(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Customer Price"
                  variant="outlined"
                  className="w-[30%]"
                  value={customerPrice}
                  type={"number"}
                  onChange={(e) => setCustomerPrice(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Ewura Price"
                  variant="outlined"
                  className="w-[30%]"
                  value={ewuraPrice}
                  type={"number"}
                  onChange={(e) => setEwuraPrice(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Station Total Debt"
                  variant="outlined"
                  className="w-[45%]"
                  value={totalAmount}
                  type={"number"}
                  // onChange={(e) => setTotalAmount(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Customer Total Debt"
                  variant="outlined"
                  className="w-[45%]"
                  value={customerTotalAmount}
                  type={"number"}
                  // onChange={(e) => setTotalAmount(e.target.value)}
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

export default AddDayDebtor;
