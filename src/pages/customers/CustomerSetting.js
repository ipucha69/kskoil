import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Popconfirm, Switch, Table } from "antd";
import { useParams } from "react-router-dom";
import {
  addCustomerSettings,
  selectCustomerSettings,
} from "../../features/customerSlice";
import Description from "../common/Description";
import AddDebtSetting from "./AddDebtSetting";
import { formatter } from "../../helpers/Helpers";
import EditDebtSetting from "./EditDebtSetting";
import moment from "moment";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Target",
    dataIndex: "targetName",
    key: "targetName",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Amount",
    dataIndex: "targetAmount",
    key: "targetAmount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Start Date",
    dataIndex: "start",
    key: "start",
    render: (text) => <p>{moment.unix(text?.seconds).format("DD-MM-YYY")}</p>,
  },
  {
    title: "Deadline",
    dataIndex: "deadline",
    key: "deadline",
    render: (text) => <p>{moment.unix(text?.seconds).format("DD-MM-YYY")}</p>,
  },
  {
    title: "Status",
    key: "status",
    render: (_, customerSetting) => (
      <p className="flex flex-row gap-1 justify-start">
       <SettingStatus debtSetting={customerSetting}/>
      </p>
    ),
  },
  {
    title: "View",
    key: "view",
    render: (_, customerSetting) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description
          data={customerSetting}
          title={"Customer Debt Setting Description"}
        />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, customerSetting) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditDebtSetting debtSetting={customerSetting} />
      </p>
    ),
  },
];

const SettingStatus = ({ debtSetting }) => {
  const dispatch = useDispatch();
  const {customerID} = useParams();

  const getCustomerSettings = async () => {
    let settingsArray = [];

    const querySnapshot = await getDocs(
      collection(db, "customers", customerID, "settings")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      settingsArray.push(data);
    });

    if (settingsArray.length > 0) {
      dispatch(addCustomerSettings(settingsArray));
    } else {
      dispatch(addCustomerSettings(settingsArray));
    }
  };

  const changeStatus = async () => {
   
  };

  return (
    <Popconfirm
      title="Change Status"
      description={`Are you sure you want to ${
        debtSetting?.status ? "deactivate" : "activate"
      } this customer debt setting?`}
      okText="Yes"
      cancelText="No"
      okButtonProps={{
        className: "bg-primaryColor",
      }}
      onConfirm={changeStatus}
    >
      <Switch
        checked={debtSetting?.status}
        className={debtSetting?.status ? null : `bg-zinc-300 rounded-full`}
      />
    </Popconfirm>
  );
};

const CustomerSetting = () => {
  const dispatch = useDispatch();

  const { customerID } = useParams();

  useEffect(() => {
    const getCustomerSettings = async () => {
      let settingsArray = [];

      const querySnapshot = await getDocs(
        collection(db, "customers", customerID, "settings")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        settingsArray.push(data);
      });

      if (settingsArray.length > 0) {
        dispatch(addCustomerSettings(settingsArray));
      } else {
        dispatch(addCustomerSettings(settingsArray));
      }
    };

    getCustomerSettings();
  }, [dispatch, customerID]);

  const customerSettings = useSelector(selectCustomerSettings);

  const sortedSettings = customerSettings
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((debtSetting, index) => ({ ...debtSetting, key: index + 1 }));

  return (
    <div className="">
      <div className="flex flex-row justify-end">
        <AddDebtSetting />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedSettings}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default CustomerSetting;
