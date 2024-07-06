/* eslint-disable linebreak-style */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
/* eslint-disable linebreak-style */
/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable camelcase */
const admin = require("firebase-admin");
const moment = require("moment");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.fetchAnalytics = onCall({cors: true}, async (request) => {
    try {
        const data = request?.data;
        const { analytics } = data; 

        const roundAccurately = (number, decimalPlaces) => Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces);

        //total stations
        const stationSnapshot = await admin.firestore().collection("stationBucket").get();
        const totalStations = stationSnapshot.size;

        //total sales, total cash sales, total debt amount
        const salesSnapshot = await admin.firestore().collection("dailySalesBooks").get();
        let totalSales = 0;
        let totalCashSales = 0;
        let totalDebtSales = 0;
        let totalExpensesAmount = 0;

        if (salesSnapshot.size !== 0) {
            salesSnapshot.docs.map(doc => {
                if ("totalSales" in doc.data()) {
                    totalSales += doc.data().totalSales;
                }

                if ("totalCash" in doc.data()) {
                    totalCashSales += doc.data().totalCash;
                }

                if ("totalDebtAmount" in doc.data()) {
                    totalDebtSales += doc.data().totalDebtAmount;
                }

                if ("totalExpensesAmount" in doc.data()) {
                    totalExpensesAmount += doc.data().totalExpensesAmount;
                }
            })
        }

        //total available stock
        const stockDoc = await admin.firestore().collection("stock").doc("info").get();
        let availableStock = 0;
        if (stockDoc.exists) {
            if ("totalAvailableLitres" in stockDoc.data()) {
                availableStock += stockDoc.data().totalAvailableLitres;
            }
        }

        //total expenses
        let totalPurchases = 0;
        const expensesSnapshot = await admin.firestore().collection("stockBucket").get();
        if (expensesSnapshot.size !== 0) {
            expensesSnapshot.docs.map(doc => {
                if ("totalPrice" in doc.data()) {
                    totalPurchases += doc.data().totalPrice;
                }
            })
        }

        //fuelAnalytics
        const pumpSnapshot = await admin.firestore().collection("pumpSales").get();
        let fuelAnalytics = [];

        if (pumpSnapshot.size !== 0) {
            const salesData = {};

            pumpSnapshot.forEach(doc => {
                const dayParts = doc.data().day.split('-');
                const date = moment(doc.data().day, "DD-MM-YYYY").toDate()
                const month = moment(date).format("MMM")
                // const month = dayParts[1];
                const year = parseInt(dayParts[2], 10);
    
                if (!salesData[month]) {
                    salesData[month] = {};
                }
    
                if (!salesData[month][year]) {
                    salesData[month][year] = {};
                }
    
                if (!salesData[month][year][doc.data().typeName]) {
                    salesData[month][year][doc.data().typeName] = { name: doc.data().typeName, amount: 0 };
                }
    
                salesData[month][year][doc.data().typeName].amount += doc.data().amount;
            });
    
            for (let month in salesData) {
                for (let year in salesData[month]) {
                    for (let name in salesData[month][year]) {
                        fuelAnalytics.push({
                            name: name,
                            month: month,
                            value: salesData[month][year][name].amount,
                            year: year
                        });
                    }
                }
            }
        }

        //station sales analytics
        let stationSalesAnalytics = [];

        if (pumpSnapshot.size !== 0) {
            const salesData = {};

            pumpSnapshot.forEach(doc => {
                const sale = doc.data();
                const dayParts = sale.day.split('-');
                const year = dayParts[2];
                const month = dayParts[1];
        
                // group sales by year
                const key = `${sale.stationID}-${year}`;
        
                if (!salesData[key]) {
                    salesData[key] = {
                        stationName: sale.stationName,
                        year: year,
                        value: 0
                    };
                }
        
                salesData[key].value += sale.amount;
            });
        
            // Convert the object keys back into an array
            stationSalesAnalytics = Object.values(salesData).map(data => ({
               ...data,
                period: parseInt(data.year)
            }));
        }

        //stations sales percentage
        let stationsSalesPercentage = [];
        if (pumpSnapshot.size !== 0) {
            const perObj = {};

            pumpSnapshot.forEach(doc => {
                const sale = doc.data();

                if (!perObj[sale.stationID]) {
                    perObj[sale.stationID] = {
                        stationID: sale.stationID,
                        type: sale.stationName,
                        amount: 0,
                    };
                }

                perObj[sale.stationID].amount += sale.amount;

            })

            stationsSalesPercentage = Object.values(perObj).map(station => {
                return {
                   ...station,
                    value: roundAccurately((station.amount / totalSales) * 100, 2)
                };
            });
        }


        return {
            status: 200,
            message: "App analytics is fetched successfully",
            data: {
                totalStations,
                totalSales,
                totalCashSales,
                totalDebtSales,
                totalExpensesAmount,
                availableStock,
                totalPurchases,
                fuelAnalytics,
                stationSalesAnalytics,
                stationsSalesPercentage
            },
        };
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
