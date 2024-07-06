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
const {
  Timestamp,
} = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.updateCustomerPayment = onCall(async (request) => {
    try {
        const data = request?.data;
        const {
        amount,
        description,
        paymentMethod,
        customer,
        customerID,
        paymentID,
        date,
        updated_by,
        } = data;

        const updated_at = Timestamp.fromDate(new Date());

        // Update payment on bucket
        await admin
        .firestore()
        .collection("customerPayments")
        .doc(paymentID)
        .update({
            amount,
            date,
            paymentMethod,
            customerName: customer?.name,
            description,
            updated_at,
            updated_by,
        });

        // Update payment data to customer
        await admin
        .firestore()
        .collection("customers")
        .doc(customerID)
        .collection("payments")
        .doc(paymentID)
        .update({
            amount,
            date,
            paymentMethod,
            customerName: customer?.name,
            description,
            updated_at,
            updated_by,
        });

        //Get customer expenses and payments
        // Fetch customer expenses
        const expensesQuerySnapshot = await admin
        .firestore()
        .collection("customers")
        .doc(customerID)
        .collection("expenses")
        .get();

        let totalExpensesAmount = 0;
        expensesQuerySnapshot.forEach((doc) => {
        const expenseData = doc.data();
        totalExpensesAmount += expenseData.customerDebt;
        });

        // Fetch customer payments
        const paymentsQuerySnapshot = await admin
        .firestore()
        .collection("customers")
        .doc(customerID)
        .collection("payments")
        .get();

        let totalPaymentsAmount = 0;
        paymentsQuerySnapshot.forEach((doc) => {
        const paymentData = doc.data();
        totalPaymentsAmount += paymentData.amount;
        });

        // Update custome debt
        await admin
        .firestore()
        .collection("customers")
        .doc(customerID)
        .collection("account")
        .doc("info")
        .update({
            debt: totalExpensesAmount,
            balance: totalPaymentsAmount,
        });

        await admin
        .firestore()
        .collection("customerBucket")
        .doc(customerID)
        .update({
            debt: totalExpensesAmount,
            balance: totalPaymentsAmount,
        });

        return { status: 200, message: "Customer payment is updated successfully" };
    } catch (error) {
        console.error("Error updating customer payment:", error);
        // throw new HttpsError("internal", error.message); // Throw a meaningful error
        return { status: 500, message: "Failed to update customer payment" };
    }
});
