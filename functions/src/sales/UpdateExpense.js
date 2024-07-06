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

exports.updateExpense = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const {
        expenseName,
        expenseID,
        amount,
        amountDiff,
        id,
        stationID,
        dayBookID,
        updated_by,
        description,
        } = data;

        const updated_at = Timestamp.fromDate(new Date());

        //update expense
        await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("expenses")
        .doc(id)
        .update({
            expenseID,
            expenseName,
            amount,
            updated_by,
            description,
            updated_at,
        });

        //update data to expense Bucket
        await admin.firestore().collection("expensesBucket").doc(id).update({
        expenseID,
        expenseName,
        amount,
        updated_by,
        description,
        updated_at,
        });

        //update daily sales book
        await admin
        .firestore()
        .collection("dailySalesBooks")
        .doc(dayBookID)
        .update({
            totalExpensesAmount: FieldValue.increment(amountDiff),
        });

        //update station path
        await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("account")
        .doc("info")
        .update({
            totalExpensesAmount: FieldValue.increment(amountDiff),
        });

        //update station bucket
        await admin
        .firestore()
        .collection("stationBucket")
        .doc(stationID)
        .update({
            totalExpensesAmount: FieldValue.increment(amountDiff),
        });

        return { status: 200, message: "Expense is updated successfully" };
    } catch (error) {
        console.error("Error updating expense:", error);
        throw new HttpsError("Failed to update expense"); // Throw a meaningful error
    }
});
