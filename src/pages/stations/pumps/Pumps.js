import React, { useEffect, useState } from "react";
import { db } from "../../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import AddPump from "./AddPump";
import { addPumps, selectPumps } from "../../../features/stationSlice";
import PumpCard from "../cards/PumpCard";
import { useParams } from "react-router-dom";

const Pumps = () => {
  const [pageLoading, setPageLoading] = useState(false);

  const dispatch = useDispatch();
  const {stationID} = useParams();

  useEffect(() => {
    const getPumps = async () => {
      let pumpsArray = [];
      setPageLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "stations", stationID, "pumps")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        pumpsArray.push(data);
      });

      if (pumpsArray.length > 0) {
        dispatch(addPumps(pumpsArray));
        setPageLoading(false);
      } else {
        dispatch(addPumps([]));
        setPageLoading(false);
      }
    };

    getPumps();
  }, [dispatch, stationID]);

  const pumps = useSelector(selectPumps);

  const sortedPumps = pumps
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((pump, index) => ({ ...pump, key: index + 1 }));

  return (
    <div className="relative">
      {pageLoading ? (
        <div className="py-4 w-full flex justify-center items-center overflow-hidden">
          <div className="absolute bg-white bg-opacity-70 z-10 h-screen w-full flex items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4"></div>
          </div>
        </div>
      ) : null}
      <div className="px-2">
        <div className="flex flex-row justify-end items-end py-4 px-2">
          <AddPump />
        </div>
        <div className="pt-8">
          {sortedPumps?.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 py-3">
              {sortedPumps.map((pump) => {
                return <PumpCard pump={pump} />;
              })}
            </div>
          ) : (
            <>
              {pageLoading ? null : (
                <div className="text-xl font-light text-center">
                  Sorry! No data
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pumps;
