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

exports.updateSupplier = onCall(async (request) => {
    try {
        const data = request?.data;
        const { name, phone, openingBalance, description, id, updated_by } = data;

        const updated_at = Timestamp.fromDate(new Date());
    
        //Get supplier expenses and payments
        // Fetch supplier expenses
        const expensesQuerySnapshot = await admin
        .firestore()
        .collection("suppliers")
        .doc(id)
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

        // Write supplier data to Firestore
        await admin.firestore().collection("supplierBucket").doc(id).update({
        name,
        phone,
        description,
        balance: actualBalance,
        debt: actualDebt,
        openingBalance,
        updated_by,
        updated_at,
        });

        // Update supplier data to supplier info
        await admin
        .firestore()
        .collection("suppliers")
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
            updated_by,
            updated_at,
        });

        return { status: 200, message: "Supplier is updated successfully" };
    } catch (error) {
        console.error("Error updating supplier:", error);
        throw new HttpsError("Failed to update supplier", error.message);
    }
});
