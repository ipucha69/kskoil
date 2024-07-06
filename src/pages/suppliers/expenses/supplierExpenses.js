import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Input, Table, } from "antd";
import { useParams } from "react-router-dom";
import { Chip, Divider, } from "@mui/material";
import {
  addSupplierFilteredPurchases,
  addSupplierPurchases,
  selectSupplierFilteredPurchases,
  selectSupplierPurchases,
} from "../../../features/supplierSlice";
import moment from "moment";
import Description from "../../common/Description";

const formatter = new Intl.NumberFormat("en-US");

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
    title: "PMS",
    dataIndex: "pmsLitres",
    key: "pmsLitres",
    render: (text) => <p>{formatter.format(text)} Litres</p>,
  },
  {
    title: "Total Quantity",
    dataIndex: "totalLitres",
    key: "totalLitres",
    render: (text) => <p>{formatter.format(text)} Litres</p>,
  },
  {
    title: "Total Price",
    dataIndex: "totalPrice",
    key: "totalPrice",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (text) => <p>{moment.unix(text?.seconds).format("DD-MM-YYYY")}</p>,
  },
  {
    title: "Description",
    key: "description",
    render: (_, expense) => (
      <div className="flex flex-row gap-1 justify-start">
        <Description data={expense} title={"Supplier Expense Descriptions"} />
      </div>
    ),
  },
];

const SupplierExpenses = () => {
  const dispatch = useDispatch();

  const { supplierID } = useParams();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);

  useEffect(() => {
    const getSupplierPurchases = async () => {
      let purchaseArray = [];

      const querySnapshot = await getDocs(
        collection(db, "suppliers", supplierID, "purchases")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        purchaseArray.push(data);
      });

      if (purchaseArray.length > 0) {
        dispatch(addSupplierPurchases(purchaseArray));
      }
    };

    getSupplierPurchases();
  }, [dispatch, supplierID]);

  const purchases = useSelector(selectSupplierPurchases);

  const sortedPurchases = purchases
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((purchase, index) => ({ ...purchase, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedExpenses = purchases.filter((purchase) => {
        const name = purchase?.agoLitres.toLocaleLowerCase();

        if (name.includes(text)) {
          return purchase;
        }
      });

      // Update state with filtered purchases
      dispatch(addSupplierFilteredPurchases(searchedExpenses));
      setFilters(true);
    } else {
      // Update state with filtered purchases
      dispatch(addSupplierFilteredPurchases([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered purchases
      dispatch(addSupplierFilteredPurchases([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredPurchases = useSelector(selectSupplierFilteredPurchases);

  const sortedFilteredPurchases = filteredPurchases
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((purchase, index) => ({ ...purchase, key: index + 1 }));

  const totalAmount = purchases.reduce(
    (sum, purchase) => sum + purchase.totalPrice,
    0
  );

  const totalLitres = purchases.reduce(
    (sum, purchase) => sum + purchase.totalLitres,
    0
  );

  return (
    <div className="">
      <div className="pt-8">
        <div>
          <Divider>
            <Chip
              label={`TOTAL PURCHASED LITRES: ${formatter.format(totalLitres)}`}
            />{" "}
            <Chip
              label={`TOTAL PURCHASES AMOUNT: ${formatter.format(totalAmount)}`}
            />{" "}
          </Divider>
        </div>
        {filters ? (
          <>
            <div className="pt-8">
              <Table
                columns={columns}
                dataSource={sortedFilteredPurchases}
                size="middle"
                pagination={{ defaultPageSize: 10, size: "middle" }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="pt-8">
              <Table
                columns={columns}
                dataSource={sortedPurchases}
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

export default SupplierExpenses;
