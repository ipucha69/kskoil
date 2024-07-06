import { Card } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../assets/utils/colors";
import {
  GiGasPump,
  GiMoneyStack,
  GiTakeMyMoney,
  GiReceiveMoney,
  GiPayMoney,
} from "react-icons/gi";
import { LuGauge } from "react-icons/lu";
import { MdOutlineAccountBalance, MdOutlinePointOfSale } from "react-icons/md";
import { Segmented } from "antd";
import { DatePicker, Space } from "antd";
import { Pie, measureTextWidth, Line, Column } from "@ant-design/plots";
import { getFunctions, httpsCallable } from "firebase/functions";
import { addAppAnalysis, selectAvailableStock, selectFuelAnalytics, selectStationSalesAnalytics, selectStationsSalesPercentage, selectTotalCashSales, selectTotalDebtSales, selectTotalExpensesAmount, selectTotalPurchases, selectTotalSales, selectTotalStations } from "../features/appSlice";

const DemoPie = () => {
    function renderStatistic(containerWidth, text, style) {
        const { width: textWidth, height: textHeight } = measureTextWidth(
            text,
            style
        );
        const R = containerWidth / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2

        let scale = 1;

        if (containerWidth < textWidth) {
            scale = Math.min(
                Math.sqrt(
                Math.abs(
                    Math.pow(R, 2) /
                    (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2))
                )
                ),
                1
            );
        }

        const textStyleStr = `width:${containerWidth}px;`;
        return `<div style="${textStyleStr};font-size:${scale}em;line-height:${
            scale < 1 ? 1 : "inherit"
        };">${text}</div>`;
    }

    const data = [
        {
        type: "Chalinze",
        value: 20,
        },
        {
        type: "Dar",
        value: 19,
        },
        {
        type: "Tanga",
        value: 18,
        },
        {
        type: "Mkata",
        value: 15,
        },
        {
        type: "Lushoto",
        value: 10,
        },
        {
        type: "Korogwe",
        value: 7,
        },
        {
        type: "Handeni",
        value: 6,
        },
        {
        type: "Kabuku",
        value: 5,
        },
    ];

    const config = {
        appendPadding: 10,
        data,
        angleField: "value",
        colorField: "type",
        radius: 1,
        innerRadius: 0.64,
        meta: {
        value: {
            formatter: (v) => `TZS ${v}`,
        },
        },
        label: {
        type: "inner",
        offset: "-50%",
        style: {
            textAlign: "center",
        },
        autoRotate: false,
        content: "{value}",
        },
        statistic: {
        title: {
            offsetY: -4,
            style: {
            fontSize: "12px",
            },
            customHtml: (container, view, datum) => {
            const { width, height } = container.getBoundingClientRect();
            const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
            const text = datum ? datum.type : "Sales";
            return renderStatistic(d, text, {
                fontSize: 18,
            });
            },
        },
        content: {
            offsetY: 4,
            style: {
            fontSize: "16px",
            },
            customHtml: (container, view, datum, data) => {
            const { width } = container.getBoundingClientRect();
            const text = datum
                ? `${datum.value} %`
                : `${data.reduce((r, d) => r + d.value, 0)} %`;
            return renderStatistic(width, text, {
                fontSize: 14,
            });
            },
        },
        },
        // 添加 中心统计文本 交互
        interactions: [
        {
            type: "element-selected",
        },
        {
            type: "element-active",
        },
        {
            type: "pie-statistic-active",
        },
        ],
    };
    return <Pie {...config} />;
};

const DemoColumn = () => {
    const data = [
        {
        name: "AGO",
        station: "Jan.",
        value: 18900,
        },
        {
        name: "AGO",
        station: "Feb.",
        value: 28800,
        },
        {
        name: "AGO",
        station: "Mar.",
        value: 39030,
        },
        {
        name: "AGO",
        station: "Apr.",
        value: 8140,
        },
        {
        name: "AGO",
        station: "May",
        value: 4700,
        },
        {
        name: "AGO",
        station: "Jun.",
        value: 20300,
        },
        {
        name: "AGO",
        station: "Jul.",
        value: 13000,
        },
        {
        name: "AGO",
        station: "Aug.",
        value: 9060,
        },
        {
        name: "AGO",
        station: "Sep.",
        value: 7400,
        },
        {
        name: "AGO",
        station: "Oct.",
        value: 5600,
        },
        {
        name: "AGO",
        station: "Nov.",
        value: 24000,
        },
        {
        name: "AGO",
        station: "Dec.",
        value: 35600,
        },
        {
        name: "PMS",
        station: "Jan.",
        value: 6240,
        },
        {
        name: "PMS",
        station: "Feb.",
        value: 23020,
        },
        {
        name: "PMS",
        station: "Mar.",
        value: 34050,
        },
        {
        name: "PMS",
        station: "Apr.",
        value: 24000,
        },
        {
        name: "PMS",
        station: "May",
        value: 12000,
        },
        {
        name: "PMS",
        station: "Jun.",
        value: 7900,
        },
        {
        name: "PMS",
        station: "Jul.",
        value: 8600,
        },
        {
        name: "PMS",
        station: "Aug.",
        value: 21900,
        },
        {
        name: "PMS",
        station: "Sep.",
        value: 10002,
        },
        {
        name: "PMS",
        station: "Oct.",
        value: 5239,
        },
        {
        name: "PMS",
        station: "Nov.",
        value: 4700,
        },
        {
        name: "PMS",
        station: "Dec.",
        value: 7000,
        },
    ];
    const config = {
        data,
        isGroup: true,
        xField: "station",
        yField: "value",
        seriesField: "name",
        yAxis: {
        label: {
            formatter: (v) => `${(v / 1000).toFixed(0)} K`,
        },
        },
        label: {
        content: ""
        }
    };
    return (
        <Column
        {...config}
        style={{
            width: 750,
            height: 240,
        }}
        options={{
            maintainAspectRatio: false,
        }}
        />
    );
};

const Home = () => {
    const [pageLoading, setPageLoading] = useState(false);
    const dispatch = useDispatch();

    const functions = getFunctions();

    useEffect(() => {
        const getAnalyticsData = async () => {
        try {
            //fetch day book
            setPageLoading(true);
            const analyticsData = httpsCallable(functions, "fetchAnalytics");
            analyticsData({ analytics: true })
            .then((result) => {
                // Read result of the Cloud Function.
                const data = result.data;
                //add day
                const dashoardAnalysis = data?.data;
                console.log(dashoardAnalysis);
                dispatch(addAppAnalysis(dashoardAnalysis));
                setPageLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setPageLoading(false);
            });
        } catch (error) {
            console.log(error);
            setPageLoading(false);
        }
        };

        getAnalyticsData();
    }, [dispatch]);


    const totalStations = useSelector(selectTotalStations);
    const totalSales = useSelector(selectTotalSales);
    const totalCashSales = useSelector(selectTotalCashSales);
    const totalDebtSales = useSelector(selectTotalDebtSales);
    const totalExpensesAmount = useSelector(selectTotalExpensesAmount);
    const availableStock = useSelector(selectAvailableStock);
    const totalPurchases = useSelector(selectTotalPurchases);
    const fuelAnalytics = useSelector(selectFuelAnalytics);
    const stationSalesAnalytics = useSelector(selectStationSalesAnalytics);
    const stationsSalesPercentage = useSelector(selectStationsSalesPercentage);

    const data = [
        {
        name: "Handeni",
        year: "2024",
        sales: 130000000,
        },
        {
        name: "Handeni",
        year: "2025",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2026",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2027",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2028",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2029",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2030",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2031",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2032",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2033",
        sales: 0,
        },
        {
        name: "Handeni",
        year: "2034",
        sales: 0,
        },

        {
        name: "Kabuku",
        year: "2024",
        sales: 90000000,
        },
        {
        name: "Kabuku",
        year: "2025",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2026",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2027",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2028",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2029",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2030",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2031",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2032",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2033",
        sales: 0,
        },
        {
        name: "Kabuku",
        year: "2034",
        sales: 0,
        },

        {
        name: "Chalinze",
        year: "2024",
        sales: 300000000,
        },
        {
        name: "Chalinze",
        year: "2025",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2026",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2027",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2028",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2029",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2030",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2031",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2032",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2033",
        sales: 0,
        },
        {
        name: "Chalinze",
        year: "2034",
        sales: 0,
        },

        {
        name: "Dar",
        year: "2024",
        sales: 360000000,
        },
        {
        name: "Dar",
        year: "2025",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2026",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2027",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2028",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2029",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2030",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2031",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2032",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2033",
        sales: 0,
        },
        {
        name: "Dar",
        year: "2034",
        sales: 0,
        },

        {
        name: "Korogwe",
        year: "2024",
        sales: 230000000,
        },
        {
        name: "Korogwe",
        year: "2025",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2026",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2027",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2028",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2029",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2030",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2031",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2032",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2033",
        sales: 0,
        },
        {
        name: "Korogwe",
        year: "2034",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2024",
        sales: 50000000,
        },
        {
        name: "Mkata",
        year: "2025",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2026",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2027",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2028",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2029",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2030",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2031",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2032",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2033",
        sales: 0,
        },
        {
        name: "Mkata",
        year: "2034",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2024",
        sales: 180000000,
        },
        {
        name: "Lushoto",
        year: "2025",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2026",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2027",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2028",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2029",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2030",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2031",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2032",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2033",
        sales: 0,
        },
        {
        name: "Lushoto",
        year: "2034",
        sales: 0,
        },

        {
        name: "Tanga",
        year: "2024",
        sales: 400000000,
        },
        {
        name: "Tanga",
        year: "2025",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2026",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2027",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2028",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2029",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2030",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2031",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2032",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2033",
        sales: 0,
        },
        {
        name: "Tanga",
        year: "2034",
        sales: 0,
        },
    ];

    // const config = {
    //   data,
    //   xField: 'year',
    //   yField: 'amount',
    //   seriesField: 'name',
    //   yAxis: {
    //     label: {
    //       formatter: (v) => `${(v / 1000).toFixed(1)} K`,
    //     },
    //   },
    //   legend: {
    //     position: 'top',
    //   },
    //   smooth: true,
    //   animation: {
    //     appear: {
    //       animation: 'path-in',
    //       duration: 5000,
    //     },
    //   },
    // };

    const config = {
        data,
        xField: "year",
        yField: "sales",
        seriesField: "name",
        yAxis: {
        label: {
            formatter: (v) => `${(v / 1000000).toFixed(0)} M`,
        },
        },
        legend: {
        position: "top",
        },
        columnStyle: {
        radius: [20, 20, 0, 0],
        },
        smooth: true,
        animation: {
        appear: {
            animation: "path-in",
            duration: 5000,
        },
        },
    };

    const onChange = (date, dateString) => {
        console.log(date, dateString);
    };

    return (
        <div className="">
        <div className="px-4">
            <div className="w-full grid grid-cols-4 gap-2 justify-center items-center">
            <Card
                sx={{
                width: 250,
                height: 80,
                background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.primary}) !important`,
                }}
            >
                <div className="flex flex-row justify-between px-2 ">
                <h4 className="text-white text-sm font-light"></h4>
                <div className="text-3xl text-white">
                    <GiGasPump />
                </div>
                </div>
                <div className="px-2">
                <h4 className="text-white text-xl font-light">{totalStations}</h4>
                <h4 className="text-white text-sm font-light pb-0.5">
                    Total Stations
                </h4>
                </div>
            </Card>
            <Card
                sx={{
                width: 250,
                height: 80,
                background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.primary}) !important`,
                }}
            >
                <div className="flex flex-row justify-between px-2 ">
                <h4 className="text-white text-sm font-light"></h4>
                <div className="text-3xl text-white">
                    <MdOutlinePointOfSale />
                </div>
                </div>
                <div className="px-2">
                <h4 className="text-white text-xl font-light">TZS {totalSales}</h4>
                <h4 className="text-white text-sm font-light pb-0.5">
                    Total Sales
                </h4>
                </div>
            </Card>
            <Card
                sx={{
                width: 250,
                height: 80,
                background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.primary}) !important`,
                }}
            >
                <div className="flex flex-row justify-between px-2 ">
                <h4 className="text-white text-sm font-light"></h4>
                <div className="text-3xl text-white">
                    <GiMoneyStack />
                </div>
                </div>
                <div className="px-2">
                <h4 className="text-white text-xl font-light">TZS {totalCashSales}</h4>
                <h4 className="text-white text-sm font-light pb-0.5">
                    Total Cash Sales
                </h4>
                </div>
            </Card>
            <Card
                sx={{
                width: 250,
                height: 80,
                background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.primary}) !important`,
                }}
            >
                <div className="flex flex-row justify-between px-2 ">
                <h4 className="text-white text-sm font-light"></h4>
                <div className="text-3xl text-white">
                    <GiReceiveMoney />
                </div>
                </div>
                <div className="px-2">
                <h4 className="text-white text-xl font-light">TZS {totalDebtSales}</h4>
                <h4 className="text-white text-sm font-light pb-0.5">
                    Total Debtors Sales
                </h4>
                </div>
            </Card>
            <Card
                sx={{
                width: 250,
                height: 80,
                background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.primary}) !important`,
                }}
            >
                <div className="flex flex-row justify-between px-2 ">
                <h4 className="text-white text-sm font-light"></h4>
                <div className="text-3xl text-white">
                    <LuGauge />
                </div>
                </div>
                <div className="px-2">
                <h4 className="text-white text-xl font-light">
                    {availableStock} <span className="text-base">Litres</span>
                </h4>
                <h4 className="text-white text-sm font-light pb-0.5">
                    Available Stock
                </h4>
                </div>
            </Card>
            <Card
                sx={{
                width: 250,
                height: 80,
                background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.primary}) !important`,
                }}
            >
                <div className="flex flex-row justify-between px-2 ">
                <h4 className="text-white text-sm font-light"></h4>
                <div className="text-3xl text-white">
                    <GiTakeMyMoney />
                </div>
                </div>
                <div className="px-2">
                <h4 className="text-white text-xl font-light">TZS {totalPurchases}</h4>
                <h4 className="text-white text-sm font-light pb-0.5">
                    Total Purchases
                </h4>
                </div>
            </Card>
            <Card
                sx={{
                width: 250,
                height: 80,
                background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.primary}) !important`,
                }}
            >
                <div className="flex flex-row justify-between px-2 ">
                <h4 className="text-white text-sm font-light"></h4>
                <div className="text-3xl text-white">
                    <GiPayMoney />
                </div>
                </div>
                <div className="px-2">
                <h4 className="text-white text-xl font-light">TZS {totalExpensesAmount}</h4>
                <h4 className="text-white text-sm font-light pb-0.5">
                    Total Expenses
                </h4>
                </div>
            </Card>
            <Card
                sx={{
                width: 250,
                height: 80,
                background: `linear-gradient(270deg, ${colors.bgColor1}, ${colors.primary}) !important`,
                }}
            >
                <div className="flex flex-row justify-between px-2 ">
                <h4 className="text-white text-sm font-light"></h4>
                <div className="text-3xl text-white">
                    <MdOutlineAccountBalance />
                </div>
                </div>
                <div className="px-2">
                <h4 className="text-white text-xl font-light">TZS 126,000,000</h4>
                <h4 className="text-white text-sm font-light pb-0.5">
                    Total Profit
                </h4>
                </div>
            </Card>
            </div>
        </div>
        <div className="py-2 px-4">
            <div className="w-full flex flex-row gap-2">
            <div className="w-[75%] h-[280px] border-[1px] border-primaryColor rounded-lg">
                <div className="flex flex-row justify-between py-1 px-2">
                <h4>
                    Fuel Type Analytics <span className="text-xs">(Litres)</span>
                </h4>
                <div>
                    <DatePicker onChange={onChange} picker="year" />
                </div>
                </div>
                <div className="pl-1">
                <DemoColumn />
                </div>
            </div>
            <div className="w-[25%] h-[280px] border-[1px] border-primaryColor rounded-lg">
                <h4 className="text-sm font-light px-2">Stations Sales %</h4>
                <DemoPie />
            </div>
            </div>
        </div>
        <div className="py-2 px-4">
            <div className="w-full flex flex-row gap-2">
            <div className="w-[100%] h-[280px] border-[1px] border-primaryColor rounded-lg">
                <div className="flex flex-row justify-between py-1 px-2">
                <h4>Sales Analytics</h4>
                <div>
                    <Segmented
                        size="small"
                        options={["Daily", "Monthly", "Yearly"]}
                        onChange={(value) => {
                            console.log(value); // string
                        }}
                    />
                </div>
                </div>
                <div className="pl-1">
                <Line
                    {...config}
                    style={{
                    width: 1000,
                    height: 240,
                    }}
                    options={{
                    maintainAspectRatio: false,
                    }}
                />
                </div>
            </div>
            {/* <div className="w-[25%] h-[280px] border-[1px] border-primaryColor rounded-lg"></div> */}
            </div>
        </div>
        
        </div>
    );
};

export default Home;
