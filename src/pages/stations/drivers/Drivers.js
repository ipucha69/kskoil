import React, { useEffect } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import {
  addStationDrivers,
  selectStationDrivers,
} from "../../../features/stationSlice";
import { useParams } from "react-router-dom";
import Description from "../../common/Description";
import AddDriver from "./AddDriver";
import EditDriver from "./EditDriver";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Truck Number",
    dataIndex: "truckNumber",
    key: "truckNumber",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Licence Number",
    dataIndex: "licence",
    key: "licence",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Phone Number",
    dataIndex: "phone",
    key: "phone",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Description",
    key: "view",
    render: (_, driver) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={driver} title={"Driver Descriptions"} />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, driver) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditDriver driver={driver} />
      </p>
    ),
  },
];

const Drivers = () => {
  const dispatch = useDispatch();
  const { stationID } = useParams();

  useEffect(() => {
    const getDrivers = async () => {
      let driversArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "drivers")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        driversArray.push(data);
      });

      if (driversArray.length > 0) {
        dispatch(addStationDrivers(driversArray));
      } else {
        dispatch(addStationDrivers([]));
      }
    };

    getDrivers();
  }, [dispatch, stationID]);

  const drivers = useSelector(selectStationDrivers);

  const sortedDrivers = drivers
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((driver, index) => ({ ...driver, key: index + 1 }));

  return (
    <div className="">
      <div className="flex flex-row justify-end">
        <AddDriver />
      </div>
      <div className="pt-4">
        <Table
          columns={columns}
          dataSource={sortedDrivers}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Drivers;
