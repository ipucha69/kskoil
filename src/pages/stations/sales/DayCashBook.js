import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import { useParams } from "react-router-dom";
import moment from "moment";
import {
  addDayDebtorsSales,
  addDaySale,
  selectDayDebtorsSales,
  selectDaySale,
} from "../../../features/saleSlice";
import EditStationExpense from "../expenses/EditStationExpense";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Alert } from "@mui/material";
import Description from "../../common/Description";
import AddDayCashBook from "./AddDayCashBook";

const formatter = new Intl.NumberFormat("en-US");

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
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Payment method",
    dataIndex: "paymentMethod",
    key: "paymentMethod",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Date",
    dataIndex: "day",
    key: "day",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Description",
    key: "description",
    render: (_, expense) => (
      <div className="flex flex-row gap-1 justify-start">
        <Description data={expense} title={"Debtor Cash Sale Description"} />
      </div>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, expense) => (
      <div className="flex flex-row gap-1 justify-start">
        <EditStationExpense expense={expense} />
      </div>
    ),
  },
];

const DayCashBook = () => {
  const [pageLoading, setPageLoading] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();

  useEffect(() => {
    const getExpenses = async () => {
      setPageLoading(true);
      const daySalesBook = httpsCallable(functions, "fetchDayBook");
      daySalesBook({ stationID })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          //add day
          const sales = data?.data?.dayBook;
          const cashSales = data?.data?.debtorsCashSales;
          const skipped = data?.data?.skipped;
          // console.log(skipped);
          setSkipped(skipped);
          // console.log(data);
          // console.log(sales);
          dispatch(addDaySale(sales));
          dispatch(addDayDebtorsSales(cashSales));
          setPageLoading(false);
        })
        .catch((error) => {
          const message = error.message;
          console.log(error);
          setPageLoading(false);
        });
    };

    getExpenses();
  }, [dispatch, stationID]);

  const debtorsSales = useSelector(selectDayDebtorsSales);
  const sales = useSelector(selectDaySale);

  const momentDate = moment(sales?.day, "DD-MM-YYYY").format("ll");

  const cashSalesList = debtorsSales
    .slice()
    .sort((a, b) => b.created_at - a.created_at);

  const sortedDebtorsCashSales = cashSalesList.map((cash, index) => {
    const key = index + 1;
    return { ...cash, key };
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
        <Alert severity="warning">
          {skipped ? (
            <>Sorry! You skipped to save {momentDate} day cash sales,</>
          ) : (
            <>{momentDate} Day cash sales,</>
          )}{" "}
          Please provide the details below.
        </Alert>
        <div className="flex flex-row justify-end py-2">
          <AddDayCashBook />
        </div>
        <div className="pt-3">
          <Table
            columns={columns}
            dataSource={sortedDebtorsCashSales}
            size="middle"
            pagination={{ defaultPageSize: 8, size: "middle" }}
          />
        </div>
      </div>
    </div>
  );
};

export default DayCashBook;
