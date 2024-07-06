import * as React from "react";
import { auth } from "../App";
import { signOut } from "firebase/auth";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Logout from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Avatar, Box, Stack, styled } from "@mui/material";
import { colors } from "../assets/utils/colors";
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// ################# CONSTANT ###############
const drawerWidth = 65;
const date = moment().format("ddd, DD MMMM");

// ################# STYLED APPBAR ###############
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
    })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    boxShadow: "none",
    background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.bgColor3}) !important`,
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
        }),
    }),
    backgroundColor: colors.primary,
}));

    // ################# TOPBAR RIGHT ###############
    const TopbarRight = styled(Stack)({});

    // !###################### MAIN FUNC ############################

const SignOutButton = () => {
    const [isLoading, setIsLoading] = React.useState(false);

    const logout = () => {
        setIsLoading(true);

        signOut(auth)
        .then(() => {
            // Sign-out successful.
            toast.success("Logged Out");
            setIsLoading(false);
        })
        .catch((error) => {
            // An error happened.
            toast.error(error.message);
            setIsLoading(false);
        });
    };

    return (
        <div>
        <MenuItem
            onClick={(e) => {
            e.preventDefault();
            logout();
            }}
            disabled={isLoading}
        >
            {isLoading ? (
            <>
                <div className="flex items-center">
                <span>Logging out </span>
                <CircularProgress size={20} />
                </div>
            </>
            ) : (
            <>
                <ListItemIcon>
                <Logout fontSize="small" />
                </ListItemIcon>
                Logout
            </>
            )}
        </MenuItem>
        </div>
    );
    };

    const TopBar = ({ handleDrawerToggle }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const navigate = useNavigate();

    const user = auth?.currentUser;

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate(`/profile`);
    };

    return (
        <>
        <AppBar
            position="fixed"
            sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            // width: { sm: `calc(100% - ${drawerWidth}px)`, xs: "100%" },
            }}
        >
            <Toolbar
            sx={{
                justifyContent: "space-between",
            }}
            >
            <Box
                sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                }}
            >
                <IconButton
                onClick={handleDrawerToggle}
                sx={{
                    display: { xs: "block", sm: "none" },
                    marginTop: 1.3,
                }}
                >
                <MenuIcon className="text-slate-900 h-12 w-12" />
                </IconButton>
                <Typography
                noWrap
                component="div"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 18,
                    color: colors.primary,
                    fontWeight: "bold",
                    ml: 1,
                }}
                >
                FUEL FLOW MANAGER
                </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                sx={{
                    color: colors.primary,
                    fontSize: 14,
                    fontWeight: "bold",
                    display: { xs: "none", sm: "block" },
                }}
                >
                Welcome! {user?.displayName}
                </Typography>
            </Box>
            <TopbarRight
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={3}
            >
                <Typography
                sx={{
                    fontSize: 13,
                    color: colors.primary,
                    fontWeight: "bold",
                    display: { xs: "none", sm: "block" },
                }}
                >
                {date}
                </Typography>
                <Avatar
                sx={{ border: `1px solid ${colors.bgColor2}` }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                className="cursor-pointer"
                onClick={handleClick}
                />
                <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                    },
                    "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                    },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                    <MenuItem onClick={handleProfile}>
                        <Avatar /> Profile
                    </MenuItem>
                    <Divider />
                    <SignOutButton />
                </Menu>
            </TopbarRight>
            </Toolbar>
        </AppBar>
        </>
    );
};

export default TopBar;
