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

exports.createDebtor = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const {
        stationID,
        customerPrice,
        stationPrice,
        ewuraPrice,
        quantity,
        totalAmount,
        customerDebt,
        truck,
        fuel,
        customerID,
        customerName,
        dayBookID,
        day,
        created_by,
        updated_by,
        description,
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

        let paidAmount = 0;
        let paid = false;
        let balance = 0;
        let debt = 0;
        if (customerData?.balance > 0) {
        if (customerData?.balance > customerDebt) {
            paid = true;
            paidAmount = customerDebt;
            balance = customerData.balance - customerDebt;
        } else {
            paidAmount = customerData?.balance;
            debt = customerDebt - customerData?.balance;
        }
        } else {
        debt = customerDebt;
        }

        //get sum of station day debtors total customers debt
        // Fetch station day sale debtors
        const debtorsQuerySnapshot = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("debtors")
        .where("day", "==", day)
        .where("dayBookID", "==", dayBookID)
        .get();

        let totalDayDebtAmount = 0;
        debtorsQuerySnapshot.forEach((doc) => {
        const debtData = doc.data();
        totalDayDebtAmount += debtData.totalAmount;
        });

        // Calculate the sum of day sale total cash and station total debt amount
        const sum = dailySalesBookData?.totalCash + totalDayDebtAmount;

        // Check if the sum exceeds totalSales
        if (sum > dailySalesBookData.totalSales) {
        return {
            status: 500,
            message: "Failed! Quantity and amount exceeds day total sales",
        };
        } else {
        // Create debtor document
        const debtor = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("debtors")
            .add({
            stationID,
            stationName: stationData?.name,
            customerPrice,
            stationPrice,
            ewuraPrice,
            quantity,
            totalAmount,
            customerDebt,
            truck,
            fuel,
            paidAmount,
            paid,
            customerID,
            customerName,
            day,
            dayBookID,
            created_by,
            updated_by,
            description,
            created_at,
            updated_at,
            });

        //update debtor
        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("debtors")
            .doc(debtor?.id)
            .update({
            id: debtor?.id,
            });

        //add data to debtors Bucket
        await admin.firestore().collection("debtorBucket").doc(debtor?.id).set({
            stationID,
            stationName: stationData?.name,
            customerPrice,
            stationPrice,
            ewuraPrice,
            quantity,
            totalAmount,
            customerDebt,
            truck,
            fuel,
            customerID,
            customerName,
            day,
            dayBookID,
            id: debtor?.id,
            paidAmount,
            paid,
            created_by,
            updated_by,
            description,
            created_at,
            updated_at,
        });

        //add debt details to customer
        await admin
            .firestore()
            .collection("customers")
            .doc(customerID)
            .collection("expenses")
            .doc(debtor?.id)
            .set({
            stationID,
            stationName: stationData?.name,
            customerPrice,
            stationPrice,
            ewuraPrice,
            quantity,
            totalAmount,
            customerDebt,
            truck,
            fuel,
            customerID,
            customerName,
            day,
            paidAmount,
            paid,
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
            totalDebtAmount: FieldValue.increment(customerDebt),
            stationDebtAmount: FieldValue.increment(totalAmount),
            });

        //update customer path
        await admin
            .firestore()
            .collection("customers")
            .doc(customerID)
            .collection("account")
            .doc("info")
            .update({
            debt: FieldValue.increment(debt),
            balance,
            });

        //update customer bucket
        await admin
            .firestore()
            .collection("customerBucket")
            .doc(customerID)
            .update({
            debt: FieldValue.increment(debt),
            balance,
            });

        return { status: 200, message: "Debtor is added successfully" };
        }
    } catch (error) {
        console.error("Error adding debtor:", error);
        return { status: 500, message: "Failed to add debtor details" };
        // throw new HttpsError("Failed to create debtor"); // Throw a meaningful error
    }
});
