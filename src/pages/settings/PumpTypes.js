import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Button, Popconfirm, Table } from "antd";
import Delete from "@mui/icons-material/Delete";
import { addPumpTypes, selectPumpTypes } from "../../features/settingSlice";
import { toast } from "react-hot-toast";
import AddPumpType from "./AddPumpType";
import EditPumpType from "./EditPumpType";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Pump Type",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (text) => <>{text}</>,
  },
  {
    title: "Actions",
    key: "action",
    render: (_, pump) => (
      <div className="flex flex-row gap-1 justify-start">
        <EditPumpType pump={pump} />
        <DeletePumpType pump={pump} />
      </div>
    ),
  },
];

const DeletePumpType = ({ pump }) => {
  const dispatch = useDispatch();

  const getTypes = async () => {
    let typesArray = [];

    const querySnapshot = await getDocs(collection(db, "pumpTypes"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      typesArray.push(data);
    });

    if (typesArray.length > 0) {
      dispatch(addPumpTypes(typesArray));
    }
  };

  const confirmDelete = async () => {
    //delete designation
    try {
      const dataRef = doc(db, "pumpTypes", pump?.id);

      await deleteDoc(dataRef)
        .then(() => {
          toast.success("Pump type is deleted successful");
          getTypes();
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
        });
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <Popconfirm
      title="Delete Designation"
      description="Are you sure to delete this type?"
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

const PumpTypes = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getTypes = async () => {
      let typesArray = [];

      const querySnapshot = await getDocs(collection(db, "pumpTypes"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        typesArray.push(data);
      });

      if (typesArray.length > 0) {
        dispatch(addPumpTypes(typesArray));
      }
    };

    getTypes();
  }, [dispatch]);

  const pumpTypes = useSelector(selectPumpTypes);

  const pumps = pumpTypes.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedPumps = pumps.map((role, index) => {
    const key = index + 1;
    return { ...role, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddPumpType />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedPumps}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default PumpTypes;
