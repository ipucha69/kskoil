import React, { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../App";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { addRoles, selectRoles } from "../../features/settingSlice";
import { addUsers, selectUserInfo } from "../../features/userSlice";
import toast from "react-hot-toast";
import { Edit } from "@mui/icons-material";
import { colors } from "../../assets/utils/colors";

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

const EditUser = ({ user }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState(user?.name);
  const [role, setRole] = useState({ id: user?.roleID, label: user?.role });
  const [email, setEmail] = useState(user?.email);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const functions = getFunctions();

  useEffect(() => {
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

    getRoles();
  }, [dispatch]);

    const getUsers = async () => {
        let usersArray = [];

        const querySnapshot = await getDocs(collection(db, "userBucket"));
        querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        usersArray.push(data);
        });

        if (usersArray.length > 0) {
        dispatch(addUsers(usersArray));
        }
    };

    const roles = useSelector(selectRoles);
    const userInfo = useSelector(selectUserInfo);

    const sortedRoles = roles.map((role) => ({
        id: role.id,
        label: role.name,
    }));

    const roleOnChange = (e, value) => {
        setRole(value);
    };

    const userRegistration = async (e) => {
        e.preventDefault();

        if (!name) {
            toast.error("Please enter full name");
        } else if (!email) {
            toast.error("Please enter email");
        } else if (!role) {
            toast.error("Please select role");
        } else {
        //start registration
        setLoading(true);

        const updated_at = Timestamp.fromDate(new Date());

        //update user
        const editUser = httpsCallable(functions, "updateUser");
        editUser({
            email,
            role: role?.label,
            roleID: role?.id,
            name,
            userID: user?.userID,
            status: user?.status,
            disabled: !user?.status,
            updated_at,
            updated_by: {name: userInfo?.name, role: userInfo?.role},
        })
            .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            setLoading(false);

            toast.success(data.message);
            //fetch users
            getUsers();
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
                    EDIT USER
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
                <h3 className="text-center text-xl py-4">Edit User Details</h3>
                <div>
                <div className="w-full py-2 flex justify-center">
                    <TextField
                    size="small"
                    id="outlined-basic"
                    label="Name"
                    variant="outlined"
                    className="w-[82%]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="w-full py-2 flex flex-row gap-2 justify-center">
                    <TextField
                    id="outlined-basic"
                    label="Email"
                    size="small"
                    variant="outlined"
                    className="w-[40%]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <Autocomplete
                    id="combo-box-demo"
                    options={sortedRoles}
                    size="small"
                    freeSolo
                    className="w-[40%]"
                    value={role}
                    onChange={roleOnChange}
                    renderInput={(params) => (
                        <TextField {...params} label="Select user role" />
                    )}
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

export default EditUser;
