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
  addFilteredStationSupplierPayments,
  addStationSupplierPayments,
  selectFilteredStationSuppliersPayments,
  selectStationSuppliersPayments,
} from "../../../features/paymentSlice";
import AddStationSupplierPayment from "./AddStationSupplierPayment";

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
      title: "Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text) => <p>{text?.label}</p>,
    },
    {
      title: "Station",
      key: "details",
      render: (_, payment) => (
        <div>
          <p>{payment?.stationName}</p>
          <p>{payment?.stationPayment}</p>
        </div>
      ),
    },
    {
      title: "Bank",
      key: "details",
      render: (_, payment) => (
        <div>
          <p>{payment?.bank}</p>
          <p>{payment?.accountNumber}</p>
        </div>
      ),
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
      title: "Actions",
      key: "action",
      render: (_, payment) => (
        <p className="flex flex-row gap-1 justify-start">
          <Description data={payment} title={"Supplier Payment Descriptions"} />
          {/* <EditSupplierBalance payment={payment} /> */}
        </p>
      ),
    },
  ];

const StationSuppliersPayments = () => {
  const dispatch = useDispatch();

  const { stationID } = useParams();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);

  useEffect(() => {
    const getSupplierPayments = async () => {
      let paymentsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "supplierPayments")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        paymentsArray.push(data);
      });

      if (paymentsArray.length > 0) {
        dispatch(addStationSupplierPayments(paymentsArray));
      } else {
        dispatch(addStationSupplierPayments([]));
      }
    };

    getSupplierPayments();
  }, [dispatch]);

  const payments = useSelector(selectStationSuppliersPayments);

  const sortedPayments = payments?.slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((payment, index) => ({ ...payment, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedPayments = payments.filter((payment) => {
        const name = payment?.supplierName.toLocaleLowerCase();

        if (name.includes(text)) {
          return payment;
        }
      });

      // Update state with filtered payments
      dispatch(addFilteredStationSupplierPayments(searchedPayments));
      setFilters(true);
    } else {
      // Update state with filtered payments
      dispatch(addFilteredStationSupplierPayments([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered payments
      dispatch(addFilteredStationSupplierPayments([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredPayments = useSelector(selectFilteredStationSuppliersPayments);

  const sortedFilteredPayments = filteredPayments?.slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((payment, index) => ({ ...payment, key: index + 1 }));

  return (
    <div className=" ">
      <div className="flex flex-row gap-8 justify-end items-end py-2 px-2">
        <div>
          <Space.Compact size="large">
            <Search
              placeholder="Search Supplier Name"
              allowClear
              onChange={(e) => handleSearchText(e.target.value)}
              onSearch={() => handleOnSearchChange()}
            />
          </Space.Compact>
        </div>
        <AddStationSupplierPayment/>
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

export default StationSuppliersPayments;
