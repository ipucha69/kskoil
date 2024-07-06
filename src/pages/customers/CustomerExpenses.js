import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import { useParams } from "react-router-dom";
import {
  addCustomerExpenses,
  addFilteredCustomerExpenses,
  selectCustomerExpenses,
  selectFilteredCustomerExpenses,
} from "../../features/customerSlice";
import { Chip, Divider } from "@mui/material";
import Description from "../common/Description";

const { Search } = Input;

const formatter = new Intl.NumberFormat("en-US");

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Station Name",
    dataIndex: "stationName",
    key: "stationName",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Fuel",
    dataIndex: "fuel",
    key: "fuel",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Litres",
    dataIndex: "quantity",
    key: "quantity",
    render: (text) => <p>{formatter.format(text)}</p>,
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
    title: "Paid Amount",
    dataIndex: "paidAmount",
    key: "paidAmount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Date",
    dataIndex: "day",
    key: "day",
  },
  {
    title: "View",
    key: "view",
    render: (_, expense) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={expense} title={"Customer Expense Description"} />
      </p>
    ),
  },
];

const CustomerExpenses = () => {
  const dispatch = useDispatch();

  const { customerID } = useParams();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);

  useEffect(() => {
    const getCustomerExpenses = async () => {
      let paymentsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "customers", customerID, "expenses")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        paymentsArray.push(data);
      });

      if (paymentsArray.length > 0) {
        dispatch(addCustomerExpenses(paymentsArray));
      }
    };

    getCustomerExpenses();
  }, [dispatch, customerID]);

  const expenses = useSelector(selectCustomerExpenses);

  const expensesAmount = expenses.reduce(
    (sum, expense) => sum + expense.totalAmount,
    0
  );

  const paidAmount = expenses.reduce(
    (sum, expense) => sum + expense.paidAmount,
    0
  );

  const debt = expensesAmount - paidAmount;

  const sortedExpenses = expenses
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((expense, index) => ({ ...expense, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedExpenses = expenses.filter((expense) => {
        const name = expense?.stationName.toLocaleLowerCase();

        if (name.includes(text)) {
          return expense;
        }
      });

      // Update state with filtered expenses
      dispatch(addFilteredCustomerExpenses(searchedExpenses));
      setFilters(true);
    } else {
      // Update state with filtered expenses
      dispatch(addFilteredCustomerExpenses([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered expenses
      dispatch(addFilteredCustomerExpenses([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredExpenses = useSelector(selectFilteredCustomerExpenses);

  const sortedFilteredExpenses = filteredExpenses
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((expense, index) => ({ ...expense, key: index + 1 }));

  return (
    <div className="">
      <div className="flex flex-row gap-8 justify-end items-end py-2">
        <div>
          <Space.Compact size="large">
            <Search
              placeholder="Search station name"
              allowClear
              onChange={(e) => handleSearchText(e.target.value)}
              onSearch={() => handleOnSearchChange()}
            />
          </Space.Compact>
        </div>
      </div>
      <div className="py-3">
        <div>
          <Divider>
            <Chip
              label={`TOTAL EXPENSES AMOUNT: TZS ${formatter.format(
                expensesAmount || 0
              )}`}
            />{" "}
            <Chip
              label={`TOTAL PAID AMOUNT: TZS ${formatter.format(
                paidAmount || 0
              )}`}
            />{" "}
            <Chip
              label={`TOTAL DEBT AMOUNT: TZS ${formatter.format(debt || 0)}`}
            />{" "}
          </Divider>
        </div>
        {filters ? (
          <>
            <div className="pt-4">
              <Table
                columns={columns}
                dataSource={sortedFilteredExpenses}
                size="middle"
                pagination={{ defaultPageSize: 10, size: "middle" }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="pt-4">
              <Table
                columns={columns}
                dataSource={sortedExpenses}
                size="middle"
                pagination={{ defaultPageSize: 10, size: "middle" }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerExpenses;
