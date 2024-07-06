import React from "react";
import Card from "@mui/material/Card";
import { useDispatch, useSelector } from "react-redux";
import { addPumpDetails, addPumps } from "../../../features/stationSlice";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../../App";
import { Popconfirm, Button } from "antd";
import { Delete } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { selectUserInfo } from "../../../features/userSlice";

const DeletePump = ({ pump }) => {
  const dispatch = useDispatch();
  const functions = getFunctions();

  const user = useSelector(selectUserInfo);

  const getPumps = async () => {
    let pumpsArray = [];

    const querySnapshot = await getDocs(collection(db, "pumpBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      pumpsArray.push(data);
    });

    if (pumpsArray.length > 0) {
      dispatch(addPumps(pumpsArray));
    } else {
      dispatch(addPumps([]));
    }
  };

  const confirmDelete = async () => {
    //delete pump
    try {
      //Remove pupm
      const removePump = httpsCallable(functions, "deletePump");
      removePump({
        pump,
        updated_by: { name: user?.name, role: user?.role },
      })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;

          toast.success(data.message);
          //fetch pumps
          getPumps();
        })
        .catch((error) => {
          const message = error.message;
          toast.error(message);
        });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Popconfirm
      title="Delete Station"
      description={`Are you sure to delete ${pump?.typeName} pump?`}
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

const PumpCard = ({ pump }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUserInfo);

  const { stationID } = useParams();

  const handleSelectedPump = () => {
    dispatch(addPumpDetails(pump));
    if (user?.role?.toLowerCase() === "manager") {
      navigate(`/station/${stationID}/pumps/${pump?.id}`);
    } else {
      navigate(`/stations/${stationID}/pumps/${pump?.id}`);
    }
  };

  return (
    <div>
      <Card sx={{ minWidth: 300, bgcolor: "#E5E9ED" }}>
        <div
          className="px-4 cursor-pointer py-1 text-primaryColor"
          onClick={() => handleSelectedPump()}
        >
          <h4 className="py-1 font-light">
            PUMP : {pump?.typeName} {pump?.name}
          </h4>
          <h4 className="py-1 font-light">
            STATUS :{" "}
            {pump?.status ? (
              <span className="text-green">OPEN</span>
            ) : (
              <span>CLOSED</span>
            )}
          </h4>
          <div className="flex flex-row justify-between py-1 font-light">
            <h4 className="w-[50%]">O.M : {pump?.om} Ltrs</h4>
            <h4 className="w-[50%]">
              C.M :{" "}
              {pump?.cm == pump.cm ? (
                <span>--</span>
              ) : (
                <span>{pump?.cm} Ltrs</span>
              )}
            </h4>
          </div>
        </div>
        <div className="px-4 flex flex-row">
          <p
            className="w-[90%] cursor-pointer"
            onClick={() => handleSelectedPump()}
          ></p>
          <p className="w-[10%] flex flex-row justify-end items-end">
            <DeletePump pump={pump} />
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PumpCard;
