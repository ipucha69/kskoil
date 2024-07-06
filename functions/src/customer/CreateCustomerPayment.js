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
const { onCall } = require("firebase-functions/v2/https");

exports.createCustomerPayment = onCall(async (request) => {
    try {
        const data = request?.data;
        const {
        amount,
        description,
        paymentMethod,
        customer,
        customerID,
        receiver,
        station,
        supplier,
        bank,
        accountNumber,
        date,
        created_by,
        updated_by,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        let balance = 0;
        let debt = 0;

        const diff = parseInt(amount) - customer?.debt;
        if (diff > 0) {
        balance = diff;
        } else if (diff < 0) {
        debt = customer?.debt - parseInt(amount);
        }

        // Create payment on bucket
        const payment = await getFirestore().collection("customerPayments").add({
        amount,
        date,
        paymentMethod,
        customerName: customer?.name,
        customerID,
        receiver,
        stationID: station?.id,
        stationName: station?.name,
        stationLocation: station?.location,
        supplierID: supplier?.id,
        supplierName: supplier?.name,
        bank,
        accountNumber,
        description,
        created_by,
        updated_by,
        created_at,
        updated_at,
        });

        await admin
        .firestore()
        .collection("customerPayments")
        .doc(payment.id)
        .update({ id: payment.id });

        // Write payment data to customer
        await admin
        .firestore()
        .collection("customers")
        .doc(customerID)
        .collection("payments")
        .doc(payment.id)
        .set({
            amount,
            customerName: customer?.name,
            customerID,
            date,
            id: payment.id,
            paymentMethod,
            receiver,
            stationID: station?.id,
            stationName: station?.name,
            stationLocation: station?.location,
            supplierID: supplier?.id,
            supplierName: supplier?.name,
            bank,
            accountNumber,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        // Update custome debt
        await admin
        .firestore()
        .collection("customers")
        .doc(customerID)
        .collection("account")
        .doc("info")
        .update({
            debt,
            balance: FieldValue.increment(balance),
        });

        await admin
        .firestore()
        .collection("customerBucket")
        .doc(customerID)
        .update({
            debt,
            balance: FieldValue.increment(balance),
        });

        //Check if receiver is station
        if (station) {
        //write payment into station payments
        await getFirestore().collection("stationPayments").doc(payment?.id).set({
            amount,
            date,
            paymentMethod,
            customerID: customer?.id,
            customerName: customer?.name,
            supplierID: supplier?.id,
            supplierName: supplier?.name,
            description,
            bank,
            id: payment?.id,
            accountNumber,
            stationID: station?.id,
            stationName: station?.name,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        // Write payment data to station
        await admin
            .firestore()
            .collection("stations")
            .doc(station?.id)
            .collection("customerPayments")
            .doc(payment.id)
            .set({
            amount,
            customerID: customer?.id,
            customerName: customer?.name,
            supplierID: supplier?.id,
            supplierName: supplier?.name,
            date,
            id: payment.id,
            paymentMethod,
            description,
            bank,
            accountNumber,
            stationID: station?.id,
            stationName: station?.name,
            created_by,
            updated_by,
            created_at,
            updated_at,
            });
        }

        //Check if receiver is supplier
        if (supplier) {
        //write payment into supplier payments
        let supplierBalance = 0;
        let supplierDebt = 0;

        const supplierDiff = parseInt(amount) - supplier?.debt;
        if (supplierDiff > 0) {
            supplierBalance = supplierDiff;
        } else if (supplierDiff < 0) {
            supplierDebt = supplier?.debt - parseInt(amount);
        }

        // Create payment on supplier bucket
        await getFirestore().collection("supplierPayments").doc(payment?.id).set({
            amount,
            date,
            paymentMethod,
            supplierID: supplier?.id,
            supplierName: supplier?.name,
            description,
            bank,
            accountNumber,
            stationID: station?.id,
            stationName: station?.name,
            id: payment?.id,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        // Write payment data to supplier
        await admin
            .firestore()
            .collection("suppliers")
            .doc(supplier?.id)
            .collection("payments")
            .doc(payment.id)
            .set({
            amount,
            supplierID: supplier?.id,
            supplierName: supplier?.name,
            date,
            id: payment.id,
            paymentMethod,
            description,
            bank,
            accountNumber,
            stationID: station?.id,
            stationName: station?.name,
            stationPayment: "Customer Balance",
            created_by,
            updated_by,
            created_at,
            updated_at,
            });

        // Update supplier debt
        await admin
            .firestore()
            .collection("suppliers")
            .doc(supplier?.id)
            .collection("account")
            .doc("info")
            .update({
            debt: supplierDebt,
            balance: FieldValue.increment(supplierBalance),
            });

        await admin
            .firestore()
            .collection("supplierBucket")
            .doc(supplier?.id)
            .update({
            debt: supplierDebt,
            balance: FieldValue.increment(supplierBalance),
            });
        }

        return { status: 200, message: "Customer payment is added successfully" };
    } catch (error) {
        console.error("Error creating customer payment:", error);
        // throw new HttpsError("internal", error.message); // Throw a meaningful error
        return { status: 500, message: "Failed to create customer payment" };
    }
});
