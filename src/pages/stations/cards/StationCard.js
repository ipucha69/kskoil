import React from "react";
import Card from "@mui/material/Card";
import { useDispatch } from "react-redux";
import { addStationDetails, addStations } from "../../../features/stationSlice";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../../App";
import { Popconfirm, Button } from "antd";
import { Delete } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DeleteStation = ({ station }) => {
  const dispatch = useDispatch();

  const getStations = async () => {
    let stationsArray = [];

    const querySnapshot = await getDocs(collection(db, "stationBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      stationsArray.push(data);
    });

    if (stationsArray.length > 0) {
      dispatch(addStations(stationsArray));
    }
  };

  const confirmDelete = async () => {
    //delete station
    try {
      const dataRef = doc(db, "stationBucket", station?.id);

      await deleteDoc(dataRef)
        .then(() => {
          toast.success("Station is deleted successful");
          getStations();
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
      title="Delete Station"
      description={`Are you sure to delete ${station?.name} station?`}
      okText="Yes"
      cancelText="No"
      okButtonProps={{
        className: "bg-primaryColor",
      }}
      onConfirm={() => confirmDelete()}
    >
      <Button type="text" shape="circle" className="flex justify-center mt-1">
        <Delete className="text-red-500 text-xl cursor-pointer" />
      </Button>
    </Popconfirm>
  );
};

const StationCard = ({ station }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSelectedStation = () => {
    dispatch(addStationDetails(station));
    navigate(`/stations/${station?.id}`);
  };

  return (
    <div>
      <Card sx={{ width: 300, height: 150, bgcolor: "#E5E9ED" }}>
        <div
          className="px-4 cursor-pointer py-1 text-primaryColor"
          onClick={() => handleSelectedStation()}
        >
          <h4 className="py-1 font-light">
            STATION : <span className="">{station?.name}</span>
          </h4>
          <h4 className="py-1 font-light">
            Location : <span className="">{station?.location}</span>
          </h4>
          <h4 className="py-1 font-light">
            STATUS :{" "}
            {station?.status ? (
              <span className="text-green">OPEN</span>
            ) : (
              <span className="text-red">CLOSED</span>
            )}
          </h4>
        </div>
        <div className="px-4 flex flex-row">
          <p
            className="w-[90%] cursor-pointer"
            onClick={() => handleSelectedStation()}
          ></p>
          <p className="w-[10%]  flex flex-row justify-end items-end">
            <DeleteStation station={station} />
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StationCard;
