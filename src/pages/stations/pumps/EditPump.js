import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import {
  collection,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { addPumpTypes, selectPumpTypes } from "../../../features/settingSlice";
import { addPumps } from "../../../features/stationSlice";
import { Edit } from "@mui/icons-material";

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

const EditPump = ({ pump }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [type, setType] = useState({ id: pump?.typeID, label: pump?.typeName });
  const [name, setName] = useState(pump?.name);
  const [om, setOM] = useState(pump?.om);
  const [description, setDescription] = useState(pump?.description);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

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
    } else if (!name) {
      toast.error("Please enter pump number");
    } else if (!om) {
      toast.error("Please enter o.m");
    } else {
      //start registration
      setLoading(true);
      try {
        // update
        const dataRef = doc(db, "pumpBucket", pump?.id);
        //
        await updateDoc(dataRef, {
          typeName: name?.label,
          typeID: name?.id,
          name,
          om,
          description,
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            //add data to station path
            addDataToStationPath({
              typeName: name?.label,
              typeID: name?.id,
              name,
              om,
              description,
            });
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

  const addDataToStationPath = async ({
    typeName,
    typeID,
    name,
    om,
    description,
  }) => {
    try {
      //
      const dataRef = doc(db, "stations", stationID, "pumps", pump?.id);
      await updateDoc(dataRef, {
        typeName,
        typeID,
        name,
        om,
        description,
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(() => {
          getPumps();
          setLoading(false);
          toast.success("Pump is updated successfully");
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
            EDIT PUMP
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
            <h3 className="text-center text-xl py-4">Edit Pump Details</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedPumpTypes}
                  size="small"
                  className="w-[82%]"
                  value={name}
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
                  label="Pump Name or Number"
                  variant="outlined"
                  className="w-[82%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

export default EditPump;
