import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import { Chip, Divider } from "@mui/material";
import { formatter } from "../../../helpers/Helpers";
import { useParams } from "react-router-dom";
import { addFiltredDistributions, addStationDetails, addStationDistributions, selectFiltredDistributions, selectStationDetails, selectStationDistributions } from "../../../features/stationSlice";
import AddStockDistribution from "./AddStockDistribution";

const { Search } = Input;

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Pump Name",
    dataIndex: "pumpName",
    key: "pumpName",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Fuel Type",
    dataIndex: "fuel",
    key: "fuel",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Litres",
    dataIndex: "litres",
    key: "litres",
    render: (text) => <p>{formatter.format(text)} Litres</p>,
  },
  {
    title: "Total Price",
    dataIndex: "totalPrice",
    key: "totalPrice",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Description",
    dataIndex: "",
    key: "description",
  },
  {
    title: "Actions",
    key: "action",
    render: (_, transfer) => (
      <p className="flex flex-row gap-1 justify-start">
    
      </p>
    ),
  },
];

const StockDistribution = () => {
  const dispatch = useDispatch();

  const {stationID} = useParams();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);

  useEffect(() => {
    const getStockTransfers = async () => {
      let transfersArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "distributions")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        transfersArray.push(data);
      });

      if (transfersArray.length > 0) {
        dispatch(addStationDistributions(transfersArray));
      }
    };

    const getStationDeatils = async () => {
      const docRef = doc(db, "stations", stationID, "account", "info");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addStationDetails(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        dispatch(addStationDetails({}));
      }
    };

    getStockTransfers();
    getStationDeatils();
  }, [dispatch]);

  const distributions = useSelector(selectStationDistributions);
  const stationDetails = useSelector(selectStationDetails);

  const sortedTransfers = distributions
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((transfer, index) => ({ ...transfer, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      // eslint-disable-next-line array-callback-return
      const searchedTransfers = distributions.filter((transfer) => {
        const name = transfer?.pumpName.toLocaleLowerCase();

        if (name.includes(text)) {
          return transfer;
        }
      });

      // Update state with filtered stock transfers
      dispatch(addFiltredDistributions(searchedTransfers));
      setFilters(true);
    } else {
      // Update state with filtered stock transfers
      dispatch(addFiltredDistributions([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered stock transfers
      dispatch(addFiltredDistributions([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredTransfers = useSelector(selectFiltredDistributions);

  const sortedFilteredTransfers = filteredTransfers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((transfer, index) => ({ ...transfer, key: index + 1 }));

  return (
    <div className="px-2">
      <div className="flex flex-row gap-8 justify-end items-end py-2 px-2">
        <div>
          <Space.Compact size="large">
            <Search
              placeholder="Search by pump"
              allowClear
              onChange={(e) => handleSearchText(e.target.value)}
              onSearch={() => handleOnSearchChange()}
            />
          </Space.Compact>
        </div>
        <AddStockDistribution/>
      </div>
      <div className="py-2">
        <div className="my-3">
          <Divider>
            <Chip
              label={`AVAILABLE TOTAL LITRES: ${formatter.format(
                stationDetails?.totalAvailableLitres || 0
              )}`}
            />{" "}
            <Chip
              label={`AVAILABLE AGO LITRES: ${formatter.format(
                stationDetails?.availableAgo || 0
              )}`}
            />{" "}
            <Chip
              label={`AVAILABLE PMS LITRES: ${formatter.format(
                stationDetails?.availablePms || 0
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

export default StockDistribution;
