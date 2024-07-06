import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import Description from "../common/Description";
import {
    addAccountDebtors,
    selectAccountDebtors,
} from "../../features/accountSlice";
import { formatter } from "../../helpers/Helpers";

const columns = [
    {
        title: "#",
        dataIndex: "key",
        key: "key",
        render: (text) => <p>{text}</p>,
    },
    {
        title: "Customer",
        dataIndex: "customerName",
        key: "customerName",
    },
    {
        title: "Station",
        dataIndex: "stationName",
        key: "stationName",
        render: (text) => <p>{text}</p>,
    },
    {
        title: "Truck",
        dataIndex: "truck",
        key: "truck",
        render: (text) => <p>{text}</p>,
    },
    {
        title: "Fuel",
        dataIndex: "fuel",
        key: "fuel",
        render: (text) => <p>{text}</p>,
    },
    {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        render: (text) => <p>{formatter.format(text)} Litres</p>,
    },
    {
        title: "Price",
        dataIndex: "customerPrice",
        key: "customerPrice",
        render: (text) => <p>TZS {formatter.format(text)}</p>,
    },
    {
        title: "Total Amount",
        dataIndex: "totalAmount",
        key: "totalAmount",
        render: (text) => <p>TZS {formatter.format(text)}</p>,
    },
    {
        title: "View",
        key: "view",
        render: (_, debtor) => (
        <p className="flex flex-row gap-1 justify-start">
            <Description data={debtor} title={"Debtor Description"} />
        </p>
        ),
    },
];

const AccountDebtors = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const getDebtors = async () => {
        let debtorsArray = [];

        const querySnapshot = await getDocs(collection(db, "debtorBucket"));
        querySnapshot.forEach((doc) => {
            //set data
            const data = doc.data();
            debtorsArray.push(data);
        });

        if (debtorsArray.length > 0) {
            dispatch(addAccountDebtors(debtorsArray));
        } else {
            dispatch(addAccountDebtors([]));
        }
        };

        getDebtors();
    }, [dispatch]);

    const debtors = useSelector(selectAccountDebtors);

    const sortedDebtors = debtors
        .slice()
        .sort((a, b) => new Date(b.day) - new Date(a.day))
        .map((debtor, index) => ({ ...debtor, key: index + 1 }));

    return (
        <div className="px-2">
        <div className="pt-4">
            <Table
            columns={columns}
            dataSource={sortedDebtors}
            size="middle"
            pagination={{ defaultPageSize: 10, size: "middle" }}
            />
        </div>
        </div>
    );
};

export default AccountDebtors;
