import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useParams } from "react-router-dom";
import { addCustomers, selectCustomers } from "../../../features/customerSlice";
import {
  addDayDebtors,
  addDaySale,
  selectDayDebtors,
  selectDaySale,
} from "../../../features/saleSlice";
import { selectUserInfo } from "../../../features/userSlice";
import { Edit } from "@mui/icons-material";

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

const EditDayDebtor = ({ debtor }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [customer, setCustomer] = useState({
    id: debtor?.customerID,
    label: debtor?.customerName,
  });
  const [quantity, setQuantity] = useState(debtor?.quantity);
  const [price, setPrice] = useState(debtor?.customerPrice);
  const [stationPrice, setStationPrice] = useState(debtor?.stationPrice);
  const [totalAmount, setTotalAmount] = useState(debtor?.totalAmount);
  const [fuel, setFuel] = useState(debtor?.fuel);
  const [truck, setTruck] = useState(debtor?.truck);
  const [description, setDescription] = useState(debtor?.description);
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

      const querySnapshot = await getDocs(collection(db, "customerBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        customersArray.push(data);
      });

      if (customersArray.length > 0) {
        dispatch(addCustomers(customersArray));
      }
    };

    getCustomers();
    getSales();
  }, [dispatch, stationID]);

  const customers = useSelector(selectCustomers);
  const sales = useSelector(selectDaySale);
  const debtors = useSelector(selectDayDebtors);
  const user = useSelector(selectUserInfo);

  useEffect(() => {
    getTotal();
  }, [quantity, price]);

  useEffect(() => {
    setPriceValue();
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

  const getTotal = () => {
    let total = quantity * price;
    setTotalAmount(total);
  };

  const setPriceValue = () => {
    if (customer && fuel === "AGO") {
      setPrice(customer?.value?.agoPrice || sales?.agoPrice);
      setStationPrice(sales?.agoPrice);
    } else if (fuel === "PMS") {
      setPrice(customer?.value?.pmsPrice || sales?.pmsPrice);
      setStationPrice(sales?.pmsPrice);
    }
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

  const quantityDiff = parseInt(quantity) - debtor?.quantity;

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
    } else if (fuel === "AGO" && quantityDiff > agoDiff) {
      toast.error(`Sorry! Quantity must not exceed ${debtor?.quantity} AGO Litres`);
    } else if (fuel === "PMS" && quantityDiff > pmsDiff) {
      toast.error(`Sorry! Quantity must not exceed ${debtor?.quantity} PMS Litres`);
    } else {
      //start registration
      setLoading(true);
      try {
        // Edit debtor
        const editDebtor = httpsCallable(functions, "updateDebtor");
        editDebtor({
          quantity,
          quantityDiff,
          customerName: customer?.label,
          customerID: customer?.id,
          customerPrice: price,
          stationPrice,
          totalAmount,
          fuel,
          stationID,
          truck,
          description,
          id: debtor?.id,
          debtor,
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            setLoading(false);

            toast.success(data.message);
            //fetch data
            getSales();
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
            onClick={(e) => saveDebtor(e)}
          >
            EDIT DAY DEBTOR DETAILS
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
            <h3 className="text-center text-xl py-4">Edit Debtor Details</h3>
            <div>
              <div className="w-full py-2 flex-row gap-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedCustomers}
                  size="small"
                  className="w-[40%]"
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
                  className="w-[40%]"
                  value={truck}
                  onChange={(e) => setTruck(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex-row gap-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={fuelTypes}
                  size="small"
                  className="w-[40%]"
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
                  className="w-[40%]"
                  type={"number"}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex-row gap-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Price Per Litre"
                  variant="outlined"
                  className="w-[40%]"
                  value={price}
                  type={"number"}
                  // onChange={(e) => setPrice(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Amount"
                  variant="outlined"
                  className="w-[40%]"
                  value={totalAmount}
                  type={"number"}
                  // onChange={(e) => setTotalAmount(e.target.value)}
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

export default EditDayDebtor;
