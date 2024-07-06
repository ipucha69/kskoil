import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Space, Input } from "antd";
import {
  addFilteredStations,
  addStations,
  selectFilteredStations,
  selectStations,
} from "../../features/stationSlice";
import AddStation from "./AddStation";
import StationCard from "./cards/StationCard";

const { Search } = Input;

const Stations = () => {
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const getStations = async () => {
      let stationsArray = [];
      setPageLoading(true);

      const querySnapshot = await getDocs(collection(db, "stationBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        stationsArray.push(data);
      });

      if (stationsArray.length > 0) {
        dispatch(addStations(stationsArray));
        setPageLoading(false);
      } else {
        dispatch(addStations([]));
        setPageLoading(false);
      }
    };

    getStations();
  }, [dispatch]);

  const stations = useSelector(selectStations);

  const sortedStations = stations
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((station, index) => ({ ...station, key: index + 1 }));

  const handleOnSearchChange = () => {
    if (searchText) {
      const text = searchText.toLocaleLowerCase();
      const searchedStations = stations.filter((station) => {
        const name = station?.name.toLocaleLowerCase();

        if (name.includes(text)) {
          return station;
        }
      });

      // Update state with filtered stations
      dispatch(addFilteredStations(searchedStations));
      setFilters(true);
    } else {
      // Update state with filtered stations
      dispatch(addFilteredStations([]));
      setFilters(false);
    }
  };

  const handleSearchText = (value) => {
    if (value) {
      setSearchText(value);
    } else {
      // Update state with filtered stations
      dispatch(addFilteredStations([]));
      setFilters(false);
      setSearchText(value);
    }
  };

  const filteredStations = useSelector(selectFilteredStations);

  const sortedFilteredStations = filteredStations
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((station, index) => ({ ...station, key: index + 1 }));

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
        <div className="flex flex-row gap-8 justify-end items-end py-4 px-2">
          <div>
            <Space.Compact size="large">
              <Search
                placeholder="Search station name"
                allowClear
                onChange={(e) => handleSearchText(e.target.value)}
                onSearch={() => handleOnSearchChange()}
              />
            </Space.Compact>
          </div>
          <AddStation />
        </div>
        <div className="pt-8">
          {filters ? (
            <>
              {filteredStations?.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 py-3">
                  {sortedFilteredStations.map((station, index) => {
                    return <StationCard station={station} key={index}/>;
                  })}
                </div>
              ) : (
                <div className="text-xl font-light text-center">
                  Sorry! No data
                </div>
              )}
            </>
          ) : (
            <>
              {sortedStations?.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 py-3">
                  {sortedStations.map((station, index) => {
                    return <StationCard station={station} key={index}/>;
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stations;
