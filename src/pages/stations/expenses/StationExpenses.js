import React, { useEffect } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import {
  addStationExpenses,
  selectStationExpenses,
} from "../../../features/stationSlice";
import { useParams } from "react-router-dom";
import Description from "../../common/Description";

const formatter = new Intl.NumberFormat("en-US");

const columns = [
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
    title: "Date",
    dataIndex: "day",
    key: "day",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Description",
    key: "description",
    render: (_, expense) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={expense} title={"Station Expense Description"} />
      </p>
    ),
  },
];

const StationExpenses = () => {
  const dispatch = useDispatch();
  const { stationID } = useParams();

  useEffect(() => {
    const getExpenses = async () => {
      let expensesArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "expenses")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        expensesArray.push(data);
      });

      if (expensesArray.length > 0) {
        dispatch(addStationExpenses(expensesArray));
      } else {
        dispatch(addStationExpenses([]));
      }
    };

    getExpenses();
  }, [dispatch, stationID]);

  const expenses = useSelector(selectStationExpenses);

  const sortedExpenses = expenses
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((expense, index) => ({ ...expense, key: index + 1 }));

  return (
    <div className="px-2">
      <div className="pt-4">
        <Table
          columns={columns}
          dataSource={sortedExpenses}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default StationExpenses;
