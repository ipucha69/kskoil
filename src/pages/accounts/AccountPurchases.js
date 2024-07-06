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
  addAccountPurchases,
  selectAccountPurchases,
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
        title: "AGO",
        dataIndex: "agoLitres",
        key: "agoLitres",
        render: (text) => <p>{formatter.format(text)} Litres</p>,
    },
    {
        title: "AGO Price",
        dataIndex: "agoPrice",
        key: "agoPrice",
        render: (text) => <p>TZS {formatter.format(text)}</p>,
    },
    {
        title: "PMS",
        dataIndex: "pmsLitres",
        key: "pmsLitres",
        render: (text) => <p>{formatter.format(text)} Litres</p>,
    },
    {
        title: "PMS Price",
        dataIndex: "pmsPrice",
        key: "pmsPrice",
        render: (text) => <p>TZS {formatter.format(text)}</p>,
    },
    {
        title: "Total Quantity",
        dataIndex: "totalLitres",
        key: "totalLitres",
        render: (text) => <p>{formatter.format(text)} Litres</p>,
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
        render: (text) => (
        <p>{moment.unix(text?.seconds || text?._seconds).format("DD-MM-YYYY")}</p>
        ),
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
];

const AccountPurchases = () => {
    const dispatch = useDispatch();

    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState(false);

    useEffect(() => {
        const getPurchases = async () => {
        let purchaseArray = [];

        const querySnapshot = await getDocs(collection(db, "stockBucket"));
        querySnapshot.forEach((doc) => {
            //set data
            const data = doc.data();
            purchaseArray.push(data);
        });

        if (purchaseArray.length > 0) {
            dispatch(addAccountPurchases(purchaseArray));
        } else {
            dispatch(addAccountPurchases([]));
        }
        };

        getPurchases();
    }, [dispatch]);

    const purchases = useSelector(selectAccountPurchases);

    const sortedPurchases = purchases
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((purchase, index) => ({ ...purchase, key: index + 1 }));

    const handleOnSearchChange = () => {
        if (searchText) {
        const text = searchText.toLocaleLowerCase();
        const searchedPayments = purchases.filter((purchase) => {
            const name = purchase?.supplierName.toLocaleLowerCase();

            if (name.includes(text)) {
            return purchase;
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
                dataSource={sortedPurchases}
                size="middle"
                pagination={{ defaultPageSize: 10, size: "middle" }}
            />
            </div>
        </div>
        </div>
    );
};

export default AccountPurchases;
