import React, { useEffect } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import { addPumpCards, selectPumpCards } from "../../../features/stationSlice";
import { useParams } from "react-router-dom";
import moment from "moment";
import Description from "../../common/Description";
import { formatter } from "../../../helpers/Helpers";
// import AddCard from "./AddCard";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Initial OM",
    dataIndex: "om",
    key: "om",
    render: (text) => <p>{formatter.format(text)}</p>,
  },
  {
    title: "Latest CM",
    dataIndex: "cm",
    key: "cm",
    render: (text) => <p>{formatter.format(text)}</p>,
  },
  {
    title: "Created",
    dataIndex: "created_at",
    key: "created_at",
    render: (text) => <p>{moment.unix(text?.seconds).format("DD-MM-YYYY")}</p>,
  },
  {
    title: "Status",
    dataIndex: "detail",
    key: "detail",
    // render: (text) => <p>{text?.status ? "ACTIVE" : "CORRUPTED"}</p>,
  },
  {
    title: "Description",
    key: "view",
    render: (_, price) => (
      <p className="flex flex-row gap-1 justify-start">
        <Description data={price} title={"Station Stock Descriptions"} />
      </p>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, price) => (
      <p className="flex flex-row gap-1 justify-start">
        {/* <EditPrice price={price} /> */}
      </p>
    ),
  },
];

const Cards = () => {
  const dispatch = useDispatch();
  const { stationID, pumpID } = useParams();

  useEffect(() => {
    const getCards = async () => {
      let pricesArray = [];

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "pumpCards", pumpID, "info")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        pricesArray.push(data);
      });

      if (pricesArray.length > 0) {
        dispatch(addPumpCards(pricesArray));
      } else {
        dispatch(addPumpCards([]));
      }
    };

    getCards();
  }, [dispatch, stationID, pumpID]);

  const cards = useSelector(selectPumpCards);
  console.log(cards);

  const sortedCards = cards
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((card, index) => ({ ...card, key: index + 1 }));

  return (
    <div className="px-2">
      {/* <div className="flex flex-row justify-end">
        <AddCard />
      </div> */}
      <div className="pt-4">
        <Table
          columns={columns}
          dataSource={sortedCards}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Cards;
