import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../../features/userSlice";
import moment from "moment";
import { IconButton } from "@mui/material";
import { RemoveRedEye } from "@mui/icons-material";
import { Modal } from "antd";

const Description = ({ data, title }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const user = useSelector(selectUserInfo);

    const addedTime = moment.unix(data?.created_at?.seconds || data?.created_at?._seconds).format("DD-MM-YYYY");
    const updateTime = moment.unix(data?.updated_at?.seconds || data?.created_at?._seconds).format("DD-MM-YYYY");

    return (
        <>
        <IconButton variant="outlined" onClick={showModal}>
            <RemoveRedEye className="text-[#0A365C] cursor-pointer" />
        </IconButton>

        <Modal
            title={`${title}`}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            zIndex={800}
            okType="default"
            cancelButtonProps={{
            className: "hidden",
            }}
        >
            <div className="flex flex-col">
            <p>
                Description :{" "}
                {data?.description ? <span>{data?.description}</span> : null}
            </p>
            <br />
            <br />
            {user?.role?.toLocaleLowerCase() === "admin" ? (
                <>
                <p>
                    Created by :{" "}
                    {data?.created_by ? (
                    <span>
                        {data?.created_by?.name}
                        <span className="text-xs">
                        ({data?.created_by?.role})
                        </span>
                    </span>
                    ) : null}
                </p>
                <p>
                    Created at :{" "}
                    {data?.created_at ? <span>{addedTime}</span> : null}
                </p>
                <p>
                    Updated by :{" "}
                    {data?.updated_by ? (
                    <span>
                        {data?.updated_by?.name}
                        <span className="text-xs">
                        ({data?.updated_by?.role})
                        </span>
                    </span>
                    ) : null}
                </p>
                <p>
                    Updated at :{" "}
                    {data?.updated_at ? <span>{updateTime}</span> : null}
                </p>
                </>
            ) : null}
            </div>
        </Modal>
        </>
    );
};

    export default Description;
