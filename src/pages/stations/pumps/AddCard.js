import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { colors } from "../../../assets/utils/colors";
import { selectUserInfo } from "../../../features/userSlice";
import { useParams } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { SwapHoriz } from "@mui/icons-material";

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

const AddCard = ({ pump, day }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [oldCardCM, setOldCard] = useState("");
  const [newCardCM, setNewCard] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { stationID } = useParams();
  const functions = getFunctions();

  const user = useSelector(selectUserInfo);

  const pumpRegistration = async (e) => {
    e.preventDefault();

    if (!oldCardCM) {
      toast.error("Please enter old card CM");
    } else if (!newCardCM) {
      toast.error("Please enter new card CM");
    } else {
      //start registration
      setLoading(true);
      try {
        //create new pupm
        const newPump = httpsCallable(functions, "createPumpCard");
        newPump({
          oldCardCM: parseInt(oldCardCM),
          newCardCM: parseInt(newCardCM),
          description,
          stationID,
          pumpID: pump?.pumpID,
          pump,
          day,
          created_by: { name: user?.name, role: user?.role },
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            if (data?.status < 400) {
              setOldCard("");
              setNewCard("");
              setDescription("");

              toast.success(data.message);
            } else {
              toast.error(data.message);
            }
            setLoading(false);
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
            onClick={(e) => pumpRegistration(e)}
          >
            CHANGE PUMP CARD
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-38 bg-primaryColor cursor-pointer rounded-xl flex flex-row gap-1 justify-center text-white"
      >
        <SwapHoriz className="mt-2 py-0.5" /> <p className="py-2">New Card</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">
              Change Card For {pump?.typeName} Pump {pump?.name}
            </h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Old Card CM"
                  variant="outlined"
                  className="w-[45%]"
                  value={oldCardCM}
                  type={"number"}
                  onChange={(e) => setOldCard(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="New Card CM"
                  variant="outlined"
                  className="w-[45%]"
                  value={newCardCM}
                  type={"number"}
                  onChange={(e) => setNewCard(e.target.value)}
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

export default AddCard;
