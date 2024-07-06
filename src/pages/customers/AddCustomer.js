import React, { useState } from "react";
import { db } from "../../App";
import { collection, getDocs, query, where } from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../assets/utils/colors";
import { addCustomers } from "../../features/customerSlice";
import { selectUserInfo } from "../../features/userSlice";
import { getFunctions, httpsCallable } from "firebase/functions";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddCustomer = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const functions = getFunctions();

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

  const user = useSelector(selectUserInfo);

  const customerRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter customer name");
    } else {
      //start registration
      setLoading(true);

      //create customer
      const addCustomer = httpsCallable(functions, "createCustomer");
      addCustomer({
        name,
        phone,
        description,
        openingBalance: balance ? parseInt(balance) : 0,
        status: true,
        privateStatus: false,
        created_by: { name: user?.name, role: user?.role },
        updated_by: { name: user?.name, role: user?.role },
      })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          setLoading(false);
          setName("");
          setPhone("");
          setDescription("");
          setBalance("");

          toast.success(data.message);
          //fetch customers
          getCustomers();
        })
        .catch((error) => {
          const message = error.message;
          setLoading(false);
          toast.error(message);
        });
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
            onClick={(e) => customerRegistration(e)}
          >
            SAVE CUSTOMER
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
        <p className="py-2">Create New Customer</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Customer</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Customer Name"
                  variant="outlined"
                  className="w-[92%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Phone Number"
                  variant="outlined"
                  className="w-[45%]"
                  value={phone}
                  type={"number"}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Opening Balance"
                  variant="outlined"
                  className="w-[45%]"
                  value={balance}
                  type={"number"}
                  onChange={(e) => setBalance(e.target.value)}
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

export default AddCustomer;
