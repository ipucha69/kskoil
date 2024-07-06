import { createTheme } from "@mui/material";
import { colors } from "./colors";

export const primaryTheme = createTheme({
    palette: {
        primary: {
            main: colors.primary,
        },
        secondary: {
            main: colors.secondary,
        },
    },
});