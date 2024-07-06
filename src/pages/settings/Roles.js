import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Button, Popconfirm, Table } from "antd";
import Delete from "@mui/icons-material/Delete";
import { addRoles, selectRoles } from "../../features/settingSlice";
import AddRole from "./AddRole";
import EditRole from "./EditRole";
import { toast } from "react-hot-toast";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "User Role",
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
    render: (_, role) => (
      <div className="flex flex-row gap-1 justify-start">
        <EditRole role={role} />
        <DeleteRole role={role} />
      </div>
    ),
  },
];

const DeleteRole = ({ role }) => {
  const dispatch = useDispatch();

  const getRoles = async () => {
    let rolesArray = [];

    const querySnapshot = await getDocs(collection(db, "roles"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      rolesArray.push(data);
    });

    if (rolesArray.length > 0) {
      dispatch(addRoles(rolesArray));
    }
  };

  const confirmDelete = async () => {
    //delete designation
    try {
      const dataRef = doc(db, "roles", role?.id);

      await deleteDoc(dataRef)
        .then(() => {
          toast.success("Role is deleted successful");
          getRoles();
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
      title="Delete Role"
      description="Are you sure to delete this role?"
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

const Roles = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getRoles = async () => {
      let rolesArray = [];

      const querySnapshot = await getDocs(collection(db, "roles"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        rolesArray.push(data);
      });

      if (rolesArray.length > 0) {
        dispatch(addRoles(rolesArray));
      }
    };

    getRoles();
  }, [dispatch]);

  const userRoles = useSelector(selectRoles);

  const roles = userRoles.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedRoles = roles.map((role, index) => {
    const key = index + 1;
    return { ...role, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddRole />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedRoles}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Roles;
