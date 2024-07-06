import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import { useParams } from "react-router-dom";
import moment from "moment";
import Description from "../../common/Description";
import {
  addDayDebtors,
  addDaySale,
  selectDayDebtors,
  selectDaySale,
} from "../../../features/saleSlice";
import AddDayDebtor from "./AddDayDebtor";
import EditDayDebtor from "./EditDayDebtor";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Alert } from "@mui/material";
import { formatter } from "../../../helpers/Helpers";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Customer",
    dataIndex: "customerName",
    key: "customerName",
  },
  {
    title: "Truck",
    dataIndex: "truck",
    key: "truck",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Fuel",
    dataIndex: "fuel",
    key: "fuel",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
    render: (text) => <p>{formatter.format(text)} Litres</p>,
  },
  {
    title: "Price",
    dataIndex: "stationPrice",
    key: "stationPrice",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Station Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "View",
    key: "view",
    render: (_, debtor) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={debtor} title={"Debtor Description"} />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, debtor) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditDayDebtor debtor={debtor} />
      </p>
    ),
  },
];

const DayDebtors = () => {
  const [pageLoading, setPageLoading] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();

  useEffect(() => {
    const getDebtors = async () => {
      setPageLoading(true);
      const daySalesBook = httpsCallable(functions, "fetchDayBook");
      daySalesBook({ stationID })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          //add day
          const sales = data?.data?.dayBook;
          const debtors = data?.data?.debtors;
          const skipped = data?.data?.skipped;
          // console.log(skipped);
          setSkipped(skipped);
          // console.log(data);
          // console.log(debtors);
          dispatch(addDaySale(sales));
          dispatch(addDayDebtors(debtors));
          setPageLoading(false);
        })
        .catch((error) => {
          const message = error.message;
          console.log(error);
          setPageLoading(false);
        });
    };

    getDebtors();
  }, [dispatch, stationID]);

  const debtors = useSelector(selectDayDebtors);
  const sales = useSelector(selectDaySale);

  const agoDebt = sales?.agoTotal - sales?.agoCash;
  const pmsDebt = sales?.pmsTotal - sales?.pmsCash;
  const agoLitres = agoDebt / parseInt(sales?.agoPrice);
  const pmsLitres = pmsDebt / parseInt(sales?.pmsPrice);

  const momentDate = moment(sales?.day, "DD-MM-YYYY").format("ll");

  const debtorsList = debtors
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedDebtors = debtorsList.map((debtor, index) => {
    const key = index + 1;
    return { ...debtor, key };
  });

  return (
    <div className="relative">
      {pageLoading ? (
        <div className="py-4 w-full flex justify-center items-center overflow-hidden">
          <div className="absolute bg-white bg-opacity-70 z-10 h-screen w-full flex items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4"></div>
          </div>
        </div>
      ) : null}
      <div className="px-2">
        <div className="flex flex-row justify-center">
          {agoLitres > 0 || pmsLitres > 0 ? (
            <Alert severity="warning">
              {skipped ? (
                <>Sorry! You skipped to save {momentDate} day sales,</>
              ) : <>{momentDate} Debtors,</>}{" "}
              Please provide the details for{" "}
              {agoLitres > 0 ? (
                <>{formatter.format(agoLitres)} AGO Litres</>
              ) : null}{" "}
              {(agoLitres > 0) & (pmsLitres > 0) ? "and" : null}{" "}
              {pmsLitres > 0 ? (
                <>{formatter.format(pmsLitres)} PMS Litres</>
              ) : null}{" "}
              below.
            </Alert>
          ) : null}
        </div>
        <div className="flex flex-row justify-end py-2">
          <AddDayDebtor />
        </div>
        <div className="pt-4">
          <Table
            columns={columns}
            dataSource={sortedDebtors}
            size="middle"
            pagination={{ defaultPageSize: 8, size: "middle" }}
          />
        </div>
      </div>
    </div>
  );
};

export default DayDebtors;
