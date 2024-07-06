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
const { Timestamp } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.updateSupplierPayment = onCall(async (request) => {
    try {
        const data = request?.data;
        const {
        amount,
        description,
        paymentMethod,
        supplierID,
        paymentID,
        date,
        bank,
        accountNumber,
        stationID,
        stationName,
        stationPayment,
        updated_by,
        } = data;

        const updated_at = Timestamp.fromDate(new Date());

        // Update payment on bucket
        await admin
        .firestore()
        .collection("supplierPayments")
        .doc(paymentID)
        .update({
            amount,
            date,
            paymentMethod,
            description,
            bank,
            accountNumber,
            stationID,
            stationName,
            stationPayment,
            updated_by,
            updated_at,
        });

        // Write payment data to supplier
        await admin
        .firestore()
        .collection("suppliers")
        .doc(supplierID)
        .collection("payments")
        .doc(paymentID)
        .update({
            amount,
            date,
            paymentMethod,
            description,
            bank,
            accountNumber,
            stationID,
            stationName,
            stationPayment,
            updated_by,
            updated_at,
        });

        //Get supplier expenses and payments
        // Fetch supplier expenses
        const expensesQuerySnapshot = await admin
        .firestore()
        .collection("suppliers")
        .doc(supplierID)
        .collection("purchases")
        .get();

        let totalExpensesAmount = 0;
        expensesQuerySnapshot.forEach((doc) => {
        const expenseData = doc.data();
        totalExpensesAmount += expenseData.totalPrice;
        });

        // Fetch supplier payments
        const paymentsQuerySnapshot = await admin
        .firestore()
        .collection("suppliers")
        .doc(supplierID)
        .collection("payments")
        .get();

        let totalPaymentsAmount = 0;
        paymentsQuerySnapshot.forEach((doc) => {
        const paymentData = doc.data();
        totalPaymentsAmount += paymentData.amount;
        });

        // Update supplier debt and balance
        await admin
        .firestore()
        .collection("suppliers")
        .doc(supplierID)
        .collection("account")
        .doc("info")
        .update({
            debt: totalExpensesAmount,
            balance: totalPaymentsAmount,
        });

        await admin
        .firestore()
        .collection("supplierBucket")
        .doc(supplierID)
        .update({
            debt: totalPaymentsAmount,
            balance: totalPaymentsAmount,
        });

        return { status: 200, message: "Supplier payment is added successfully" };
    } catch (error) {
        console.error("Error creating supplier payment:", error);
        // throw new HttpsError("internal", error.message); // Throw a meaningful error
        return { status: 500, message: "Failed to create supplier payment" };
    }
});
