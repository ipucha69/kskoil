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

exports.stationAnalyticsData = onCall({cors: true}, async (request) => {
    try {
        const data = request?.data;
        const { stationID } = data; 

        //total sales, total cash sales, total debt amount
        const salesSnapshot = await admin.firestore().collection("dailySalesBooks").where("stationID", "==", stationID).get();
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
        const stationDoc = await admin.firestore().collection("stationBucket").doc(stationID).get();
        let availableStock = 0;
        let totalSoldLitres = 0;
        let totalPurchases = 0;
        if (stationDoc.exists) {
            if ("availableAgoLitres" in stationDoc.data()) {
                availableStock += stationDoc.data().availableAgoLitres;
            }

            if ("availablePmsLitres" in stationDoc.data()) {
                availableStock += stationDoc.data().availablePmsLitres;
            }

            if ("soldAgoLitres" in stationDoc.data()) {
                totalSoldLitres += stationDoc.data().soldAgoLitres;
            }

            if ("soldPmsLitres" in stationDoc.data()) {
                totalSoldLitres += stationDoc.data().soldPmsLitres;
            }

            if ("totalFuelAmount" in stationDoc.data()) {
                totalPurchases += stationDoc.data().totalFuelAmount;
            }
        }

        const pumpSnapshot = await admin.firestore().collection("pumpSales").where("stationID", "==", stationID).get();
        let fuelAnalytics = [];

        const salesData = {};
        const currentYear = moment().year();
        const currentMonth = moment().month(); // 0-based index for the month (0 = January, 11 = December)
        const months = moment.monthsShort(); // Array of short month names: ['Jan', 'Feb', ..., 'Dec']

        // Initialize salesData for all months up to the current month with zero values for "AGO" and "PMS"
        months.forEach((month, index) => {
            if (index <= currentMonth) {
                salesData[month] = {};
                salesData[month][currentYear] = {
                    AGO: { name: 'AGO', amount: 0 },
                    PMS: { name: 'PMS', amount: 0 }
                };
            }
        });

        if (pumpSnapshot.size !== 0) {
            pumpSnapshot.forEach(doc => {
                const date = moment(doc.data().day, "DD-MM-YYYY").toDate();
                const month = moment(date).format("MMM");
                const year = moment(date).year();
                const typeName = doc.data().typeName;
                const soldLitres = doc.data().cm - doc.data().om;

                if (year === currentYear && salesData[month] && salesData[month][year]) {
                    if (!salesData[month][year][typeName]) {
                        salesData[month][year][typeName] = { name: typeName, amount: 0 };
                    }

                    salesData[month][year][typeName].amount += soldLitres;
                }
            });
        }

        // Process the salesData to fuelAnalytics
        months.forEach((month, index) => {
            if (index <= currentMonth) {
                const types = salesData[month][currentYear];
                for (let name in types) {
                    fuelAnalytics.push({
                        name: name,
                        month: month,
                        value: types[name].amount,
                        year: currentYear
                    });
                }
            }
        });

        // If no data at all, initialize with zero values for "AGO" and "PMS" for each month up to the current month of the current year
        if (fuelAnalytics.length === 0) {
            months.forEach((month, index) => {
                if (index <= currentMonth) {
                    fuelAnalytics.push({
                        name: 'AGO',
                        month: month,
                        value: 0,
                        year: currentYear
                    });
                    fuelAnalytics.push({
                        name: 'PMS',
                        month: month,
                        value: 0,
                        year: currentYear
                    });
                }
            });
        }

        return {
            status: 200,
            message: "Station analytics is fetched successfully",
            data: {
                totalSoldLitres,
                totalSales,
                totalCashSales,
                totalDebtSales,
                totalExpensesAmount,
                availableStock,
                totalPurchases,
                fuelAnalytics,
            },
        };
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
