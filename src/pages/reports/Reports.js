import React, { useState } from "react";
import dev from "../../assets/images/dev.gif";
import risk from "../../assets/images/risk.gif";
import chart_board from "../../assets/images/chart_board.gif";
import finanalytics from "../../assets/images/finanalytics.gif";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { colors } from "../../assets/utils/colors";

const style = {
    width: 500,
    height: 250,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

const Reports = () => {
    const [report, setReport] = useState();
    const [loading, setLoading] = useState(false);

    const reportNames = [
        { label: "Trial report", id: 1 },
        { label: "Majaribio", id: 2 },
    ];

    const reportOnChange = (e, value) => {
        setReport(value?.label);
    };

    const renderButton = () => {
        if (loading) {
        return (
            <>
            <Button
                size="large"
                variant="contained"
                className="w-[90%] cursor-not-allowed"
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
                className="w-[90%]"
                sx={{
                background: `${colors.primary}`,
                "&:hover": {
                    background: `${colors.bgColor6}`,
                },
                }}
                // onClick={(e) => saveDebtor(e)}
            >
                GENERATE REPORT
            </Button>
            </>
        );
        }
    };

    return (
        <div className="px-4 py-2">
        <h4 className="text-2xl text-center py-1">
            FINANCIAL AND ANALYTICAL REPORTS
        </h4>
        <div className="w-full flex flex-row gap-2">
            <div className="w-[40%] h-full">
            <img
                src={`${dev}`}
                alt={"reports image"}
                className="h-[300px] pt-8"
                loading="lazy"
            />
            </div>
            <div className="w-[60%] flex justify-center items-center">
            <Box sx={style} className="rounded-md mt-10">
                <div className="w-full py-2 flex justify-center">
                <Autocomplete
                    id="combo-box-demo"
                    options={reportNames}
                    size="small"
                    className="w-[90%]"
                    value={report}
                    onChange={reportOnChange}
                    renderInput={(params) => (
                    <TextField {...params} label="Select Report Name" />
                    )}
                />
                </div>
                <div className="w-full py-2 pt-12 flex justify-center">
                {renderButton()}
                </div>
            </Box>
            </div>
        </div>
        </div>
    );
};

export default Reports;
