import React, { useEffect } from "react";
import { db } from "../../../App";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import {
  addStationStocks,
  selectStationStocks,
} from "../../../features/stationSlice";
import { useParams } from "react-router-dom";
import moment from "moment";
import { formatter } from "../../../helpers/Helpers";
import { Chip, Divider } from "@mui/material";
import Description from "../../common/Description";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "AGO",
    key: "ago",
    render: (_, transfer) => (
      <p className="flex flex-col">
        <span>{formatter.format(transfer?.agoLitres)} Litres</span>
        <span>TZS {formatter.format(transfer?.agoTotalPrice)}</span>
      </p>
    ),
  },
  {
    title: "PMS",
    key: "pms",
    render: (_, transfer) => (
      <p className="flex flex-col">
        <span>{formatter.format(transfer?.pmsLitres)} Litres</span>
        <span>TZS {formatter.format(transfer?.pmsTotalPrice)}</span>
      </p>
    ),
  },
  {
    title: "Totals",
    key: "total",
    render: (_, transfer) => (
      <p className="flex flex-col">
        <span>
          {formatter.format(parseInt(transfer?.totalLitres || 0))}{" "}
          Litres
        </span>
        <span>TZS {formatter.format(transfer?.totalPrice)}</span>
      </p>
    ),
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (text) => <p>{moment.unix(text?.seconds).format("DD-MM-YYYY")}</p>,
  },
  {
    title: "Description",
    key: "view",
    render: (_, transfer) => (
      <div className="flex flex-row gap-1 justify-start">
        <Description data={transfer} title={"Station Stock Descriptions"} />
      </div>
    ),
  },
];

const StationStock = () => {
  const dispatch = useDispatch();
  const { stationID } = useParams();

  useEffect(() => {
    const getStationStock = async () => {
      let stockArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "stocks")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        stockArray.push(data);
      });

      if (stockArray.length > 0) {
        dispatch(addStationStocks(stockArray));
      }
    };

    getStationStock();
  }, [dispatch, stationID]);

  const stocks = useSelector(selectStationStocks);

  const agoStock = stocks.reduce(
    (sum, stock) => sum + parseInt(stock.agoLitres),
    0
  );
  const pmsStock = stocks.reduce(
    (sum, stock) => sum + parseInt(stock.pmsLitres),
    0
  );
  const totalStocks = agoStock + pmsStock;

  const sortedStocks = stocks
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((stock, index) => ({ ...stock, key: index + 1 }));

  return (
    <div className="px-2">
      <div className="my-3">
        <Divider>
          <Chip
            label={`RECEIVED AGO LITRES: ${formatter.format(agoStock || 0)}`}
          />{" "}
          <Chip
            label={`RECEIVED PMS LITRES: ${formatter.format(pmsStock || 0)}`}
          />{" "}
          <Chip
            label={`TOTAL RECEIVED LITRES: ${formatter.format(
              totalStocks || 0
            )}`}
          />{" "}
        </Divider>
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedStocks}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default StationStock;
