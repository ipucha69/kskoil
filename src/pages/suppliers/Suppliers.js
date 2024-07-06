import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input, Table, Popconfirm, Button } from "antd";
import AddSupplier from "./AddSupplier";
import {
  addFilteredSuppliers,
  addSupplierDetails,
  addSuppliers,
  selectFilteredSuppliers,
  selectSuppliers,
} from "../../features/supplierSlice";
import EditSupplier from "./EditSupplier";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Delete, RemoveRedEye } from "@mui/icons-material";
import { toast } from "react-hot-toast";

const { Search } = Input;

const formatter = new Intl.NumberFormat("en-US");

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Supplier Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Supplier Contact",
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
    render: (_, supplier) => (
      <div className="flex flex-row gap-1 justify-start">
        <ViewSupplier supplier={supplier} />
      </div>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, supplier) => (
      <div className="flex flex-row gap-1 justify-start">
        <EditSupplier supplier={supplier} />
        {/* <DeleteSupplier supplier={supplier} /> */}
      </div>
    ),
  },
];

const ViewSupplier = ({ supplier }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleViewSupplier = () => {
    dispatch(addSupplierDetails(supplier));
    navigate(`/suppliers/${supplier?.id}`);
  };

  return (
    <p className="mt-1">
      <IconButton onClick={() => handleViewSupplier()}>
        <RemoveRedEye className="text-[#0A365C] text-xl cursor-pointer" />
      </IconButton>
    </p>
  );
};

const DeleteSupplier = ({ supplier }) => {
  const dispatch = useDispatch();

  const getSuppliers = async () => {
    let suppliersArray = [];

    const querySnapshot = await getDocs(collection(db, "supplierBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      suppliersArray.push(data);
    });

    if (suppliersArray.length > 0) {
      dispatch(addSuppliers(suppliersArray));
    }
  };

  const confirmDelete = async () => {
    //delete supplier
    try {
      //check if supplier had transactions, balances and expenses
      const dataRef = doc(db, "suppliers", supplier?.id, "account", "info");

      await deleteDoc(dataRef)
        .then(() => {
          toast.success("Supplier is deleted successful");
          getSuppliers();
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Popconfirm
      title="Delete Supplier"
      description="Are you sure to delete this supplier?"
      okText="Yes"
      cancelText="No"
      onConfirm={() => confirmDelete()}
    >
      <Button type="text" shape="circle" className="flex justify-center mt-1">
        <Delete className="text-red-500 text-xl cursor-pointer" />
      </Button>
    </Popconfirm>
  );
};

const Suppliers = () => {
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const getSuppliers = async () => {
      let suppliersArray = [];

      setPageLoading(true);

      const querySnapshot = await getDocs(collection(db, "supplierBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        suppliersArray.push(data);
      });

      if (suppliersArray.length > 0) {
        dispatch(addSuppliers(suppliersArray));
        setPageLoading(false);
      } else {
        dispatch(addSuppliers([]));
        setPageLoading(false);
      }
    };

    getSuppliers();
  }, [dispatch]);

  const suppliers = useSelector(selectSuppliers);

  const sortedSuppliers = suppliers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((supplier, index) => ({ ...supplier, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedSuppliers = suppliers.filter((supplier) => {
        // const name = supplier?.supplierName.toLocaleLowerCase();

        return supplier?.supplierName?.toLocaleLowerCase()?.includes(text);
      });

      // Update state with filtered suppliers
      dispatch(addFilteredSuppliers(searchedSuppliers));
      setFilters(true);
    } else {
      // Update state with filtered suppliers
      dispatch(addFilteredSuppliers([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered suppliers
      dispatch(addFilteredSuppliers([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredSuppliers = useSelector(selectFilteredSuppliers);

  const sortedFilteredSuppliers = filteredSuppliers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((supplier, index) => ({ ...supplier, key: index + 1 }));

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
              placeholder="Search supplier name"
              allowClear
              onChange={(e) => handleSearchText(e.target.value)}
              onSearch={() => handleOnSearchChange()}
            />
          </Space.Compact>
        </div>
        <AddSupplier />
      </div>
      <div className="pt-4">
        {filters ? (
          <>
            <div className="pt-4">
              <Table
                columns={columns}
                dataSource={sortedFilteredSuppliers}
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
                dataSource={sortedSuppliers}
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

export default Suppliers;
