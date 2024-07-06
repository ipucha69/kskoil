import React, { useState } from "react";
import { db } from "../../App";
import { Timestamp, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { addPaymentTypes } from "../../features/settingSlice";
import { toast } from "react-hot-toast";
import { Edit } from "@mui/icons-material";
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

const EditPaymentType = ({ payment }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState(payment?.name);
  const [description, setDescription] = useState(payment?.description);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector(selectUserInfo);

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

  const paymentTypeRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter payment type");
    } else {
      //start registration
      setLoading(true);
      try {
        // update
        const dataRef = doc(db, "paymentTypes", payment?.id);
        //
        await updateDoc(dataRef, {
          name,
          description,
          updated_at: Timestamp.fromDate(new Date()),
          updated_by: {name: user?.name, role: user?.role}
        })
          .then(() => {
            toast.success("Payment type is updated successfully");
            getTypes();
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
            onClick={(e) => paymentTypeRegistration(e)}
          >
            EDIT PAYMENT TYPE
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
            <h3 className="text-center text-xl py-4">Edit Payment Type</h3>
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

export default EditPaymentType;
