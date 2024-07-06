import React, { useState } from "react";
import { db } from "../../App";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../assets/utils/colors";
import { addSuppliers } from "../../features/supplierSlice";
import { Edit } from "@mui/icons-material";
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

const EditSupplier = ({ supplier }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState(supplier?.name);
  const [phone, setPhone] = useState(supplier?.phone);
  const [balance, setBalance] = useState(supplier?.openingBalance);
  const [description, setDescription] = useState(supplier?.description);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const functions = getFunctions();

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
    }
  };

  const user = useSelector(selectUserInfo);

  const supplierRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter supplier name");
    } else {
      //start registration
      setLoading(true);
      try {
         //update supplier
      const editSupplier = httpsCallable(functions, "updateSupplier");
      editSupplier({
        name,
        phone,
        description,
        openingBalance: balance ? parseInt(balance) : 0,
        id: supplier?.id,
        updated_by: { name: user?.name, role: user?.role },
      })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          setLoading(false);

          toast.success(data.message);
          //fetch suppliers
          getSuppliers();
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
            onClick={(e) => supplierRegistration(e)}
          >
            EDIT SUPPLIER
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
            <h3 className="text-center text-xl py-4">Edit Supplier Details</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Supplier Name"
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

export default EditSupplier;
