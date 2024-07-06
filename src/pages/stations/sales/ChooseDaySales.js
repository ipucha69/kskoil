import React, { useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import moment from "moment";
import { Autocomplete, Box, TextField } from "@mui/material";
import DaySales from "./DaySales";
import DaySalesTwoPrice from "./DaySalesTwoPrice";

const style = {
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const ChooseDaySales = () => {
  const [open, setOpen] = useState(true);
  const [saleType, setSaleType] = useState({ id: 1, label: "One Price" });

  const dispatch = useDispatch();
  const { stationID } = useParams();

  useEffect(() => {}, [dispatch, stationID]);

  useEffect(() => {
    if (!saleType) {
      setSaleType({ id: 1, label: "One Price" });
    }
  }, [saleType]);

  const sortedSaleTypes = [
    { id: 1, label: "One Price" },
    { id: 2, label: "Two Price" },
  ];

  const saleTypeOnChange = (e, value) => {
    setSaleType(value);
  };

  return (
    <div className="">
      <div className="w-full py-2 flex-row gap-2 flex justify-end">
        <Autocomplete
          id="combo-box-demo"
          options={sortedSaleTypes}
          size="small"
          freeSolo
          className="w-[20%]"
          value={saleType}
          onChange={saleTypeOnChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Sale Type" />
          )}
        />
      </div>
      {saleType?.id === 2 ? <DaySalesTwoPrice /> : <DaySales />}
    </div>
  );
};

export default ChooseDaySales;
