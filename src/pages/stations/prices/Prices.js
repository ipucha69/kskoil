import React, { useEffect } from "react";
import { db } from "../../../App";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import {
  addStationPrices,
  selectStationPrices,
} from "../../../features/stationSlice";
import { useParams } from "react-router-dom";
import AddPrice from "./AddPrice";
import EditPrice from "./EditPrice";
import moment from "moment";
import Description from "../../common/Description";
import { formatter } from "../../../helpers/Helpers";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "AGO Price",
    dataIndex: "petrolPrice",
    key: "petrolPrice",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "PMS Price",
    dataIndex: "dieselPrice",
    key: "dieselPrice",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Date",
    dataIndex: "created_at",
    key: "created_at",
    render: (text) => <p>{moment.unix(text?.seconds).format("DD-MM-YYYY")}</p>,
  },
  {
    title: "Description",
    key: "view",
    render: (_, price) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={price} title={"Station Stock Descriptions"} />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, price) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditPrice price={price} />
      </p>
    ),
  },
];

const Prices = () => {
  const dispatch = useDispatch();
  const { stationID } = useParams();

  useEffect(() => {
    const getPrices = async () => {
      let pricesArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "prices")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        pricesArray.push(data);
      });

      if (pricesArray.length > 0) {
        dispatch(addStationPrices(pricesArray));
      } else {
        dispatch(addStationPrices([]));
      }
    };

    getPrices();
  }, [dispatch, stationID]);

  const prices = useSelector(selectStationPrices);

  const sortedPrices = prices
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((price, index) => ({ ...price, key: index + 1 }));

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddPrice />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedPrices}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Prices;
