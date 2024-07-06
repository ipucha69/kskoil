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

exports.updateCustomer = onCall(async (request) => {
    try {
        const data = request?.data;
        const {
        name,
        phone,
        openingBalance,
        description,
        privateStatus,
        id,
        status,
        updated_by,
        } = data;

        const updated_at = Timestamp.fromDate(new Date());

        let balance = 0;
        let debt = 0;

        if (openingBalance < 0) {
        debt = openingBalance;
        } else {
        balance = openingBalance;
        }

        //Get customer expenses and payments
        // Fetch customer expenses
        const expensesQuerySnapshot = await admin
        .firestore()
        .collection("customers")
        .doc(id)
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
        .doc(id)
        .collection("payments")
        .get();

        let totalPaymentsAmount = 0;
        paymentsQuerySnapshot.forEach((doc) => {
        const paymentData = doc.data();
        totalPaymentsAmount += paymentData.amount;
        });

        let actualBalance = 0;
        let actualDebt = 0;

        const diffAmount = totalPaymentsAmount - totalExpensesAmount;
        const actualDiff = diffAmount + openingBalance;
        if (actualDiff < 0) {
        actualDebt = Math.abs(actualDiff);
        } else {
        actualBalance = actualDiff;
        }

        // Write customer data to Firestore
        await admin.firestore().collection("customerBucket").doc(id).update({
        name,
        phone,
        description,
        balance: actualBalance,
        debt: actualDebt,
        openingBalance,
        status,
        private: privateStatus,
        updated_by,
        updated_at,
        });

        // Update customer data to customer info
        await admin
        .firestore()
        .collection("customers")
        .doc(id)
        .collection("account")
        .doc("info")
        .update({
            name,
            phone,
            description,
            balance: actualBalance,
            debt: actualDebt,
            openingBalance,
            status,
            private: privateStatus,
            updated_by,
            updated_at,
        });

        return { status: 200, message: "Customer is updated successfully" };
    } catch (error) {
        console.error("Error updating customer:", error);
        throw new HttpsError("Failed to update customer", error.message);
    }
});
