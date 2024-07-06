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
const { onCall } = require("firebase-functions/v2/https");

exports.createDebtorCash = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const {
        customerName,
        customerID,
        totalAmount,
        paymentMethodID,
        paymentMethod,
        stationID,
        description,
        day,
        dayBookID,
        created_by,
        updated_by,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

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

        // Get the customer document
        const customerRef = admin
        .firestore()
        .collection("customerBucket")
        .doc(customerID);
        const customerSnapshot = await customerRef.get();
        const customerData = customerSnapshot.data();

        let balance = 0;
        let debt = 0;

        const diff = parseInt(totalAmount) - customerData?.debt;
        if (diff > 0) {
        balance = diff;
        } else if (diff < 0) {
        debt = customerData?.debt - parseInt(totalAmount);
        }

        // Check if the day sale is closed
        if (dailySalesBookData.status) {
        return {
            status: 500,
            message: "Sorry! Day sales is closed",
        };
        } else {
        // Create debtor document
        const debtor = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("debtorCashSales")
            .add({
            stationID,
            stationName: stationData?.name,
            totalAmount,
            customerID,
            customerName,
            paymentMethod,
            paymentMethodID,
            day,
            dayBookID,
            created_by,
            updated_by,
            description,
            created_at,
            updated_at,
            });

        //update debtor cash sale
        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("debtorCashSales")
            .doc(debtor?.id)
            .update({
            id: debtor?.id,
            });

        //add data to debtors Bucket
        await admin
            .firestore()
            .collection("debtorCashSalesBucket")
            .doc(debtor?.id)
            .set({
            stationID,
            stationName: stationData?.name,
            totalAmount,
            customerID,
            customerName,
            paymentMethod,
            paymentMethodID,
            day,
            dayBookID,
            created_by,
            updated_by,
            description,
            created_at,
            updated_at,
            id: debtor?.id,
            });

        //write payment into station payments
        await admin
            .firestore()
            .collection("stationPayments")
            .doc(debtor?.id)
            .set({
            amount: totalAmount,
            date: created_at,
            paymentMethod,
            customerID,
            customerName,
            supplierID: "",
            supplierName: "",
            description,
            bank: "",
            id: debtor?.id,
            accountNumber: "",
            stationID: stationData?.id,
            stationName: stationData?.name,
            created_by,
            updated_by,
            created_at,
            updated_at,
            });

        // Write payment data to station
        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("customerPayments")
            .doc(debtor?.id)
            .set({
            amount: totalAmount,
            date: created_at,
            paymentMethod,
            customerID,
            customerName,
            supplierID: "",
            supplierName: "",
            description,
            bank: "",
            id: debtor?.id,
            accountNumber: "",
            stationID: stationData?.id,
            stationName: stationData?.name,
            created_by,
            updated_by,
            created_at,
            updated_at,
            });

        //add payment to customer
        await admin
            .firestore()
            .collection("customerPayments")
            .doc(debtor?.id)
            .set({
            amount: totalAmount,
            date: created_at,
            paymentMethod,
            customerName,
            customerID,
            receiver: "station",
            stationID,
            stationName: stationData?.name,
            stationLocation: stationData?.location,
            supplierID: "",
            supplierName: "",
            bank: "",
            accountNumber: "",
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
            id: debtor?.id,
            });

        // Write payment data to customer
        await admin
            .firestore()
            .collection("customers")
            .doc(customerID)
            .collection("payments")
            .doc(debtor?.id)
            .set({
            amount: totalAmount,
            date: created_at,
            paymentMethod,
            customerName,
            customerID,
            receiver: "station",
            stationID,
            stationName: stationData?.name,
            stationLocation: stationData?.location,
            supplierID: "",
            supplierName: "",
            bank: "",
            accountNumber: "",
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
            id: debtor?.id,
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

        return { status: 200, message: "Debtor cash sale is saved successfully" };
        }
    } catch (error) {
        console.error("Error adding debtor:", error);
        return { status: 500, message: "Failed to save debtor cash sale" };
        // throw new HttpsError("Failed to create debtor"); // Throw a meaningful error
    }
});
