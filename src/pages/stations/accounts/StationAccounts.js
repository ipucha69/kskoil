import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import {
  addStationAccounts,
  selectStationAccounts,
} from "../../../features/stationSlice";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { formatter } from "../../../helpers/Helpers";
import { getFunctions, httpsCallable } from "firebase/functions";
import { IconButton } from "@mui/material";
import { RemoveRedEye } from "@mui/icons-material";
import { selectUserInfo } from "../../../features/userSlice";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Date",
    dataIndex: "day",
    key: "day",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Quantity",
    dataIndex: "totalLitres",
    key: "totalLitres",
    render: (text) => <p>{formatter.format(text)} Litres</p>,
  },
  {
    title: "Cash Sales",
    dataIndex: "totalCash",
    key: "totalCash",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Debtor Sales",
    dataIndex: "totalDebtorsAmount",
    key: "totalDebtorsAmount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Total Sales",
    dataIndex: "totalSales",
    key: "totalSales",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Total Expenses",
    dataIndex: "totalExpensesAmount",
    key: "totalExpensesAmount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Actions",
    key: "action",
    render: (_, book) => (
      <p className="flex flex-row gap-1 justify-start">
        <ViewBook book={book} />
      </p>
    ),
  },
];

const ViewBook = ({ book }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUserInfo);
  const { stationID } = useParams();

  const handleViewBook = () => {
    // dispatch(addSupplierDetails(supplier));
    if (user?.role?.toLowerCase() === "manager") {
      navigate(`/station/${stationID}/accounts/${book?.dayBook?.id}`);
    } else {
      navigate(`/stations/${stationID}/accounts/${book?.dayBook?.id}`);
    }
  };

  return (
    <p className="mt-1">
      <IconButton onClick={() => handleViewBook()}>
        <RemoveRedEye className="text-[#0A365C] text-xl cursor-pointer" />
      </IconButton>
    </p>
  );
};

const StationAccounts = () => {
  const [pageLoading, setPageLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();

  useEffect(() => {
    const getAccounts = async () => {
      try {
        //fetch day book
        setPageLoading(true);
        const daySalesBook = httpsCallable(functions, "fetchSalesBook");
        daySalesBook({ stationID, allStations: false })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            //add day
            const accounts = data?.data;
            console.log(accounts);
            dispatch(addStationAccounts(accounts));
            setPageLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setPageLoading(false);
          });
      } catch (error) {
        console.log(error);
        setPageLoading(false);
      }
    };

    getAccounts();
  }, [dispatch, stationID]);

  const accounts = useSelector(selectStationAccounts);

  const sortedAccounts = accounts
    ?.slice()
    .sort((a, b) => new Date(b.day) - new Date(a.day))
    .map((sale, index) => ({ ...sale, key: index + 1 }));

  return (
    <div className="px-2">
      <div className="py-2">
        <h4 className="text-center">DAILY SALES BOOKS</h4>
      </div>
      <div className="pt-4">
        <Table
          columns={columns}
          dataSource={sortedAccounts}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default StationAccounts;
