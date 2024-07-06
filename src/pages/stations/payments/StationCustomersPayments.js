import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import { useParams } from "react-router-dom";
import { Chip, Divider } from "@mui/material";
import Description from "../../common/Description";
import moment from "moment";
import { formatter } from "../../../helpers/Helpers";
import {
  addFilteredStationCustomersPayments,
  addStationCustomersPayments,
  selectFilteredStationCustomersPayments,
  selectStationCustomersPayments,
} from "../../../features/paymentSlice";
import AddStationCustomerPayment from "./AddStationCustomerPayment";

const { Search } = Input;

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Paid Amount",
    dataIndex: "amount",
    key: "amount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Payment Method",
    dataIndex: "paymentMethod",
    key: "paymentMethod",
    render: (text) => <p>{text?.label}</p>,
  },
  {
    title: "Payment Date",
    dataIndex: "date",
    key: "date",
    render: (text) => (
      <p>{moment.unix(text?.seconds || text?._seconds).format("DD-MM-YYYY")}</p>
    ),
  },
  {
    title: "Description",
    key: "description",
    render: (_, payment) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={payment} title={"Customer Payment Descriptions"} />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, payment) => (
      <p className="flex flex-row gap-1 justify-start">
        {/* <EditCustomerPayment payment={payment} /> */}
      </p>
    ),
  },
];

const StationCustomersPayments = () => {
  const dispatch = useDispatch();

  const { stationID } = useParams();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);

  useEffect(() => {
    const getCustomerPayments = async () => {
      let paymentsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "customerPayments")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        paymentsArray.push(data);
      });

      if (paymentsArray.length > 0) {
        dispatch(addStationCustomersPayments(paymentsArray));
      } else {
        dispatch(addStationCustomersPayments([]));
      }
    };

    getCustomerPayments();
  }, [dispatch]);

  const payments = useSelector(selectStationCustomersPayments);

  const sortedPayments = payments?.slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((payment, index) => ({ ...payment, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedPayments = payments.filter((payment) => {
        const name = payment?.customerName.toLocaleLowerCase();

        if (name.includes(text)) {
          return payment;
        }
      });

      // Update state with filtered payments
      dispatch(addFilteredStationCustomersPayments(searchedPayments));
      setFilters(true);
    } else {
      // Update state with filtered payments
      dispatch(addFilteredStationCustomersPayments([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered payments
      dispatch(addFilteredStationCustomersPayments([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredPayments = useSelector(selectFilteredStationCustomersPayments);

  const sortedFilteredPayments = filteredPayments?.slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((payment, index) => ({ ...payment, key: index + 1 }));

  return (
    <div className=" ">
      <div className="flex flex-row gap-8 justify-end items-end py-2 px-2">
        <div>
          <Space.Compact size="large">
            <Search
              placeholder="Search customer name"
              allowClear
              onChange={(e) => handleSearchText(e.target.value)}
              onSearch={() => handleOnSearchChange()}
            />
          </Space.Compact>
        </div>
        <AddStationCustomerPayment/>
      </div>
      <div className="pt-4">
        <div>
          <Divider>
            <Chip label={`TOTAL PAID AMOUNT: ${formatter.format(0)}`} />{" "}
          </Divider>
        </div>
        {filters ? (
          <>
            <div className="pt-4">
              <Table
                columns={columns}
                dataSource={sortedFilteredPayments}
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
                dataSource={sortedPayments}
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

export default StationCustomersPayments;
