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

exports.fetchSalesBook = onCall(async (request) => {
    try {
        const data = request?.data;
        const { stationID, allStations } = data;

        const dayBooks = [];

        //if all stations is true get day books for all stations
        if (allStations) {
        // Check for processed day books for the station
        const dayBooksQuerySnapshot = await admin
            .firestore()
            .collection("dailySalesBooks")
            .where("status", "==", true)
            .get();

        // Iterate over each processed day book
        for (const dayBookDoc of dayBooksQuerySnapshot.docs) {
            const dayBook = dayBookDoc.data();

            // Fetch pump sales for the current day book
            const pumpSalesSnapshot = await admin
            .firestore()
            .collection("stations")
            .doc(dayBook?.stationID)
            .collection("pumpSales")
            .where("day", "==", dayBook.day)
            .get();

            // Fetch debtors for the current day book
            const debtorsSnapshot = await admin
            .firestore()
            .collection("stations")
            .doc(dayBook?.stationID)
            .collection("debtors")
            .where("day", "==", dayBook.day)
            .get();

            // Fetch expenses for the current day book
            const expensesSnapshot = await admin
            .firestore()
            .collection("stations")
            .doc(dayBook?.stationID)
            .collection("expenses")
            .where("day", "==", dayBook.day)
            .get();

            let totalExpensesAmount = 0;
            let totalDebtorsAmount = 0;

            // Calculate sum of expenses for the current day book
            expensesSnapshot.forEach((expenseDoc) => {
            const expense = expenseDoc.data();
            totalExpensesAmount += expense.amount;
            });

            // Calculate sum of debtors for the current day book
            debtorsSnapshot.forEach((debtorDoc) => {
            const debtor = debtorDoc.data();
            totalDebtorsAmount += debtor.totalAmount;
            });

            // Check and replace NaN with 0
            if (isNaN(totalExpensesAmount)) {
                totalExpensesAmount = 0;
            }

            if (isNaN(totalDebtorsAmount)) {
                totalDebtorsAmount = 0;
            }

            // Push the data to the dayBooks array including total expenses and total debtors
            dayBooks.push({
            dayBook,
            pumpSales: pumpSalesSnapshot.docs.map((doc) => doc.data()),
            debtors: debtorsSnapshot.docs.map((doc) => doc.data()),
            expenses: expensesSnapshot.docs.map((doc) => doc.data()),
            totalExpensesAmount,
            totalDebtorsAmount,
            day: dayBook?.day,
            totalCash: dayBook?.totalCash,
            totalSales: dayBook?.totalSales,
            totalLitres: dayBook?.totalLitres,
            stationName: dayBook?.stationName,
            });
        }
        } else {
        //get specific station day book data
        // Check for processed day books for the station
        const dayBooksQuerySnapshot = await admin
            .firestore()
            .collection("dailySalesBooks")
            .where("stationID", "==", stationID)
            .where("status", "==", true)
            .get();

        // Iterate over each processed day book
        for (const dayBookDoc of dayBooksQuerySnapshot.docs) {
            const dayBook = dayBookDoc.data();

            // Fetch pump sales for the current day book
            const pumpSalesSnapshot = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumpSales")
            .where("day", "==", dayBook.day)
            .get();

            // Fetch debtors for the current day book
            const debtorsSnapshot = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("debtors")
            .where("day", "==", dayBook.day)
            .get();

            // Fetch expenses for the current day book
            const expensesSnapshot = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("expenses")
            .where("day", "==", dayBook.day)
            .get();

            let totalExpensesAmount = 0;
            let totalDebtorsAmount = 0;

            // Calculate sum of expenses for the current day book
            expensesSnapshot.forEach((expenseDoc) => {
            const expense = expenseDoc.data();
            totalExpensesAmount += expense.amount;
            });

            // Calculate sum of debtors for the current day book
            debtorsSnapshot.forEach((debtorDoc) => {
            const debtor = debtorDoc.data();
            totalDebtorsAmount += debtor.totalAmount;
            });

            // Check and replace NaN with 0
            if (isNaN(totalExpensesAmount)) {
                totalExpensesAmount = 0;
            }

            if (isNaN(totalDebtorsAmount)) {
                totalDebtorsAmount = 0;
            }

            // Push the data to the dayBooks array including total expenses and total debtors
            dayBooks.push({
            dayBook,
            pumpSales: pumpSalesSnapshot.docs.map((doc) => doc.data()),
            debtors: debtorsSnapshot.docs.map((doc) => doc.data()),
            expenses: expensesSnapshot.docs.map((doc) => doc.data()),
            totalExpensesAmount,
            totalDebtorsAmount,
            day: dayBook?.day,
            totalCash: dayBook?.totalCash,
            totalSales: dayBook?.totalSales,
            totalLitres: dayBook?.totalLitres,
            stationName: dayBook?.stationName,
            });
        }
        }

        return {
        status: 200,
        message: "Day book is fetched successfully",
        data: dayBooks,
        };
    } catch (error) {
        console.error("Error fetching sales book:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
