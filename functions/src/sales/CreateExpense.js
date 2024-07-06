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
const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.createExpense = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const {
        expenseName,
        expenseID,
        amount,
        expenseType,
        fuel,
        fuelID,
        litres,
        stationID,
        day,
        dayBookID,
        created_by,
        updated_by,
        description,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        let fuelStatus = false;

        if (fuel && litres) {
        fuelStatus = true;
        }

        // Get the dailySalesBook document
        const dailySalesBookRef = admin
        .firestore()
        .collection("dailySalesBooks")
        .doc(dayBookID);
        const dailySalesBookSnapshot = await dailySalesBookRef.get();
        const dailySalesBookData = dailySalesBookSnapshot.data();

        // Get the station document
        const stationRef = admin
        .firestore()
        .collection("stationBucket")
        .doc(stationID);
        const stationSnapshot = await stationRef.get();
        const stationData = stationSnapshot.data();

        // Check if day book is closed
        if (dailySalesBookData.status) {
        return { status: 500, message: "Sorry! Day sales book is closed" };
        } else {
        // Create expense document
        const expense = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("expenses")
            .add({
            stationID,
            stationName: stationData?.name,
            expenseID,
            expenseType,
            expenseName,
            amount,
            fuel: fuelStatus,
            fuelID,
            fuelType: fuel,
            litres,
            day,
            dayBookID,
            created_by,
            updated_by,
            description,
            created_at,
            updated_at,
            });

        //update expense
        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("expenses")
            .doc(expense?.id)
            .update({
            id: expense?.id,
            });

        //add data to expense Bucket
        await admin
            .firestore()
            .collection("expensesBucket")
            .doc(expense?.id)
            .set({
            stationID,
            stationName: stationData?.name,
            expenseID,
            expenseName,
            amount,
            fuel: fuelStatus,
            fuelID,
            fuelType: fuel,
            litres,
            day,
            dayBookID,
            id: expense?.id,
            created_by,
            updated_by,
            description,
            created_at,
            updated_at,
            });

        //update daily sales book
        await admin
            .firestore()
            .collection("dailySalesBooks")
            .doc(dayBookID)
            .update({
            totalExpensesAmount: FieldValue.increment(amount),
            });

        //update station path
        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("account")
            .doc("info")
            .update({
            totalExpensesAmount: FieldValue.increment(amount),
            });

        //update station bucket
        await admin
            .firestore()
            .collection("stationBucket")
            .doc(stationID)
            .update({
            totalExpensesAmount: FieldValue.increment(amount),
            });

        return { status: 200, message: "Expense is saved successfully" };
        }
    } catch (error) {
        console.error("Error adding expense:", error);
        // throw new HttpsError("Failed to create expense"); // Throw a meaningful error
        return { status: 500, message: "Failed to create expense" };
    }
});
