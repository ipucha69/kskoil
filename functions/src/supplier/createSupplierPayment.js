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
  getFirestore,
  FieldValue,
} = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.createSupplierPayment = onCall(async (request) => {
    try {
        const data = request?.data;
        const {
        amount,
        description,
        paymentMethod,
        supplier,
        supplierID,
        date,
        bank,
        accountNumber,
        stationID,
        stationName,
        stationPayment,
        created_by,
        updated_by,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        let balance = 0;
        let debt = 0;

        const diff = parseInt(amount) - supplier?.debt;
        if (diff > 0) {
        balance = diff;
        } else if (diff < 0) {
        debt = supplier?.debt - parseInt(amount);
        }

        // Create payment on bucket
        const payment = await getFirestore().collection("supplierPayments").add({
        amount,
        date,
        paymentMethod,
        supplierID,
        supplierName: supplier?.name,
        description,
        bank,
        accountNumber,
        stationID,
        stationName,
        stationPayment,
        created_by,
        updated_by,
        created_at,
        updated_at,
        });

        await admin
        .firestore()
        .collection("supplierPayments")
        .doc(payment.id)
        .update({ id: payment.id });

        // Write payment data to supplier
        await admin
        .firestore()
        .collection("suppliers")
        .doc(supplierID)
        .collection("payments")
        .doc(payment.id)
        .set({
            amount,
            supplierID,
            supplierName: supplier?.name,
            date,
            id: payment.id,
            paymentMethod,
            description,
            bank,
            accountNumber,
            stationID,
            stationName,
            stationPayment,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        // Update supplier debt
        await admin
        .firestore()
        .collection("suppliers")
        .doc(supplierID)
        .collection("account")
        .doc("info")
        .update({
            debt,
            balance: FieldValue.increment(balance),
        });

        await admin
        .firestore()
        .collection("supplierBucket")
        .doc(supplierID)
        .update({
            debt,
            balance: FieldValue.increment(balance),
        });

        return { status: 200, message: "Supplier payment is added successfully" };
    } catch (error) {
        console.error("Error creating supplier payment:", error);
        // throw new HttpsError("internal", error.message); // Throw a meaningful error
        return { status: 500, message: "Failed to create supplier payment" };
    }
});
