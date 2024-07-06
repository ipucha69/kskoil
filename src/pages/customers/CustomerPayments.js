import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import { useParams } from "react-router-dom";
import {
  addCustomerPayments,
  addFilteredCustomerPayments,
  selectCustomerPayments,
  selectFilteredCustomerPayments,
} from "../../features/customerSlice";
import EditCustomerPayment from "./EditCustomerPayment";
import AddCustomerPayment from "./AddCustomerPayment";
import { Chip, Divider } from "@mui/material";
import Description from "../common/Description";
import moment from "moment";
import { formatter } from "../../helpers/Helpers";

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
        <EditCustomerPayment payment={payment} />
      </p>
    ),
  },
];

const CustomerPayments = () => {
  const dispatch = useDispatch();

  const { customerID } = useParams();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);

  useEffect(() => {
    const getCustomerPayments = async () => {
      let paymentsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "customers", customerID, "payments")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        paymentsArray.push(data);
      });

      if (paymentsArray.length > 0) {
        dispatch(addCustomerPayments(paymentsArray));
      } else {
        dispatch(addCustomerPayments([]));
      }
    };

    getCustomerPayments();
  }, [dispatch]);

  const payments = useSelector(selectCustomerPayments);

  const sortedPayments = payments
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((payment, index) => ({ ...payment, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedPayments = payments.filter((payment) => {
        const name = payment?.paymentType.toLocaleLowerCase();

        if (name.includes(text)) {
          return payment;
        }
      });

      // Update state with filtered payments
      dispatch(addFilteredCustomerPayments(searchedPayments));
      setFilters(true);
    } else {
      // Update state with filtered payments
      dispatch(addFilteredCustomerPayments([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered payments
      dispatch(addFilteredCustomerPayments([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredPayments = useSelector(selectFilteredCustomerPayments);

  const sortedFilteredPayments = filteredPayments
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((payment, index) => ({ ...payment, key: index + 1 }));

  return (
    <div className="px-2">
      <div className="flex flex-row gap-8 justify-end items-end py-2 px-2">
        <div>
          <Space.Compact size="large">
            <Search
              placeholder="Search payment method"
              allowClear
              onChange={(e) => handleSearchText(e.target.value)}
              onSearch={() => handleOnSearchChange()}
            />
          </Space.Compact>
        </div>
        <AddCustomerPayment />
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

export default CustomerPayments;
