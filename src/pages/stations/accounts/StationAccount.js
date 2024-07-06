import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import { useParams } from "react-router-dom";
import moment from "moment";
import { formatter } from "../../../helpers/Helpers";
import { Chip, Divider } from "@mui/material";
import { getFunctions, httpsCallable } from "firebase/functions";
import { addDayBook, selectDayBook } from "../../../features/saleSlice";
import Description from "../../common/Description";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Pump",
    key: "pumpName",
    render: (_, sale) => (
      <p>
        {sale?.typeName} {sale?.name}
      </p>
    ),
  },
  {
    title: "OM",
    dataIndex: "om",
    key: "om",
    render: (text) => <p>{formatter.format(text)} Litres</p>,
  },
  {
    title: "CM",
    dataIndex: "cm",
    key: "cm",
    render: (text) => <p>{formatter.format(text)} Litres</p>,
  },
  {
    title: "Quantity",
    key: "quantity",
    render: (_, sale) => <p>{formatter.format(sale?.cm - sale?.om)} Litres</p>,
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Total Amount",
    key: "amount",
    render: (_, sale) => <p>TZS {formatter.format(sale?.amount || 0)}</p>,
  },
  {
    title: "Description",
    key: "description",
    render: (_, sale) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={sale} title={"Pump Sale Description"} />{" "}
      </p>
    ),
  },
];

const debtorColumns = [
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
    dataIndex: "customerPrice",
    key: "customerPrice",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Description",
    key: "description",
    render: (_, debtor) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={debtor} title={"Debtor Description"} />
      </p>
    ),
  },
];

const expenseColumns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Expense",
    dataIndex: "expenseName",
    key: "expenseName",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Total Amount",
    dataIndex: "amount",
    key: "amount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Description",
    key: "description",
    render: (_, expense) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={expense} title={"Expense Description"} />
      </p>
    ),
  },
];

const StationAccount = () => {
  const [pageLoading, setPageLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID, dayBookID } = useParams();
  const functions = getFunctions();

  useEffect(() => {
    const getSales = async () => {
      try {
        //fetch day book
        setPageLoading(true);
        const daySalesBook = httpsCallable(functions, "fetchSalesAccount");
        daySalesBook({ stationID, dayBookID })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            //add day
            const sales = data?.data;
            // console.log(sales);
            dispatch(addDayBook(sales));
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

    getSales();
  }, [dispatch, stationID]);

  const accounts = useSelector(selectDayBook);
  const daySale = accounts?.dayBook;
  const sales = accounts?.sales || [];
  const debtors = accounts?.debtors || [];
  const expenses = accounts?.expenses || [];

  const debtAmount = daySale?.totalSales - daySale?.totalCash;

  const totalExpenses = expenses?.reduce(
    (sum, expense) => sum + expense?.amount,
    0
  );

  const balance = daySale?.totalSales - totalExpenses;
  const momentDate = moment(daySale?.day, "DD-MM-YYYY").format("ll");

  const sortedSales = sales
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((sale, index) => ({ ...sale, key: index + 1 }));

  const sortedDebtors = debtors
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((debtor, index) => ({ ...debtor, key: index + 1 }));

  const sortedExpenses = expenses
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((expense, index) => ({ ...expense, key: index + 1 }));

  return (
    <div className="px-8 py-2">
      <div className="relative">
        <h3 className="text-center text-xl pb-2">
          {momentDate || ""} DAY BOOK
        </h3>
        {pageLoading ? (
          <div className="py-4 w-full flex justify-center items-center overflow-hidden">
            <div className="absolute bg-white bg-opacity-70 z-10 h-screen w-full flex items-center justify-center">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4"></div>
            </div>
          </div>
        ) : null}
        <div className="mb-1">
          <Divider>
            <Chip
              label={`AGO LITRES: ${formatter.format(
                daySale?.agoTotalLitres || 0
              )}`}
            />{" "}
            <Chip
              label={`PMS LITRES: ${formatter.format(
                daySale?.pmsTotalLitres || 0
              )}`}
            />{" "}
            <Chip
              label={`CASH SALES: TZS ${formatter.format(
                daySale?.totalCash || 0
              )}`}
            />{" "}
            <Chip
              label={`DEBTORS SALES: TZS ${formatter.format(debtAmount || 0)}`}
            />{" "}
          </Divider>
        </div>
        <div className="my-3">
          <Divider>
            <Chip
              label={`TOTAL SALES: TZS ${formatter.format(
                daySale?.totalSales || 0
              )}`}
            />{" "}
            <Chip
              label={`EXPENSES: TZS ${formatter.format(totalExpenses || 0)}`}
            />{" "}
            <Chip label={`BALANCE: TZS ${formatter.format(balance || 0)}`} />{" "}
          </Divider>
        </div>
        <div className="pt-2">
          <h4>SALES</h4>
          <Table
            columns={columns}
            dataSource={sortedSales}
            size="small"
            pagination={{ defaultPageSize: 8, size: "middle" }}
          />
        </div>
        <div className="pt-2">
          <h4>DEBTORS</h4>
          <Table
            columns={debtorColumns}
            dataSource={sortedDebtors}
            size="small"
            pagination={{ defaultPageSize: 8, size: "middle" }}
          />
        </div>
        <div className="pt-2">
          <h4>EXPENSES</h4>
          <Table
            columns={expenseColumns}
            dataSource={sortedExpenses}
            size="small"
            pagination={{ defaultPageSize: 8, size: "middle" }}
          />
        </div>
      </div>
    </div>
  );
};

export default StationAccount;
