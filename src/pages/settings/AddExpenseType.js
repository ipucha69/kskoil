import React, { useState } from "react";
import { db } from "../../App";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { addExpenseTypes } from "../../features/settingSlice";
import { toast } from "react-hot-toast";
import { colors } from "../../assets/utils/colors";
import { selectUserInfo } from "../../features/userSlice";

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

const AddExpenseType = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector(selectUserInfo);

  const getTypes = async () => {
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

  const expenseTypeRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter expense type");
    } else {
      //start registration
      setLoading(true);
      try {
        // Add a new document with a generated id
        const dataRef = doc(collection(db, "expenseTypes"));
        await setDoc(dataRef, {
          name,
          description,
          id: dataRef.id,
          created_at: Timestamp.fromDate(new Date()),
          created_by: {name: user?.name, role: user?.role},
          updated_at: Timestamp.fromDate(new Date()),
          updated_by: {name: user?.name, role: user?.role}
        })
          .then(() => {
            setName("");
            setDescription("");
            getTypes();
            toast.success("Expense type is saved successfully");
            setLoading(false);
          })
          .catch((error) => {
            // console.error("Error removing document: ", error.message);
            toast.error(error.message);
            setLoading(false);
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
            onClick={(e) => expenseTypeRegistration(e)}
          >
            SAVE EXPENSE TYPE
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
        <Add className="mt-2 py-0.5" /> <p className="py-2">Create Expense Type</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add Expense Type</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Type Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

export default AddExpenseType;
