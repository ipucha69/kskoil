import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Popconfirm, Switch, Table } from "antd";
import { addUsers, selectUsers, selectUserInfo } from "../../features/userSlice";
import AddUser from "./AddUser";
import toast from "react-hot-toast";
import { getFunctions, httpsCallable } from "firebase/functions";
import EditUser from "./EditUser";

const columns = [
    {
        title: "#",
        dataIndex: "key",
        key: "key",
        render: (text) => <p>{text}</p>,
    },
    {
        title: "Full Name",
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
        title: "Role",
        dataIndex: "role",
        key: "role",
    },
    {
        title: "Status",
        key: "status",
        render: (_, user) => (
        <>
            <UserStatus user={user} />
        </>
        ),
    },
    {
        title: "Actions",
        key: "action",
        render: (_, user) => (
        <div className="flex flex-row gap-1 justify-start">
            <EditUser user={user} />
            {/* <DeleteUser user={user} /> */}
        </div>
        ),
    },
];

const UserStatus = ({ user }) => {
    const dispatch = useDispatch();
    const functions = getFunctions();

    const userInfo = useSelector(selectUserInfo); 

    const getUsers = async () => {
        let usersArray = [];

        const querySnapshot = await getDocs(collection(db, "userBucket"));
        querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        usersArray.push(data);
        });

        if (usersArray.length > 0) {
            dispatch(addUsers(usersArray));
        }
    };

    const changeStatus = async () => {
        //update user status
        const updated_at = Timestamp.fromDate(new Date());

        const updateStatus = httpsCallable(functions, "updateUser");
        updateStatus({
        email: user?.email,
        role: user?.role,
        roleID: user?.roleID,
        name: user?.name,
        userID: user?.userID,
        disabled: user?.status,
        status: !user?.status,
        updated_at,
        updated_by: {name: userInfo?.name, role: userInfo?.role},
        })
        .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;

            toast.success(data.message);
            //fetch users
            getUsers();
        })
        .catch((error) => {
            // Getting the Error details.
            // const code = error.code;
            const message = error.message;
            // const details = error.details;
            console.log(error);
            toast.error(message);
        });
    };

    return (
        <Popconfirm
        title="Change Status"
        description={`Are you sure you want to ${
            user?.status ? "deactivate" : "activate"
        } this user?`}
        okText="Yes"
        cancelText="No"
        okButtonProps={{
            className: "bg-primaryColor",
        }}
        onConfirm={changeStatus}
        >
        <Switch
            checked={user?.status}
            className={user?.status ? null : `bg-zinc-300 rounded-full`}
        />
        </Popconfirm>
    );
};

const Users = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const getUsers = async () => {
        let usersArray = [];

        const querySnapshot = await getDocs(collection(db, "userBucket"));
        querySnapshot.forEach((doc) => {
            //set data
            const data = doc.data();
            usersArray.push(data);
        });

        if (usersArray.length > 0) {
            dispatch(addUsers(usersArray));
        }
        };

        getUsers();
    }, [dispatch]);

    const users = useSelector(selectUsers);

    const usersList = users.slice().sort((a, b) => b.created_at - a.created_at);
    const sortedUsers = usersList.map((user, index) => {
        const key = index + 1;
        return { ...user, key };
    });

    return (
        <div className="px-2">
        <div className="flex flex-row justify-end">
            <AddUser />
        </div>
        <div className="pt-8">
            <Table
            columns={columns}
            dataSource={sortedUsers}
            size="middle"
            pagination={{ defaultPageSize: 10, size: "middle" }}
            />
        </div>
        </div>
    );
};

export default Users;
