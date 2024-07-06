import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import moment from "moment";
import { isEmpty } from "lodash";
import TextField from "@mui/material/TextField";
import { Alert, Button } from "@mui/material";
import {
  addDaySale,
  selectDaySale,
  addDayPumps,
  selectDayPumps,
} from "../../../features/saleSlice";
import { Box } from "@mui/material";
import { colors } from "../../../assets/utils/colors";
import toast from "react-hot-toast";
import { getFunctions, httpsCallable } from "firebase/functions";
import { selectUserInfo } from "../../../features/userSlice";
import AddCard from "../pumps/AddCard";
import EditCard from "../pumps/EditCard";

const style = {
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const DaySalesPriceTwo = () => {
  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();

  const [omValues, setOMValues] = useState({
    omAGO1: 0,
    omAGO2: 0,
    omAGO3: 0,
    omAGO4: 0,
    omPMS1: 0,
    omPMS2: 0,
    omPMS3: 0,
    omPMS4: 0,
  });

  const [cmValues, setCMValues] = useState({
    cmAGO1: 0,
    cmAGO2: 0,
    cmAGO3: 0,
    cmAGO4: 0,
    cmPMS1: 0,
    cmPMS2: 0,
    cmPMS3: 0,
    cmPMS4: 0,
  });

  const [omAGO1, setOMAGO1] = useState(0);
  const [omAGO2, setOMAGO2] = useState(0);
  const [omAGO3, setOMAGO3] = useState(0);
  const [omAGO4, setOMAGO4] = useState(0);
  const [cmAGO1, setCMAGO1] = useState(0);
  const [cmAGO2, setCMAGO2] = useState(0);
  const [cmAGO3, setCMAGO3] = useState(0);
  const [cmAGO4, setCMAGO4] = useState(0);
  const [omPMS1, setOMPMS1] = useState(0);
  const [omPMS2, setOMPMS2] = useState(0);
  const [omPMS3, setOMPMS3] = useState(0);
  const [omPMS4, setOMPMS4] = useState(0);
  const [cmPMS1, setCMPMS1] = useState(0);
  const [cmPMS2, setCMPMS2] = useState(0);
  const [cmPMS3, setCMPMS3] = useState(0);
  const [cmPMS4, setCMPMS4] = useState(0);
  const [agoTotalLitres, setAGOLitres] = useState(0);
  const [agoPrice, setAgoPrice] = useState(0);
  const [agoTotal, setAGOTotalAmount] = useState(0);
  const [pmsTotalLitres, setPMSLitres] = useState(0);
  const [pmsPrice, setPMSPrice] = useState(0);
  const [pmsTotal, setPMSTotalAmount] = useState(0);
  const [totalLitres, setTotalLitres] = useState(0);
  const [agoCash, setAgoCash] = useState(0);
  const [pmsCash, setPmsCash] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [description, setDescription] = useState("");
  const [skipped, setSkipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const getSales = async () => {
    try {
      //fetch day book
      setPageLoading(true);
      const daySalesBook = httpsCallable(functions, "fetchDayBook");
      daySalesBook({ stationID })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          //add day
          const sales = data?.data?.dayBook;
          const pumps = data?.data?.pumps;
          // console.log(data);
          console.log(sales);
          const skipped = data?.data?.skipped;
          // console.log(skipped);
          setSkipped(skipped);
          dispatch(addDaySale(sales));
          dispatch(addDayPumps(pumps));
          //
          //set initial values
          if (!isEmpty(sales)) {
            if (sales?.check) {
              //set all values
              // setCMAGO1(sales?.cmAGO1);
              // setCMAGO2(sales?.cmAGO2);
              // setCMAGO3(sales?.cmAGO3);
              // setCMAGO4(sales?.cmAGO4);
              // setCMPMS1(sales?.cmPMS1);
              // setCMPMS2(sales?.cmPMS2);
              // setCMPMS3(sales?.cmPMS3);
              // setCMPMS4(sales?.cmPMS4);
              // setOMAGO1(sales?.omAGO1);
              // setOMAGO2(sales?.omAGO2);
              // setOMAGO3(sales?.omAGO3);
              // setOMAGO4(sales?.omAGO4);
              // setOMPMS1(sales?.omPMS1);
              // setOMPMS2(sales?.omPMS2);
              // setOMPMS3(sales?.omPMS3);
              // setOMPMS4(sales?.omPMS4);
              setAgoPrice(sales?.agoPrice);
              setAGOLitres(sales?.agoTotalLitres);
              setAGOTotalAmount(sales?.agoTotal);
              setPMSPrice(sales?.pmsPrice);
              setPMSLitres(sales?.pmsTotalLitres);
              setPMSTotalAmount(sales?.pmsTotal);
              setTotalLitres(sales?.totalLitres);
              setAgoCash(sales?.agoCash);
              setPmsCash(sales?.pmsCash);
              setTotalCash(sales?.totalCash);
              setTotalSales(sales?.totalSales);
              setDescription(sales?.description);
            } else {
              console.log("data");
              //set initial values
              // setOMAGO1(sales?.omAGO1);
              // setOMAGO2(sales?.omAGO2);
              // setOMAGO3(sales?.omAGO3);
              // setOMAGO4(sales?.omAGO4);
              // setOMPMS1(sales?.omPMS1);
              // setOMPMS2(sales?.omPMS2);
              // setOMPMS3(sales?.omPMS3);
              // setOMPMS4(sales?.omPMS4);
              setAgoPrice(sales?.agoPrice);
              setPMSPrice(sales?.pmsPrice);
            }
          }
          setPageLoading(false);
        })
        .catch((error) => {
          const message = error.message;
          console.log(error);
          setPageLoading(false);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSales();
  }, [dispatch, stationID]);

  const sales = useSelector(selectDaySale);
  const pumps = useSelector(selectDayPumps);
  const user = useSelector(selectUserInfo);
  // console.log(sales);
  const momentDate = moment(sales?.day, "DD-MM-YYYY").format("ll");
  // console.log(momentDate);

  useEffect(() => {
    //calculate and set values
    if (
      cmAGO1 >= omAGO1 &&
      cmAGO2 >= omAGO2 &&
      cmAGO3 >= omAGO3 &&
      cmAGO4 >= omAGO4
    ) {
      getAgoLitres();
    }

    if (
      cmPMS1 >= omPMS1 &&
      cmPMS2 >= omPMS2 &&
      cmPMS3 >= omPMS3 &&
      cmPMS4 >= omPMS4
    ) {
      getPmsLitres();
    }
  }, [cmAGO1, cmAGO2, cmAGO3, cmAGO4, cmPMS1, cmPMS2, cmPMS3, cmPMS4]);

  useEffect(() => {
    //calculate and set values
    if (
      cmValues["cmAGO1"] >= omValues["omAGO1"] &&
      cmValues["cmAGO2"] >= omValues["omAGO2"] &&
      cmValues["cmAGO3"] >= omValues["omAGO3"] &&
      cmValues["cmAGO4"] >= omValues["omAGO4"]
    ) {
      const total =
        cmValues["cmAGO1"] -
        omValues["omAGO1"] +
        (cmValues["cmAGO2"] - omValues["omAGO2"]) +
        (cmValues["cmAGO3"] - omValues["omAGO3"]) +
        (cmValues["cmAGO4"] - omValues["omAGO4"]);

      // console.log(total);
      setAGOLitres(total);
    }

    if (
      cmValues["cmPMS1"] >= omValues["omPMS1"] &&
      cmValues["cmPMS2"] >= omValues["omPMS2"] &&
      cmValues["cmPMS3"] >= omValues["omPMS3"] &&
      cmValues["cmPMS4"] >= omValues["omPMS4"]
    ) {
      const total =
        cmValues["cmPMS1"] -
        omValues["omPMS1"] +
        (cmValues["cmPMS2"] - omValues["omPMS2"]) +
        (cmValues["cmPMS3"] - omValues["omPMS3"]) +
        (cmValues["cmPMS4"] - omValues["omPMS4"]);

      // console.log(total);
      setPMSLitres(total);
    }
  }, [cmValues, omValues]);

  useEffect(() => {
    getAgoAmount();
    getPmsAmount();
    const totalLitres = agoTotalLitres + pmsTotalLitres;
    setTotalLitres(totalLitres);
  }, [agoTotalLitres, pmsTotalLitres]);

  useEffect(() => {
    const total = parseInt(agoCash) + parseInt(pmsCash);
    setTotalCash(total);
  }, [agoCash, pmsCash]);

  useEffect(() => {
    const totalSales = agoTotal + pmsTotal;
    setTotalSales(totalSales);
  }, [agoTotal, pmsTotal]);

  // Update OM and CM values based on pump name
  useEffect(() => {
    pumps.forEach((pump) => {
      setOMValues((prevState) => ({
        ...prevState,
        [`om${pump.typeName}${pump.name}`]: pump.om,
      }));
      setCMValues((prevState) => ({
        ...prevState,
        [`cm${pump.typeName}${pump.name}`]: pump.cm,
      }));
    });
  }, [pumps]);

  // Handle change in OM value
  const handleOMChange = (value, pumpName, pumpType) => {
    setOMValues((prevState) => ({
      ...prevState,
      [`om${pumpType}${pumpName}`]: value,
    }));
  };

  // Handle change in CM value
  const handleCMChange = (value, pumpName, pumpType) => {
    setCMValues((prevState) => ({
      ...prevState,
      [`cm${pumpType}${pumpName}`]: value,
    }));
  };

  const getAgoLitres = () => {
    const total =
      cmAGO1 -
      omAGO1 +
      (cmAGO2 - omAGO2) +
      (cmAGO3 - omAGO3) +
      (cmAGO4 - omAGO4);

    // console.log(total);
    setAGOLitres(total);
  };

  const getPmsLitres = () => {
    const total =
      cmPMS1 -
      omPMS1 +
      (cmPMS2 - omPMS2) +
      (cmPMS3 - omPMS3) +
      (cmPMS4 - omPMS4);

    // console.log(total);
    setPMSLitres(total);
  };

  const getAgoAmount = () => {
    const total = agoTotalLitres * agoPrice;
    setAGOTotalAmount(total);
  };

  const getPmsAmount = () => {
    const total = pmsTotalLitres * pmsPrice;
    setPMSTotalAmount(total);
  };

  const saveDaySales = async (e) => {
    e.preventDefault();

    if (omValues["omAGO1"] < 0) {
      toast.error("Please enter OM for AGO 1");
    } else if (omValues["omAGO2"] < 0) {
      toast.error("Please enter OM for AGO 2");
    } else if (omValues["omAGO3"] < 0) {
      toast.error("Please enter OM for AGO 3");
    } else if (omValues["omAGO4"] < 0) {
      toast.error("Please enter OM for AGO 4");
    } else if (cmValues["cmAGO1"] < omValues["omAGO1"]) {
      toast.error("Please enter CM for AGO 1 and must be not less to OM");
    } else if (cmValues["cmAGO2"] < omValues["omAGO2"]) {
      toast.error("Please enter CM for AGO 2 and must be not less to OM");
    } else if (cmValues["cmAGO3"] < omValues["omAGO3"]) {
      toast.error("Please enter CM for AGO 3 and must be not less to OM");
    } else if (cmValues["cmAGO4"] < omValues["omAGO4"]) {
      toast.error("Please enter CM for AGO 4 and must be not less to OM");
    } else if (omValues["omPMS1"] < 0) {
      toast.error("Please enter OM for PMS 1");
    } else if (omValues["omPMS2"] < 0) {
      toast.error("Please enter OM for PMS 2");
    } else if (omValues["omPMS3"] < 0) {
      toast.error("Please enter OM for PMS 3");
    } else if (omValues["omPMS4"] < 0) {
      toast.error("Please enter OM for PMS 4");
    } else if (cmValues["cmPMS1"] < omValues["omPMS1"]) {
      toast.error("Please enter CM for PMS 1 and must be not less to OM");
    } else if (cmValues["cmPMS2"] < omValues["omPMS2"]) {
      toast.error("Please enter CM for PMS 2 and must be not less to OM");
    } else if (cmValues["cmPMS3"] < omValues["omPMS3"]) {
      toast.error("Please enter CM for PMS 3 and must be not less to OM");
    } else if (cmValues["cmPMS4"] < omValues["omPMS4"]) {
      toast.error("Please enter CM for PMS 4 and must be not less to OM");
    } else if (totalSales < 0) {
      toast.error("Please enter total sales");
    } else if (!agoCash) {
      toast.error("Please enter AGO total cash sales");
    } else if (!pmsCash) {
      toast.error("Please enter PMS total cash sales");
    } else if (!totalCash) {
      toast.error("Please enter total cash sales");
    } else if (!totalLitres) {
      toast.error("Please enter total litres");
    } else if (!pmsTotal) {
      toast.error("Please enter pms total sales amount");
    } else if (!pmsPrice) {
      toast.error("Please enter pms price per litre");
    } else if (!pmsTotalLitres) {
      toast.error("Please enter pms total sold litres");
    } else if (!agoTotal) {
      toast.error("Please enter ago total sales amount");
    } else if (!agoPrice) {
      toast.error("Please enter ago price per litre");
    } else if (!agoTotalLitres) {
      toast.error("Please enter ago total litres");
    } else {
      //start registration
      setLoading(true);
      try {
        //create new book
        const newBook = httpsCallable(functions, "createSale");
        newBook({
          omAGO1: omValues["omAGO1"],
          omAGO2: omValues["omAGO2"],
          omAGO3: omValues["omAGO3"],
          omAGO4: omValues["omAGO4"],
          omPMS1: omValues["omPMS1"],
          omPMS2: omValues["omPMS2"],
          omPMS3: omValues["omPMS3"],
          omPMS4: omValues["omPMS4"],
          cmAGO1: parseInt(cmValues["cmAGO1"]),
          cmAGO2: parseInt(cmValues["cmAGO2"]),
          cmAGO3: parseInt(cmValues["cmAGO3"]),
          cmAGO4: parseInt(cmValues["cmAGO4"]),
          cmPMS1: parseInt(cmValues["cmPMS1"]),
          cmPMS2: parseInt(cmValues["cmPMS2"]),
          cmPMS3: parseInt(cmValues["cmPMS3"]),
          cmPMS4: parseInt(cmValues["cmPMS4"]),
          agoPrice,
          agoTotal,
          agoTotalLitres,
          pmsPrice,
          pmsTotal,
          pmsTotalLitres,
          totalLitres,
          agoCash: parseInt(agoCash),
          pmsCash: parseInt(pmsCash),
          totalCash: parseInt(totalCash),
          totalSales,
          stationID,
          description,
          dayBookID: sales?.id,
          day: sales?.day,
          skipped,
          stationName: sales?.stationName,
          created_by: { name: user?.name, role: user?.role },
          updated_by: { name: user?.name, role: user?.role },
        })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;

            toast.success(data.message);
            setLoading(false);
            //fetch day sale
            getSales();
          })
          .catch((error) => {
            const message = error.message;
            console.log(error);
            setLoading(false);
            toast.error(message);
          });
      } catch (error) {
        const message = error.message;
        console.log(error);
        setLoading(false);
        toast.error(message);
      }
    }
  };

  const renderPumps = () => {
    const sortedPumps = pumps?.slice().sort((a, b) => {
      // Compare by type name first
      const nameA = a?.typeName.toUpperCase();
      const nameB = b?.typeName.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // If type names are equal, compare by name
      return a.name - b.name;
    });

    return (
      <div>
        {sortedPumps.map((pump, index) => {
          return (
            <div
              key={index}
              className="w-full py-2 flex-row gap-2 flex justify-center"
            >
              <TextField
                size="small"
                disabled
                id="outlined-disabled"
                label="Pump"
                variant="outlined"
                className="w-[20%]"
                value={`${pump?.typeName} ${pump?.name}`}
              />
              <TextField
                size="small"
                id="outlined-basic"
                label="OM"
                variant="outlined"
                className="w-[30%]"
                value={omValues[`om${pump.typeName}${pump.name}`] || ""}
                type="number"
                onChange={(e) =>
                  handleOMChange(e.target.value, pump.name, pump.typeName)
                }
              />
              <TextField
                size="small"
                id="outlined-basic"
                label="CM"
                variant="outlined"
                className="w-[30%]"
                value={cmValues[`cm${pump.typeName}${pump.name}`] || ""}
                type="number"
                onChange={(e) =>
                  handleCMChange(e.target.value, pump.name, pump.typeName)
                }
              />
              <div className="w-[20%]">
                {pump?.cardSwap ? (
                  <EditCard pump={pump} day={sales?.day} />
                ) : (
                  <AddCard pump={pump} day={sales?.day} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderButton = () => {
    if (loading) {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[100%] cursor-not-allowed"
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
            className="w-[100%]"
            sx={{
              background: `${colors.primary}`,
              "&:hover": {
                background: `${colors.bgColor6}`,
              },
            }}
            onClick={(e) => saveDaySales(e)}
          >
            SAVE DAY SALES BOOK
          </Button>
        </>
      );
    }
  };

  return (
    <div className="relative">
      {pageLoading ? (
        <div className="py-4 w-full flex justify-center items-center overflow-hidden">
          <div className="absolute bg-white bg-opacity-70 z-10 h-[200vh] w-full flex items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4"></div>
          </div>
        </div>
      ) : null}
      <div className="px-2 flex flex-row justify-center">
        <Box sx={style} className="rounded-md">
          {" "}
          <Alert severity="warning">
            {skipped ? (
              <>
                Sorry! You skipped to save{" "}
                {momentDate !== "Invalid date" ? <>{momentDate}</> : ""} day
                sales,
              </>
            ) : (
              <>
                {momentDate !== "Invalid date" ? <>{momentDate}</> : ""} Day
                sales,
              </>
            )}{" "}
            Please provide the details below.
          </Alert>
          <div>
            <h3 className="text-center text-xl py-4">
              {momentDate !== "Invalid date" ? <>{momentDate}</> : ""} SALES
              BOOK
            </h3>
            <div>
              {pumps ? <>{renderPumps()}</> : null}
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="AGO Total Litres"
                  variant="outlined"
                  className="w-[34%]"
                  value={agoTotalLitres}
                  type={"number"}
                  // onChange={(e) => setAGOLitres(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="AGO Price"
                  variant="outlined"
                  className="w-[33%]"
                  value={agoPrice}
                  type={"number"}
                  // onChange={(e) => setAgoPrice(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total AGO Amount"
                  variant="outlined"
                  className="w-[33%]"
                  value={agoTotal}
                  // onChange={(e) => setAGOTotalAmount(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="PMS Total Litres"
                  variant="outlined"
                  className="w-[34%]"
                  value={pmsTotalLitres}
                  type={"number"}
                  // onChange={(e) => setPMSLitres(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="PMS Price"
                  variant="outlined"
                  className="w-[33%]"
                  value={pmsPrice}
                  type={"number"}
                  // onChange={(e) => setPMSPrice(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total PMS Amount"
                  variant="outlined"
                  className="w-[33%]"
                  value={pmsTotal}
                  // onChange={(e) => setPMSTotalAmount(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total AGO Cash Sales"
                  variant="outlined"
                  className="w-[34%]"
                  value={agoCash}
                  type={"number"}
                  onChange={(e) => setAgoCash(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total PMS Cash Sales"
                  variant="outlined"
                  className="w-[33%]"
                  value={pmsCash}
                  type={"number"}
                  onChange={(e) => setPmsCash(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Cash Sales"
                  variant="outlined"
                  className="w-[33%]"
                  value={totalCash}
                  type={"number"}
                  onChange={(e) => setTotalCash(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Sold Litres"
                  variant="outlined"
                  className="w-[50%]"
                  value={totalLitres}
                  type={"number"}
                  // onChange={(e) => setTotalLitres(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Total Sales Amount"
                  variant="outlined"
                  className="w-[50%]"
                  value={totalSales}
                  // onChange={(e) => setTotalSales(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={2}
                  variant="outlined"
                  className="w-[100%]"
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
      </div>
    </div>
  );
};

export default DaySalesPriceTwo;
