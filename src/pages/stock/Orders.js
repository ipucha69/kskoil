import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import {
  addFilteredStocks,
  addStockDetails,
  addStocks,
  selectFilteredStocks,
  selectStockDetails,
  selectStocks,
} from "../../features/stockSlice";
import AddStock from "./AddStock";
import EditStock from "./EditStock";
import moment from "moment";
import { formatter } from "../../helpers/Helpers";
import Description from "../common/Description";
import { Chip, Divider } from "@mui/material";
import OrderPreview from "./OrderPreview";

const { Search } = Input;

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "AGO",
    dataIndex: "agoLitres",
    key: "agoLitres",
    render: (text) => <p>{formatter.format(text)} Ltrs</p>,
  },
  {
    title: "PMS",
    dataIndex: "pmsLitres",
    key: "pmsLitres",
    render: (text) => <p>{formatter.format(text)} Ltrs</p>,
  },
  {
    title: "Quantity",
    dataIndex: "totalLitres",
    key: "totalLitres",
    render: (text) => <p>{formatter.format(text)} Ltrs</p>,
  },
  {
    title: "Total Amount",
    dataIndex: "totalPrice",
    key: "totalPrice",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Supplier",
    dataIndex: "supplierName",
    key: "supplierName",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (text) => <p>{moment.unix(text?.seconds).format("DD-MM-YYYY")}</p>,
  },
  {
    title: "View",
    key: "view",
    render: (_, stock) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={stock} title={"Stock Purchase Descriptions"} />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, stock) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditStock stock={stock} />
        <OrderPreview order={stock}/>
      </p>
    ),
  },
];

const Orders = () => {
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const getStocks = async () => {
      let stocksArray = [];

      setPageLoading(true);

      const querySnapshot = await getDocs(collection(db, "stockBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        stocksArray.push(data);
      });

      if (stocksArray.length > 0) {
        dispatch(addStocks(stocksArray));
      } else {
        dispatch(addStocks([]));
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

    getStocks();
    getStockDeatils();
  }, [dispatch]);

  const stocks = useSelector(selectStocks);
  const stock = useSelector(selectStockDetails);

  const sortedStocks = stocks
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((stock, index) => ({ ...stock, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedStocks = stocks.filter((stock) => {
        // const name = stock?.supplierName.toLocaleLowerCase();

        return stock?.supplierName?.toLocaleLowerCase()?.includes(text);
      });

      // Update state with filtered stocks
      dispatch(addFilteredStocks(searchedStocks));
      setFilters(true);
    } else {
      // Update state with filtered stocks
      dispatch(addFilteredStocks([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered stocks
      dispatch(addFilteredStocks([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredStocks = useSelector(selectFilteredStocks);

  const sortedFilteredStocks = filteredStocks
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((stock, index) => ({ ...stock, key: index + 1 }));

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
              placeholder="Search by supplier name"
              allowClear
              onChange={(e) => handleSearchText(e.target.value)}
              onSearch={() => handleOnSearchChange()}
            />
          </Space.Compact>
        </div>
        <AddStock />
      </div>
      <div className="my-3">
        <Divider>
          <Chip
            label={`PURCHASED TOTAL LITRES: ${formatter.format(
              stock?.totalAvailableLitres || 0
            )}`}
          />{" "}
          <Chip
            label={`PURCHASED AGO LITRES: ${formatter.format(
              stock?.availableAgo || 0
            )}`}
          />{" "}
          <Chip
            label={`AVAILABLE PMS LITRES: ${formatter.format(
              stock?.PURCHASED || 0
            )}`}
          />{" "}
        </Divider>
      </div>
      <div className="pt-2">
        {filters ? (
          <>
            <div className="pt-2">
              <Table
                columns={columns}
                dataSource={sortedFilteredStocks}
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
                dataSource={sortedStocks}
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

export default Orders;
