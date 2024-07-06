import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Login from "./pages/auth/Login";
import AppRoutes from "./routes/App.routes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { primaryTheme } from "./assets/utils/themes";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addUserInfo } from "./features/userSlice";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const Apps = () => {
    const [user, setUser] = useState(true);

    const dispatch = useDispatch();
  
    useEffect(() => {
        //check user state
        onAuthStateChanged(auth, (user) => {
            if (user) {
            setUser(true);
            //store user info
            getUserInfo({ id: user?.uid });
            } else {
            setUser(false);
            }
        });
    });
  
    const getUserInfo = async ({ id }) => {
        const docRef = doc(db, "userBucket", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            dispatch(addUserInfo(data));
        }
    };
  
    const renderComponent = () => {
      switch (user) {
        case true:
            return (
                <React.Fragment>
                    <ThemeProvider theme={primaryTheme}>
                        <CssBaseline />
                        <AppRoutes />
                    </ThemeProvider>
                </React.Fragment>
            );
        case false:
            return (
                <React.Fragment>
                    <ThemeProvider theme={primaryTheme}>
                        <CssBaseline />
                        <Login />
                    </ThemeProvider>
                </React.Fragment>
            );
        default:
          return (
            <div>
                <Backdrop
                    sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    // open={open}
                    // onClick={handleClose}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            </div>
          );
      }
    };
  
    // console.log(user);
  
    return (
        <div>
            <>
            <Toaster />
            </>
            {renderComponent()}
        </div>
    );
}

export default Apps