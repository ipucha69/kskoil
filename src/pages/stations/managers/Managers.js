import React, { useEffect } from "react";
import { db } from "../../../App";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Popconfirm, Switch, Table } from "antd";
import toast from "react-hot-toast";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  addStationManagers,
  selectStationManagers,
} from "../../../features/stationSlice";
import AddManager from "./AddManager";
import { useParams } from "react-router-dom";
import EditManager from "./EditManager";
import Description from "../../common/Description";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Manager Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Status",
    key: "status",
    render: (_, manager) => (
      <>
        <ManagerStatus manager={manager} />
      </>
    ),
  },
  {
    title: "Description",
    key: "view",
    render: (_, manager) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={manager} title={"Station Stock Descriptions"} />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, manager) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditManager manager={manager} />
        {/* <DeleteUser user={user} /> */}
      </p>
    ),
  },
];

const ManagerStatus = ({ manager }) => {
  const dispatch = useDispatch();
  const functions = getFunctions();

  const getManagers = async () => {
    let managersArray = [];

    const querySnapshot = await getDocs(
      collection(db, "stations", manager?.stationID, "managers")
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      managersArray.push(data);
    });

    if (managersArray.length > 0) {
      dispatch(addStationManagers(managersArray));
    }
  };

  const changeStatus = async () => {
    //update user status
    const updated_at = Timestamp.fromDate(new Date());

    const updateStatus = httpsCallable(functions, "updateuser");
    updateStatus({
      email: manager?.email,
      name: manager?.name,
      stationID: manager?.stationID,
      managerID: manager?.managerID,
      disabled: manager?.status,
      status: !manager?.status,
      updated_at,
    })
      .then((result) => {
        // Read result of the Cloud Function.
        const data = result.data;

        toast.success(data.message);
        //fetch users
        getManagers();
      })
      .catch((error) => {
        const message = error.message;
        console.log(error);
        toast.error(message);
      });
  };

  return (
    <Popconfirm
      title="Change Status"
      description={`Are you sure you want to ${
        manager?.status ? "deactivate" : "activate"
      } this manager?`}
      okText="Yes"
      cancelText="No"
      okButtonProps={{
        className: "bg-primaryColor",
      }}
      onConfirm={changeStatus}
    >
      <Switch
        checked={manager?.status}
        className={manager?.status ? null : `bg-zinc-300 rounded-full`}
      />
    </Popconfirm>
  );
};

const Managers = () => {
  const dispatch = useDispatch();
  const { stationID } = useParams();

  useEffect(() => {
    const getManagers = async () => {
      let managersArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "managers")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        managersArray.push(data);
      });

      if (managersArray.length > 0) {
        dispatch(addStationManagers(managersArray));
      }
    };

    getManagers();
  }, [dispatch, stationID]);

  const managers = useSelector(selectStationManagers);

  const sortedManagers = managers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((manager, index) => ({ ...manager, key: index + 1 }));

  return (
    <div className="">
      <div className="flex flex-row justify-end">
        <AddManager />
      </div>
      <div className="pt-4">
        <Table
          columns={columns}
          dataSource={sortedManagers}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Managers;
