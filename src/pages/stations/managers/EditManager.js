import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Edit } from "@mui/icons-material";
import { colors } from "../../../assets/utils/colors";
import { addStationManagers } from "../../../features/stationSlice";
import { useParams } from "react-router-dom";
import { selectUserInfo } from "../../../features/userSlice";

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

const EditManager = ({ manager }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const {stationID} = useParams();

  const [name, setName] = useState(manager?.name);
  const [email, setEmail] = useState(manager?.email);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const functions = getFunctions();

  const getManagers = async () => {
    let managersArray = [];

    const querySnapshot = await getDocs(collection(db, "stations", stationID, "managers"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      managersArray.push(data);
    });

    if (managersArray.length > 0) {
      dispatch(addStationManagers(managersArray));
    }
  };

  const user = useSelector(selectUserInfo);

  const userRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter manager name");
    } else if (!email) {
      toast.error("Please enter email");
    } else {
      //start registration
      setLoading(true);

      //update manager
      const editManager = httpsCallable(functions, "updateManager");
      editManager({
        email,
        name,
        userID: manager?.id,
        stationID,
        disabled: !manager?.status,
        status: manager?.status,
        updated_by: {name: user?.name, role: user?.role},
      })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          setLoading(false);

          toast.success(data.message);
          //fetch users
          getManagers();
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
            onClick={(e) => userRegistration(e)}
          >
            EDIT MANAGER
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
            <h3 className="text-center text-xl py-4">Edit Manager Details</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Manager Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-basic"
                  label="Email"
                  size="small"
                  variant="outlined"
                  className="w-[82%]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

export default EditManager;
