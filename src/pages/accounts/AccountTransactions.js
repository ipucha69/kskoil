import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import { addFilteredCustomerPayments } from "../../features/customerSlice";
import { Chip, Divider } from "@mui/material";
import Description from "../common/Description";
import moment from "moment";
import { formatter } from "../../helpers/Helpers";
import {
  addAccountTransactions,
  selectAccountTransactions,
} from "../../features/accountSlice";

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
            <Description data={payment} title={"Transaction Descriptions"} />
        </p>
        ),
    },
];

const AccountTransactions = () => {
    const dispatch = useDispatch();

    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState(false);

    useEffect(() => {
        const getTransactions = async () => {
        let transactionsArray = [];

        const querySnapshot = await getDocs(collection(db, "supplierPayments"));
        querySnapshot.forEach((doc) => {
            //set data
            const data = doc.data();
            transactionsArray.push(data);
        });

        if (transactionsArray.length > 0) {
            dispatch(addAccountTransactions(transactionsArray));
        } else {
            dispatch(addAccountTransactions([]));
        }
        };

        getTransactions();
    }, [dispatch]);

    const transactions = useSelector(selectAccountTransactions);

    const sortedTransactions = transactions
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((transaction, index) => ({ ...transaction, key: index + 1 }));

    const handleOnSearchChange = () => {
        if (searchText) {
        const text = searchText.toLocaleLowerCase();
        const searchedPayments = transactions.filter((transaction) => {
            const name = transaction?.paymentType.toLocaleLowerCase();

            if (name.includes(text)) {
            return transaction;
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

    //   const filteredPayments = useSelector(selectFilteredCustomerPayments);

    //   const sortedFilteredPayments = filteredPayments
    //     .slice()
    //     .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    //     .map((payment, index) => ({ ...payment, key: index + 1 }));

    return (
        <div className="px-2">
        {/* <div className="flex flex-row gap-8 justify-end items-end py-2 px-2">
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
        </div> */}
        <div className="pt-4">
            {/* <div>
            <Divider>
                <Chip label={`TOTAL PAID AMOUNT: ${formatter.format(0)}`} />{" "}
            </Divider>
            </div> */}
            {/* {filters ? (
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
            )} */}
            <div className="pt-4">
            <Table
                columns={columns}
                dataSource={sortedTransactions}
                size="middle"
                pagination={{ defaultPageSize: 10, size: "middle" }}
            />
            </div>
        </div>
        </div>
    );
};

export default AccountTransactions;
