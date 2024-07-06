import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { addPumpTypes, selectPumpTypes } from "../../../features/settingSlice";
import { addPumps } from "../../../features/stationSlice";
import { selectUserInfo } from "../../../features/userSlice";
import { useParams } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";

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

const AddPump = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [type, setType] = useState("");
  const [om, setOM] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();

  const user = useSelector(selectUserInfo);

  useEffect(() => {
    const getTypes = async () => {
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

    getTypes();
  }, [dispatch]);

  const pumpTypes = useSelector(selectPumpTypes);

  const sortedPumpTypes = pumpTypes.map((pumpType) => ({
    id: pumpType.id,
    label: pumpType.name,
  }));

  const pumpTypeOnChange = (e, value) => {
    setType(value);
  };

  const getPumps = async () => {
    let pumpsArray = [];

    const querySnapshot = await getDocs(collection(db, "pumpBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      pumpsArray.push(data);
    });

    if (pumpsArray.length > 0) {
      dispatch(addPumps(pumpsArray));
    }
  };

  const pumpRegistration = async (e) => {
    e.preventDefault();

    if (!type) {
      toast.error("Please select pump type");
    } else if (!om) {
      toast.error("Please enter o.m");
    } else {
      //start registration
      setLoading(true);
      try {
        //create new pupm
        const newPump = httpsCallable(functions, "createPump");
        newPump({
          typeName: type?.label,
          typeID: type?.id,
          description,
          om,
          stationID,
          created_by: { name: user?.name, role: user?.role },
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            setLoading(false);
            setType();
            setOM("");
            setDescription("");

            toast.success(data.message);
            //fetch pumps
            getPumps();
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
            onClick={(e) => pumpRegistration(e)}
          >
            SAVE PUMP
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-52 bg-primaryColor cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <Add className="mt-2 py-0.5" /> <p className="py-2">Create New Pump</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Pump</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedPumpTypes}
                  size="small"
                  className="w-[82%]"
                  value={type}
                  onChange={pumpTypeOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select pump type" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="O.M"
                  variant="outlined"
                  className="w-[82%]"
                  value={om}
                  type={"number"}
                  onChange={(e) => setOM(e.target.value)}
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

export default AddPump;
