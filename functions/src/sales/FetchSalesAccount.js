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

exports.fetchSalesAccount = onCall(async (request) => {
    try {
        const data = request?.data;
        const { stationID, dayBookID } = data;

        let response = {};

        // Reference to the dailySalesBooks collection
        const dailySalesBooksRef = admin.firestore().collection("dailySalesBooks");

        // Query for documents where stationID is 123 and date is equal to queryDate
        const querySnapshot = await dailySalesBooksRef
        .where("stationID", "==", stationID)
        .where("id", "==", dayBookID)
        .get();

        // Extract the data from the querySnapshot
        const dayBookData = querySnapshot.docs.map((doc) => doc.data());

        // Fetch debtors data
        const debtorsSnapshot = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("debtors")
        .where("dayBookID", "==", dayBookID)
        .get();
        const debtors = debtorsSnapshot.docs.map((doc) => doc.data());

        // Fetch expenses data
        const expensesSnapshot = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("expenses")
        .where("dayBookID", "==", dayBookID)
        .get();
        const expenses = expensesSnapshot.docs.map((doc) => doc.data());

        // Fetch pump sales data
        const salesSnapshot = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("pumpSales")
        .where("dayBookID", "==", dayBookID)
        .get();
        const sales = salesSnapshot.docs.map((doc) => doc.data());

        response["debtors"] = debtors;
        response["sales"] = sales;
        response["expenses"] = expenses;
        response["dayBook"] = { ...dayBookData[0] };
        response["date"] = dayBookData[0]?.day;

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
