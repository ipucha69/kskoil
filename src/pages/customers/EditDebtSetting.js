import React, { useState } from "react";
import { db } from "../../App";
import {
  collection,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../assets/utils/colors";
import { selectUserInfo } from "../../features/userSlice";
import { useParams } from "react-router-dom";
import { Autocomplete, Button, IconButton } from "@mui/material";
import { addCustomerSettings } from "../../features/customerSlice";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { Edit } from "@mui/icons-material";

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

const EditDebtSetting = ({ debtSetting }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [target, setTarget] = useState({
    id: debtSetting?.targetID,
    label: debtSetting?.targetName,
  });
  const [amount, setAmount] = useState(debtSetting?.amount);
  const [deadline, setDeadline] = useState(
    debtSetting?.deadline ? moment.unix(debtSetting?.deadline?.seconds) : null
  );
  const [description, setDescription] = useState(debtSetting?.description);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { customerID } = useParams();

  const user = useSelector(selectUserInfo);

  const sortedTargets = [
    { id: 1, label: "Payment Deadline" },
    { id: 2, label: "Total Debt" },
  ];

  const targetOnChange = (e, value) => {
    setTarget(value);
  };

  const getDebtSettings = async () => {
    let settingsArray = [];

    const querySnapshot = await getDocs(
      collection(db, "customers", customerID, "settings")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      settingsArray.push(data);
    });

    if (settingsArray.length > 0) {
      dispatch(addCustomerSettings(settingsArray));
    } else {
      dispatch(addCustomerSettings(settingsArray));
    }
  };

  const settingRegistration = async (e) => {
    e.preventDefault();

    if (!target) {
      toast.error("Please select debt target");
    } else if (!amount) {
      toast.error("Please enter debt amount");
    } else if (target?.id === 1 && !deadline) {
      toast.error("Please select target deadline");
    } else {
      //start
      setLoading(true);
      try {
        //
        const dataRef = doc(
          collection(db, "customers", customerID, "settings", debtSetting?.id)
        );
        await updateDoc(dataRef, {
          targetID: target?.id,
          targetName: target?.label,
          targetAmount: amount,
          description,
          status: true,
          start: Timestamp.fromDate(new Date()),
          deadline: Timestamp.fromDate(new Date(deadline)),
          id: dataRef.id,
          customerID,
          updated_by: { name: user?.name, role: user?.role },
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            //add data to customer path
            addDataToCustomerPath();
          })
          .catch((error) => {
            // console.error("Error removing document: ", error.message);
            toast.error("Failed to update debt setting");
            setLoading(false);
          });
      } catch (error) {
        toast.error("Failed to update debt setting");
        setLoading(false);
      }
    }
  };

  const addDataToCustomerPath = async () => {
    try {
      // update prices
      const dataRef = doc(db, "customers", customerID, "account", "info");
      await updateDoc(dataRef, {
        setting: true,
        targetID: target?.id,
        targetName: target?.label,
        targetAmount: amount,
        start: Timestamp.fromDate(new Date()),
        deadline: Timestamp.fromDate(new Date(deadline)),
      })
        .then(() => {
          //add data to customer bucket path
          addDataToCustomerBucketPath();
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error("Failed to update debt setting");
          setLoading(false);
        });
    } catch (error) {
      toast.error("Failed to update debt setting");
      setLoading(false);
    }
  };

  const addDataToCustomerBucketPath = async () => {
    try {
      // update prices
      const dataRef = doc(db, "customerBucket", customerID);
      await updateDoc(dataRef, {
        setting: true,
        targetID: target?.id,
        targetName: target?.label,
        targetAmount: amount,
        start: Timestamp.fromDate(new Date()),
        deadline: Timestamp.fromDate(new Date(deadline)),
      })
        .then(() => {
          getDebtSettings();
          setLoading(false);
          toast.success("Debt setting is updated successfully");
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error("Failed to update debt setting");
          setLoading(false);
        });
    } catch (error) {
      toast.error("Failed to save update setting");
      setLoading(false);
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
            onClick={(e) => settingRegistration(e)}
          >
            EDIT DEBT SETTING
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
            <h3 className="text-center text-xl py-4">Edit Debt Setting</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedTargets}
                  size="small"
                  className="w-[82%]"
                  value={target}
                  onChange={targetOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Target" />
                  )}
                />
              </div>
              <div
                className={
                  target?.id === 1
                    ? "w-full py-2 flex flex-row gap-2 justify-center"
                    : "w-full py-2 flex justify-center"
                }
              >
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Amount"
                  variant="outlined"
                  className={target?.id === 1 ? "w-[40%]" : "w-[82%]"}
                  value={amount}
                  type={"number"}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {target?.id === 1 ? (
                  <LocalizationProvider
                    dateAdapter={AdapterMoment}
                    dateLibInstance={moment.utc}
                  >
                    <DatePicker
                      label="Select deadline"
                      value={deadline}
                      onChange={(newValue) => setDeadline(newValue)}
                      className="w-[40%]"
                      slotProps={{ textField: { size: "small" } }}
                    />
                  </LocalizationProvider>
                ) : null}
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

export default EditDebtSetting;
