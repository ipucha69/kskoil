import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import { useParams } from "react-router-dom";
import { Chip, Divider } from "@mui/material";
import AddSupplierBalance from "./AddSupplierBalance";
import {
  addSupplierFilteredTransactions,
  addSupplierTransactions,
  selectSupplierFilteredTransactions,
  selectSupplierTransactions,
} from "../../../features/supplierSlice";
import EditSupplierBalance from "./EditSupplierBalance";
import { formatter } from "../../../helpers/Helpers";
import moment from "moment";
import Description from "../../common/Description";

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
        <EditSupplierBalance payment={payment} />
      </p>
    ),
  },
];

const SupplierBalance = () => {
  const dispatch = useDispatch();

  const { supplierID } = useParams();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);

  useEffect(() => {
    const getSupplierPayments = async () => {
      let paymentsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "suppliers", supplierID, "payments")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        paymentsArray.push(data);
      });

      if (paymentsArray.length > 0) {
        dispatch(addSupplierTransactions(paymentsArray));
      }
    };

    getSupplierPayments();
  }, [dispatch, supplierID]);

  const payments = useSelector(selectSupplierTransactions);

  const sortedPayments = payments
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((payment, index) => ({ ...payment, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedPayments = payments.filter((payment) => {
        return payment?.paymentType.toLocaleLowerCase()?.includes(text);
      });

      // Update state with filtered payments
      dispatch(addSupplierFilteredTransactions(searchedPayments));
      setFilters(true);
    } else {
      // Update state with filtered payments
      dispatch(addSupplierFilteredTransactions([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered payments
      dispatch(addSupplierFilteredTransactions([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredPayments = useSelector(selectSupplierFilteredTransactions);

  const sortedFilteredPayments = filteredPayments
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((payment, index) => ({ ...payment, key: index + 1 }));

  const amount = payments.reduce((sum, payment) => sum + payment.amount, 0);

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
        <AddSupplierBalance />
      </div>
      <div className="pt-4">
        <div>
          <Divider>
            <Chip
              label={`TOTAL PAID AMOUNT: ${formatter.format(amount || 0)}`}
            />{" "}
          </Divider>
        </div>
        {filters ? (
          <>
            <div className="pt-5">
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
            <div className="pt-5">
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

export default SupplierBalance;
