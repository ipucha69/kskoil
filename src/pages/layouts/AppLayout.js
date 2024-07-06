import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TopBar from '../../components/TopBar';
import SideBar from '../../components/SideBar';
import { colors } from '../../assets/utils/colors';

const DrawerHeader = styled(Box)(({ theme }) => ({
    ...theme.mixins.toolbar,
}));

const AppLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                bottom: '100%',
                right: 0,
                left: 0,
            }}
            className="pt-6 w-screen md:w-full"
        >
            {/* ############### topbar ############### */}
            <TopBar
                handleDrawerToggle={handleDrawerToggle}
            />

            {/* ############### sidebar ###############*/}
            <SideBar />

            {/* ############### content ###############*/}
            <Box component="main" sx={{ bgcolor: colors.bgColor1, flexGrow: 1 }}>
                <DrawerHeader />
                {children}
            </Box>
        </Box>
    );
};

export default AppLayout;
