import React, { useState } from "react";
import { db } from "../../App";
import { Timestamp, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Edit from "@mui/icons-material/Edit";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { addRoles } from "../../features/settingSlice";
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

const EditRole = ({ role }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState(role?.name);
  const [description, setDescription] = useState(role?.description);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector(selectUserInfo);

  const getRoles = async () => {
    let rolesArray = [];

    const querySnapshot = await getDocs(collection(db, "roles"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      rolesArray.push(data);
    });

    if (rolesArray.length > 0) {
      dispatch(addRoles(rolesArray));
    }
  };

  const roleRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter role name");
    } else {
      //start registration
      setLoading(true);
      try {
        const dataRef = doc(db, "roles", role?.id);
        //
        await updateDoc(dataRef, {
          name,
          description,
          updated_at: Timestamp.fromDate(new Date()),
          updated_by: {name: user?.name, role: user?.role}
        })
          .then(() => {
            toast.success("User role is updated successfully");
            getRoles();
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
            onClick={(e) => roleRegistration(e)}
          >
            EDIT USER ROLE
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
            <h3 className="text-center text-xl py-4">Edit User Role</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Role Name"
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

export default EditRole;
