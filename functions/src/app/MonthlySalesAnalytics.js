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

exports.monthlySalesAnalytics = onCall(async (request) => {
    try {
        const data = request?.data;
        const { analytics } = data;
        console.log("analytics", analytics);

        let stationSalesAnalytics = [];
        const pumpSnapshot = await admin.firestore().collection("pumpSales").get();
        
        // Get the current year
        const currentYear = new Date().getFullYear();
        
        if (pumpSnapshot.size!== 0) {
            const salesData = {};
        
            pumpSnapshot.forEach(doc => {
                const sale = doc.data();
                const dayParts = sale.day.split('-');
                const year = dayParts[2];
                const month = dayParts[1];
        
                // Only process sales for the current year
                if (parseInt(year) === currentYear) {
                    // group sales by year and month
                    const key = `${sale.stationID}-${year}-${month}`;
        
                    if (!salesData[key]) {
                        salesData[key] = {
                            stationName: sale.stationName,
                            year: year,
                            month: month,
                            value: 0
                        };
                    }
        
                    salesData[key].value += sale.amount;
                }
            });
        
            // Convert the object keys back into an array
            stationSalesAnalytics = Object.values(salesData).map(data => ({
             ...data,
                year: parseInt(data.year),
                period: parseInt(data.month)
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
