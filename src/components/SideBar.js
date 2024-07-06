import * as React from "react";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import { colors } from "../assets/utils/colors";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import {
  Window,
  Settings,
  GroupAdd,
  Groups,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { GiGasPump } from "react-icons/gi";
import { GrStorage } from "react-icons/gr";
import { TbReport } from "react-icons/tb";
import { selectUserInfo } from "../features/userSlice";
import Skeleton from "@mui/material/Skeleton";

const drawerWidth = 220;

//############# SideNavListItem #################
const SideNavListItem = styled(ListItem)(({ theme }) => ({
  paddingTop: 0,
  transition: "all ease-in-out 0.3s",
  "&::before": {
    content: '""',
    position: "absolute",
    height: 0,
    bottom: "50%",
    width: 4,
    transition: "all ease-in-out 0.3s",
    backgroundColor: colors.primary,
  },
  "&:hover": {
    // backgroundColor: colors.link,
  },
  "& .icon": {
    minWidth: 0,
    justifyContent: "center",
    color: colors.bgColor3,
    opacity: 0.9,
    fontSize: 33,
  },
  "& .name": {
    color: colors.bgColor3,
  },
}));

//! #################### MAIN FUNC ######################
const SideBar = ({ handleDrawerToggle }) => {
  const [open] = React.useState(false);

  const user = useSelector(selectUserInfo);

  // ################# LINKS ################
  const links = [
    {
      id: 1,
      name: "Dashboard",
      icon: <Window className="icon" />,
      url: "/",
      tooltip: "Dashboard",
    },
    {
      id: 2,
      name: "Accounts",
      icon: <AccountBalanceWallet className="icon" />,
      url: "/accounts",
      tooltip: "Accounts",
    },
    {
      id: 3,
      name: "Stations",
      icon: <GiGasPump className="icon" />,
      url: "/stations",
      tooltip: "STations",
    },
    {
      id: 4,
      name: "Customers",
      icon: <Groups className="icon" />,
      url: "/customers",
      tooltip: "Customers",
    },
    {
      id: 5,
      name: "Stock",
      icon: <GrStorage className="icon" />,
      url: "/stocks",
      tooltip: "Stock",
    },
    {
      id: 6,
      name: "Suppliers",
      icon: <Groups className="icon" />,
      url: "/suppliers",
      tooltip: "Suppliers",
    },
    {
      id: 7,
      name: "Users",
      icon: <GroupAdd className="icon" />,
      url: "/users",
      tooltip: "Users",
    },
    {
      id: 8,
      name: "Reports",
      icon: <TbReport className="icon" />,
      url: "/reports",
      tooltip: "Reports",
    },
    {
      id: 9,
      name: "Settings",
      icon: <Settings className="icon" />,
      url: "/settings",
      tooltip: "Settings",
    },
  ];

  const managerLinks = [
    {
      id: 1,
      name: "Dashboard",
      icon: <Window className="icon" />,
      url: "/",
      tooltip: "Dashboard",
    },
    {
      id: 2,
      name: "Station",
      icon: <GiGasPump className="icon" />,
      url: "/station",
      tooltip: "Stations",
    },
    {
      id: 3,
      name: "Settings",
      icon: <Settings className="icon" />,
      url: "/station-setting",
      tooltip: "Settings",
    },
    {
      id: 4,
      name: "Reports",
      icon: <TbReport className="icon" />,
      url: "/station-reports",
      tooltip: "Reports",
    },
  ];

  const loadingLinks = [
    {
      id: 1,
      name: "Dashboard",
      icon: <Window className="icon" />,
      url: "/loading",
      tooltip: "Dashboard",
    },
  ];

  return (
    <>
      {/* ##################### desktop ################ */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            whiteSpace: "nowrap",
          },
          [`& .MuiPaper-root`]: { backgroundColor: colors.bgColor1 },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {user ? (
              <>
                {user?.role?.toLowerCase() === "manager" ? (
                  <>
                    {managerLinks?.map((link) => (
                      <NavLink to={link.url} key={link.id}>
                        {({ isActive }) => (
                          <SideNavListItem
                            disablePadding
                            sx={{
                              display: "block",
                              my: 2,
                              bgcolor: isActive && {
                                background: colors.primary,
                              },
                              "&:hover": !isActive && {
                                transition: "all ease-in-out 0.3s",
                                "&::before": {
                                  transition: "all ease-in-out 0.3s",
                                  height: "100%",
                                  bottom: 0,
                                },
                              },
                            }}
                          >
                            <ListItemButton
                              sx={{
                                py: 0.5,
                              }}
                            >
                              <ListItemIcon>{link.icon}</ListItemIcon>
                              <ListItemText
                                className="name"
                                primary={link.name}
                                primaryTypographyProps={{
                                  fontSize: 14,
                                }}
                              />
                            </ListItemButton>
                          </SideNavListItem>
                        )}
                      </NavLink>
                    ))}
                  </>
                ) : (
                  <>
                    {links?.map((link) => (
                      <NavLink
                        style={{ color: "inherit", textDecoration: "inherit" }}
                        to={link.url}
                        key={link.id}
                      >
                        {({ isActive }) => (
                          <SideNavListItem
                            disablePadding
                            sx={{
                              display: "block",
                              my: 2,
                              bgcolor: isActive && {
                                background: colors.primary,
                              },
                              "&:hover": !isActive && {
                                transition: "all ease-in-out 0.3s",
                                "&::before": {
                                  transition: "all ease-in-out 0.3s",
                                  height: "100%",
                                  bottom: 0,
                                },
                              },
                            }}
                          >
                            <ListItemButton
                              sx={{
                                py: 0.5,
                              }}
                            >
                              <ListItemIcon>{link.icon}</ListItemIcon>
                              <ListItemText
                                className="name"
                                primary={link.name}
                                primaryTypographyProps={{
                                  fontSize: 14,
                                }}
                              />
                            </ListItemButton>
                          </SideNavListItem>
                        )}
                      </NavLink>
                    ))}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="py-2">
                  <Skeleton variant="rectangular" width={210} height={40} />
                </div>
                <div className="py-2">
                  <Skeleton variant="rectangular" width={210} height={40} />
                </div>
                <div className="py-2">
                  <Skeleton variant="rectangular" width={210} height={40} />
                </div>
                <div className="py-2">
                  <Skeleton variant="rectangular" width={210} height={40} />
                </div>
                <div className="py-2">
                  <Skeleton variant="rectangular" width={210} height={40} />
                </div>
                <div className="py-2">
                  <Skeleton variant="rectangular" width={210} height={40} />
                </div>
                <div className="py-2">
                  <Skeleton variant="rectangular" width={210} height={40} />
                </div>
                <div className="py-2">
                  <Skeleton variant="rectangular" width={210} height={40} />
                </div>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default SideBar;
