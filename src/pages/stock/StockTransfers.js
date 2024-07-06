import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import {
  addFilteredStockTransfers,
  addStockDetails,
  addStockTransfers,
  selectFilteredStockTransfers,
  selectStockDetails,
  selectStockTransfers,
} from "../../features/stockSlice";
import TransferStock from "./TransferStock";
import EditTransferStock from "./EditTransferStock";
import { Chip, Divider } from "@mui/material";
import { formatter } from "../../helpers/Helpers";
import moment from "moment";
import Description from "../common/Description";

const { Search } = Input;

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Transferred To",
    key: "transferred",
    render: (_, transfer) => (
      <p className="">
        {transfer?.destination === "customer" ? (
          <span>{transfer?.customerName}</span>
        ) : (
          <span>{transfer?.stationName} {transfer?.stationLocation}</span>
        )}
      </p>
    ),
  },
  {
    title: "AGO",
    key: "ago",
    render: (_, transfer) => (
      <div>
        <p className="">
          {formatter.format(transfer?.agoLitres)}
          <span className="text-xs"> Litres</span>
        </p>
        <p className="text-xs">
          @ TZS {formatter.format(transfer?.agoPrice)}
        </p>
      </div>
    ),
  },
  {
    title: "PMS",
    key: "pms",
    render: (_, transfer) => (
      <div>
        <p className="">
          {formatter.format(transfer?.pmsLitres)}
          <span className="text-xs"> Litres</span>
        </p>
        <p className="text-xs">
         @ TZS {formatter.format(transfer?.pmsPrice)}
        </p>
      </div>
    ),
  },
  {
    title: "Total Litres",
    key: "total",
    render: (_, transfer) => (
      <p className="flex flex-col">
        <span>
          {formatter.format(
            parseInt(transfer?.agoLitres || 0) +
              parseInt(transfer?.pmsLitres || 0)
          )}
        </span>
      </p>
    ),
  },
  {
    title: "Total Amount",
    key: "total",
    render: (_, transfer) => (
      <p className="flex flex-col">
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
    title: "Actions",
    key: "action",
    render: (_, transfer) => (
      <div className="flex flex-row justify-start">
        <EditTransferStock stock={transfer} />
        <Description data={transfer} title={"Stock Transfer Descriptions"} />
      </div>
    ),
  },
];

const StockTransfers = () => {
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const getStockTransfers = async () => {
      let transfersArray = [];

      setPageLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "stockTransferBucket")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        transfersArray.push(data);
      });

      if (transfersArray.length > 0) {
        dispatch(addStockTransfers(transfersArray));
      } else {
        dispatch(addStockTransfers([]));
      }
    };

    const getStockDeatils = async () => {
      const docRef = doc(db, "stock", "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addStockDetails(data));
        setPageLoading(false);
      } else {
        dispatch(addStockDetails([]));
        setPageLoading(false);
      }
    };

    getStockTransfers();
    getStockDeatils();
  }, [dispatch]);

  const transfers = useSelector(selectStockTransfers);
  const stock = useSelector(selectStockDetails);

  const sortedTransfers = transfers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((transfer, index) => ({ ...transfer, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      // eslint-disable-next-line array-callback-return
      const searchedTransfers = transfers.filter((transfer) => {
        const name = transfer?.stationName.toLocaleLowerCase();

        if (name.includes(text)) {
          return transfer;
        }
      });

      // Update state with filtered stock transfers
      dispatch(addFilteredStockTransfers(searchedTransfers));
      setFilters(true);
    } else {
      // Update state with filtered stock transfers
      dispatch(addFilteredStockTransfers([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered stock transfers
      dispatch(addFilteredStockTransfers([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredTransfers = useSelector(selectFilteredStockTransfers);

  const sortedFilteredTransfers = filteredTransfers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((transfer, index) => ({ ...transfer, key: index + 1 }));

  return (
    <div className="relative">
      {pageLoading ? (
        <div className="py-4 w-full flex justify-center items-center overflow-hidden">
          <div className="absolute bg-white bg-opacity-70 z-10 h-[200vh] w-full flex items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4"></div>
          </div>
        </div>
      ) : null}
      <div className="flex flex-row gap-8 justify-end items-end py-2 px-2">
        <div>
          <Space.Compact size="large">
            <Search
              placeholder="Search by station name"
              allowClear
              onChange={(e) => handleSearchText(e.target.value)}
              onSearch={() => handleOnSearchChange()}
            />
          </Space.Compact>
        </div>
        <TransferStock />
      </div>
      <div className="py-2">
        <div className="my-3">
          <Divider>
            <Chip
              label={`AVAILABLE TOTAL LITRES: ${formatter.format(
                stock?.totalAvailableLitres || 0
              )}`}
            />{" "}
            <Chip
              label={`AVAILABLE AGO LITRES: ${formatter.format(
                stock?.availableAgo || 0
              )}`}
            />{" "}
            <Chip
              label={`AVAILABLE PMS LITRES: ${formatter.format(
                stock?.availablePms || 0
              )}`}
            />{" "}
          </Divider>
        </div>
        {filters ? (
          <>
            <div className="pt-2">
              <Table
                columns={columns}
                dataSource={sortedFilteredTransfers}
                size="middle"
                pagination={{ defaultPageSize: 10, size: "middle" }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="pt-2">
              <Table
                columns={columns}
                dataSource={sortedTransfers}
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

export default StockTransfers;
