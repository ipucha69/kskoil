import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { RemoveRedEye } from "@mui/icons-material";
import {
  addCustomerDetails,
  addFilteredPrivateCustomers,
  addPrivateCustomers,
  selectFilteredPrivateCustomers,
  selectPrivateCustomers,
} from "../../features/customerSlice";
import EditCustomer from "./EditCustomer";
import { formatter } from "../../helpers/Helpers";
import AddPrivateCustomer from "./AddPrivateCustomer";

const { Search } = Input;

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Customer Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Customer Contact",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "Debt",
    dataIndex: "debt",
    key: "debt",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "View",
    key: "view",
    render: (_, customer) => (
      <p className="flex flex-row gap-1 justify-start">
        <ViewCustomer customer={customer} />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, customer) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditCustomer customer={customer} />
      </p>
    ),
  },
];

const ViewCustomer = ({ customer }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleViewCustomer = () => {
    dispatch(addCustomerDetails(customer));
    navigate(`/customers/${customer?.id}`);
  };

  return (
    <p className="mt-1">
      <IconButton onClick={() => handleViewCustomer()}>
        <RemoveRedEye className="text-[#0A365C] text-xl cursor-pointer" />
      </IconButton>
    </p>
  );
};

const PrivateCustomers = () => {
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const getCustomers = async () => {
      let customersArray = [];

      setPageLoading(true);
      const q = query(collection(db, "customerBucket"), where("private", "==", true));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        customersArray.push(data);
      });

      if (customersArray.length > 0) {
        dispatch(addPrivateCustomers(customersArray));
        setPageLoading(false);
      } else {
        dispatch(addPrivateCustomers([]));
        setPageLoading(false);
      }
    };

    getCustomers();
  }, [dispatch]);

  const customers = useSelector(selectPrivateCustomers);

  const sortedCustomers = customers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((customer, index) => ({ ...customer, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedCustomers = customers.filter((customer) => {
        // const name = customer?.name.toLocaleLowerCase();

        return customer?.name?.toLocaleLowerCase()?.includes(text);
      });

      // Update state with filtered customers
      dispatch(addFilteredPrivateCustomers(searchedCustomers));
      setFilters(true);
    } else {
      // Update state with filtered customers
      dispatch(addFilteredPrivateCustomers([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered customers
      dispatch(addFilteredPrivateCustomers([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredCustomers = useSelector(selectFilteredPrivateCustomers);

  const sortedFilteredCustomers = filteredCustomers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((customer, index) => ({ ...customer, key: index + 1 }));

  return (
    <div className="relative">
    {pageLoading ? (
      <div className="py-4 w-full flex justify-center items-center overflow-hidden">
        <div className="absolute bg-white bg-opacity-70 z-10 min-h-screen w-full flex items-center justify-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4"></div>
        </div>
      </div>
    ) : null}
      <div className="flex flex-row gap-8 justify-end items-end py-4 px-2">
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
        <AddPrivateCustomer />
      </div>
      <div className="pt-4">
        {filters ? (
          <>
            <div className="pt-4">
              <Table
                columns={columns}
                dataSource={sortedFilteredCustomers}
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
                dataSource={sortedCustomers}
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

export default PrivateCustomers;
