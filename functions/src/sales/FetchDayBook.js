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
const moment = require("moment-timezone");

exports.fetchDayBook = onCall(async (request) => {
    try {
        const data = request?.data;
        const { stationID } = data;
        // Get the current time in GMT+3 (EAT)
        const currentTime = moment().tz("Africa/Dar_es_Salaam");

        // Set 11:00 AM for comparison
        const elevenAM = moment()
        .tz("Africa/Dar_es_Salaam")
        .hour(11)
        .minute(0)
        .second(0);

        let queryDate;
        let response = {};

        // Check if the current time is before 11:00 AM
        if (currentTime.isBefore(elevenAM)) {
            // If true, check if the current time is on the same day as 11:00 AM
            if (!currentTime.isSame(elevenAM, "day")) {
                // If not, subtract 1 day from the current time to get the day before yesterday
                queryDate = currentTime.subtract(1, "day").format("DD-MM-YYYY");
            } else {
                // If yes, subtract 2 days from the current time to get the day before yesterday
                queryDate = currentTime.subtract(2, "day").format("DD-MM-YYYY");
            }
        } else {
            // If false (i.e., the current time is 11:00 AM or later), get yesterday's date
            queryDate = currentTime.subtract(1, "day").format("DD-MM-YYYY");
        }

        // Check for unprocessed day books for the station
        const unprocessedQuery = await admin
        .firestore()
        .collection("dailySalesBooks")
        .where("stationID", "==", stationID)
        .where("status", "==", false)
        .get();

        // Handle cases based on unprocessed book count
        if (unprocessedQuery.size >= 1) {
            // If unprocessed books exist, prioritize fetching the oldest one
            // const oldestDoc = unprocessedQuery.docs.sort(
            //   (a, b) => a.data().date.toDate() - b.data().date.toDate()
            // )[0];

            const oldestDoc = unprocessedQuery.docs.sort(
                (a, b) =>
                moment(a.data().day, "DD-MM-YYYY").toDate() -
                moment(b.data().day, "DD-MM-YYYY").toDate()
            )[0];

            // Fetch debtors data
            const debtorsSnapshot = await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("debtors")
                .where("day", "==", oldestDoc.data().day)
                .get();
            const debtors = debtorsSnapshot.docs.map((doc) => doc.data());

            // Fetch expenses data
            const expensesSnapshot = await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("expenses")
                .where("day", "==", oldestDoc.data().day)
                .get();
            const expenses = expensesSnapshot.docs.map((doc) => doc.data());

            // Fetch debtor cash sales data
            const debtorSalesSnapshot = await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("debtorCashSales")
                .where("day", "==", oldestDoc.data().day)
                .get();
            const debtorCashSales = debtorSalesSnapshot.docs.map((doc) => doc.data());

            // Fetch pump sales data
            const salesSnapshot = await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("pumpSales")
                .where("day", "==", oldestDoc.data().day)
                .get();
            const sales = salesSnapshot.docs.map((doc) => doc.data());

            // Fetch pums data
            const pumpSnapshot = await admin
                .firestore()
                .collection("pumpDaySalesBook")
                .doc(stationID)
                .collection(oldestDoc.data().day)
                .get();
            const pumps = pumpSnapshot.docs.map((doc) => doc.data());

            // Update the response with the found unprocessed book data
            response["debtors"] = debtors;
            response["sales"] = sales;
            response["pumps"] = pumps;
            response["expenses"] = expenses;
            response["debtorsCashSales"] = debtorCashSales;
            response["dayBook"] = { ...oldestDoc.data() };
            response["date"] = oldestDoc.data().day;
            response["skipped"] = true;

            return {
                status: 200,
                message: "Unprocessed day book fetched successfully",
                data: response,
            };
        } else {
            // If no unprocessed books exist
            // Reference to the dailySalesBooks collection
            const dailySalesBooksRef = admin
                .firestore()
                .collection("dailySalesBooks");

            // Query for documents where stationID is 123 and date is equal to queryDate
            const querySnapshot = await dailySalesBooksRef
                .where("stationID", "==", stationID)
                .where("day", "==", queryDate)
                .get();

            // Extract the data from the querySnapshot
            const dayBookData = querySnapshot.docs.map((doc) => doc.data());

            // Fetch debtors data
            const debtorsSnapshot = await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("debtors")
                .where("day", "==", queryDate)
                .get();
            const debtors = debtorsSnapshot.docs.map((doc) => doc.data());

            // Fetch expenses data
            const expensesSnapshot = await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("expenses")
                .where("day", "==", queryDate)
                .get();
            const expenses = expensesSnapshot.docs.map((doc) => doc.data());

            // Fetch pump sales data
            const salesSnapshot = await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("pumpSales")
                .where("day", "==", queryDate)
                .get();
            const sales = salesSnapshot.docs.map((doc) => doc.data());

            // Fetch pums data
            const pumpSnapshot = await admin
                .firestore()
                .collection("pumpDaySalesBook")
                .doc(stationID)
                .collection(queryDate)
                .get();
            const pumps = pumpSnapshot.docs.map((doc) => doc.data());

            response["debtors"] = debtors;
            response["sales"] = sales;
            response["pumps"] = pumps;
            response["expenses"] = expenses;
            response["dayBook"] = { ...dayBookData[0] };
            response["date"] = queryDate;
            response["skipped"] = false;
        }

        return {
        status: 200,
        message: "Day book is fetched successfully",
        data: response,
        };
    } catch (error) {
        console.error("Error fetching day book:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
