import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { addStationExpenses } from "../../../features/stationSlice";
import { selectUserInfo } from "../../../features/userSlice";
import { useParams } from "react-router-dom";
import { Autocomplete, Button } from "@mui/material";
import {
  addExpenseTypes,
  addPumpTypes,
  selectExpenseTypes,
  selectPumpTypes,
} from "../../../features/settingSlice";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  addDayExpenses,
  addDaySale,
  selectDaySale,
} from "../../../features/saleSlice";

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

const AddStationExpense = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [expense, setExpense] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [fuel, setFuel] = useState("");
  const [amount, setAmount] = useState("");
  const [litres, setLitres] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();

  const user = useSelector(selectUserInfo);

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
          const expenses = data?.data?.expenses;
          // console.log(sales);
          dispatch(addDaySale(sales));
          dispatch(addDayExpenses(expenses));
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getExpenseTypes = async () => {
      let typesArray = [];

      const querySnapshot = await getDocs(collection(db, "expenseTypes"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        typesArray.push(data);
      });

      if (typesArray.length > 0) {
        dispatch(addExpenseTypes(typesArray));
      }
    };

    const getFuelTypes = async () => {
      let typesArray = [];

      const querySnapshot = await getDocs(collection(db, "pumpTypes"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        typesArray.push(data);
      });

      if (typesArray.length > 0) {
        dispatch(addPumpTypes(typesArray));
      }
    };

    getExpenseTypes();
    getFuelTypes();
  }, [dispatch]);

  const expenses = useSelector(selectExpenseTypes);
  const sales = useSelector(selectDaySale);
  const fuelTypes = useSelector(selectPumpTypes);

  useEffect(() => {
    if (fuel && litres && sales) {
      if (fuel?.label === "AGO") {
        const total = parseInt(litres) * sales?.agoPrice;
        setAmount(total);
      } else {
        const total = parseInt(litres) * sales?.pmsPrice;
        setAmount(total);
      }
    }
  }, [sales, fuel, litres]);

  const sortedExpenses = expenses.map((expense) => ({
    id: expense.id,
    label: expense.name,
  }));

  const expenseOnChange = (e, value) => {
    setExpense(value);
  };

  const sortedFuelTypes = fuelTypes.map((fuel) => ({
    id: fuel.id,
    label: fuel.name,
  }));

  const fuelTypeOnChange = (e, value) => {
    setFuel(value);
  };

  const sortedExpenseTypes = [
    {
      id: "direct",
      label: "Direct",
    },
    {
      id: "indirect",
      label: "Indirect",
    },
  ];

  const expenseTypeOnChange = (e, value) => {
    setExpenseType(value);
  };

  const expenseRegistration = async (e) => {
    e.preventDefault();

    if (!expenseType) {
      toast.error("Please select expense type");
    } else if (!expense) {
      toast.error("Please select expense");
    } else if (expense?.label?.toLowerCase() === "fuel" && !fuel) {
      toast.error("Please select fuel type");
    } else if (expense?.label?.toLowerCase() === "fuel" && !litres) {
      toast.error("Please enter total litres");
    } else if (!amount) {
      toast.error("Please enter total amount");
    } else {
      //start registration
      setLoading(true);
      try {
        const newExpense = httpsCallable(functions, "createExpense");
        newExpense({
          expenseName: expense?.label,
          expenseID: expense?.id,
          amount: parseInt(amount),
          expenseType: expenseType?.id,
          fuel: fuel?.label,
          fuelID: fuel?.id,
          litres,
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
            setLoading(false);
            if (data?.status < 400) {
              setAmount("");
              setExpense("");
              setExpenseType("");
              setFuel("");
              setLitres("");
              setDescription("");

              toast.success(data.message);
              //fetch data
              getSales();
            } else {
              toast.error(data.message);
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
            onClick={(e) => expenseRegistration(e)}
          >
            SAVE EXPENSE
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-8 w-56 bg-primaryColor cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <Add className="mt-1 py-0.5" />{" "}
        <p className="py-1">Create New Expense</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Expense</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedExpenseTypes}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={expenseType}
                  onChange={expenseTypeOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Expense Type" />
                  )}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedExpenses}
                  size="small"
                  freeSolo
                  className="w-[45%]"
                  value={expense}
                  onChange={expenseOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Expense" />
                  )}
                />
              </div>
              {expense?.label?.toLowerCase() === "fuel" ? (
                <div className="w-full py-2 flex flex-row gap-2 justify-center">
                  <Autocomplete
                    id="combo-box-demo"
                    options={sortedFuelTypes}
                    size="small"
                    freeSolo
                    className="w-[45%]"
                    value={fuel}
                    onChange={fuelTypeOnChange}
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
                    value={litres}
                    type={"number"}
                    onChange={(e) => setLitres(e.target.value)}
                  />
                </div>
              ) : null}
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Amount"
                  variant="outlined"
                  className="w-[92%]"
                  value={amount}
                  type={"number"}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
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

export default AddStationExpense;
