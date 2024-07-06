import React, { useEffect, useState } from "react";
import { Button, message, Popconfirm, Steps, theme } from "antd";
import DaySales from "./DaySales";
import DayExpenses from "./DayExpenses";
import DayDebtors from "./DayDebtors";
import { useDispatch, useSelector } from "react-redux";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDayDebtors,
  addDaySale,
  selectDayDebtors,
  selectDaySale,
} from "../../../features/saleSlice";
import moment from "moment";
import toast from "react-hot-toast";
import { selectUserInfo } from "../../../features/userSlice";
import DaySalesTwoPrice from "./DaySalesTwoPrice";
import ChooseDaySales from "./ChooseDaySales";
import DayCashBook from "./DayCashBook";

const steps = [
  {
    title: "SALES",
    content: <ChooseDaySales />,
  },
  {
    title: "DEBTORS",
    content: <DayDebtors />,
  },
  {
    title: "EXPENSES",
    content: <DayExpenses />,
  },
  {
    title: "CASH BOOK",
    content: <DayCashBook />,
  },
];

const NewBook = () => {
  const [pageLoading, setPageLoading] = useState(false);

  const dispatch = useDispatch();
  const { stationID } = useParams();
  const functions = getFunctions();
  const navigate = useNavigate();

  useEffect(() => {
    const getSales = async () => {
      try {
        //fetch day book
        const daySalesBook = httpsCallable(functions, "fetchDayBook");
        daySalesBook({ stationID })
          .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            //add day
            const sales = data?.data?.dayBook;
            const debtors = data?.data?.debtors;
            console.log(data);
            console.log(sales);
            dispatch(addDaySale(sales));
            dispatch(addDayDebtors(debtors));
          })
          .catch((error) => {
            const message = error.message;
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    };

    getSales();
  }, [dispatch, stationID]);

  // useEffect(() => {
  //   const newB = () => {
  //     const addNewBook = httpsCallable(functions, "createNewBook");
  //     addNewBook({})
  //       .then((result) => {
  //         // Read result of the Cloud Function.
  //         const data = result.data;
  //       })
  //       .catch((error) => {
  //         const message = error.message;
  //         toast.error(message);
  //         console.log(error);
  //       });
  //   };

  //   newB();
  // }, []);

  const newB = () => {
    const addNewBook = httpsCallable(functions, "createNewBook");
    addNewBook({})
      .then((result) => {
        // Read result of the Cloud Function.
        const data = result.data;
      })
      .catch((error) => {
        const message = error.message;
        toast.error(message);
        console.log(error);
      });
  };

  const sales = useSelector(selectDaySale);
  const debtors = useSelector(selectDayDebtors);
  const user = useSelector(selectUserInfo);

  const momentDate = moment(sales?.day, "DD-MM-YYYY").format("ll");
  const nextValue = sales?.check;

  const totalDebtorsAmount = debtors?.reduce(
    (sum, debt) => sum + debt.stationTotalAmount,
    0
  );

  let debtValue = false;

  // if (sales?.stationDebtAmount !== totalDebtorsAmount) {
  //   debtValue = true;
  // }

  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));
  const contentStyle = {
    marginTop: 16,
  };

  const closeSalesBook = async () => {
    try {
      //close day book
      setPageLoading(true);
      const closeTheBook = httpsCallable(functions, "closeDayBook");
      closeTheBook({
        stationID,
        dayBookID: sales?.id,
        day: sales?.day,
        updated_by: { name: user?.name, role: user?.role },
      })
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          if (data?.status > 300) {
            toast.error(data.message);
          } else {
            toast.success(data.message);
            navigate(`/stations`);
          }
          setPageLoading(false);
        })
        .catch((error) => {
          const message = error.message;
          toast.error(message);
          console.log(error);
          setPageLoading(false);
        });
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setPageLoading(false);
    }
  };

  return (
    <div className="relative">
      {pageLoading ? (
        <div className="py-4 w-full flex justify-center items-center overflow-hidden">
          <div className="absolute bg-white bg-opacity-70 z-10 h-screen w-full flex items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4"></div>
          </div>
        </div>
      ) : null}
      <Steps current={current} items={items} />
      <div style={contentStyle} className="min-h-[200px]">
        {steps[current].content}
      </div>
      <div
        style={{
          marginTop: 24,
        }}
      >
        {/* <Button
          className="bg-primaryColor text-white hover:text-white"
          style={{
            margin: "0 40px",
          }}
          onClick={newB}
        >
          TRIAL
        </Button> */}
        {current < steps.length - 1 && (
          <Button
            type="primary"
            disabled={current < 1 ? !nextValue : debtValue}
            className="bg-blue-500"
            onClick={() => next()}
          >
            Next
          </Button>
        )}
        {current > 0 && (
          <Button
            style={{
              margin: "0 10px",
            }}
            onClick={() => prev()}
          >
            Previous
          </Button>
        )}
        {current === steps.length - 1 && (
          <Popconfirm
            title="CLOSE DAY SALES BOOK"
            description={`Are you sure you want to close ${momentDate} sales book`}
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              className: "bg-primaryColor",
            }}
            onConfirm={closeSalesBook}
          >
            <Button
              disabled={pageLoading}
              className="bg-primaryColor text-white hover:text-white"
              style={{
                margin: "0 40px",
              }}
            >
              CONFIRM AND CLOSE DAY BOOK
            </Button>
          </Popconfirm>
        )}
      </div>
    </div>
  );
};
export default NewBook;
