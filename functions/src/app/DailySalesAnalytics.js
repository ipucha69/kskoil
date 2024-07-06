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
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.dailySalesAnalytics = onCall(async (request) => {
    try {
        const data = request?.data;
        const { analytics } = data;
        console.log("analytics", analytics);

        let stationSalesAnalytics = [];
        const pumpSnapshot = await admin.firestore().collection("pumpSales").get();
        
        if (pumpSnapshot.size!== 0) {
            const salesData = {};
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
        
            pumpSnapshot.forEach(doc => {
                const sale = doc.data();
                const dayParts = sale.day.split('-');
                const year = dayParts[2];
                const month = dayParts[1];
                const day = dayParts[0];
        
                // Check if the sale is within the current month
                if (parseInt(year) === currentYear && parseInt(month) === currentMonth) {
                    // group sales by day
                    const key = `${sale.stationID}-${day}`;
        
                    if (!salesData[key]) {
                        salesData[key] = {
                            stationName: sale.stationName,
                            day: day,
                            value: 0
                        };
                    }
        
                    salesData[key].value += sale.amount;
                }
            });
        
            // Convert the object keys back into an array
            stationSalesAnalytics = Object.values(salesData).map(data => ({
             ...data,
                period: parseInt(data.day) // Ensure day is treated as a number
            }));
        }
        

        return {
            status: 200,
            message: "monthly sales analytics is fetched successfully",
            data: {
                stationSalesAnalytics,
            },
        };
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
