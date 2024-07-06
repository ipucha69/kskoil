import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { selectUserInfo } from "../../../features/userSlice";
import { useParams } from "react-router-dom";
import { Autocomplete, Button, IconButton } from "@mui/material";
import {
  addExpenseTypes,
  selectExpenseTypes,
} from "../../../features/settingSlice";
import { Edit } from "@mui/icons-material";
import { getFunctions, httpsCallable } from "firebase/functions";
import { addDayExpenses } from "../../../features/saleSlice";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const EditStationExpense = ({ expense }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [expenseType, setExpense] = useState({
    id: expense?.expenseID,
    label: expense?.expenseName,
  });
  const [amount, setAmount] = useState(expense?.amount);
  const [description, setDescription] = useState(expense?.description);
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

    getExpenseTypes();
    getSales();
  }, [dispatch, stationID]);

  const expenses = useSelector(selectExpenseTypes);

  const sortedExpenses = expenses.map((expense) => ({
    id: expense.id,
    label: expense.name,
  }));

  const expenseOnChange = (e, value) => {
    setExpense(value);
  };

  const expenseRegistration = async (e) => {
    e.preventDefault();

    if (!expenseType) {
      toast.error("Please select expense type");
    } else if (!amount) {
      toast.error("Please enter total amount");
    } else {
      //start registration
      setLoading(true);

      const amountDiff = parseInt(amount) - expense?.amount;
      try {
        const editExpense = httpsCallable(functions, "updateExpense");
        editExpense({
          expenseName: expenseType?.label,
          expenseID: expenseType?.id,
          amount: parseInt(amount),
          amountDiff,
          stationID,
          description,
          id: expense?.id,
          dayBookID: expense?.dayBookID,
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
            onClick={(e) => expenseRegistration(e)}
          >
            EDIT EXPENSE
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
            <h3 className="text-center text-xl py-4">Edit Expense Details</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedExpenses}
                  size="small"
                  className="w-[82%]"
                  value={expenseType}
                  onChange={expenseOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Expense Type" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Amount"
                  variant="outlined"
                  className="w-[82%]"
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

export default EditStationExpense;
