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

exports.updateDebtor = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const {
            stationID,
            customerPrice,
            stationPrice,
            quantity,
            totalAmount,
            truck,
            fuel,
            customerID,
            customerName,
            debtor,
            created_by,
            updated_by,
            description,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        const stationTotalAmount = stationPrice * quantity;
        const stationTotalAmountDiff = stationTotalAmount - debtor?.totalAmount;
        const totalAmountDiff = totalAmount - debtor?.customerDebt;

        // Get the dailySalesBook document
        const dailySalesBookRef = admin
        .firestore()
        .collection("dailySalesBooks")
        .doc(debtor?.dayBookID);
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
        if (customerData?.balance > totalAmount) {
            paid = true;
            paidAmount = totalAmount;
            balance = customerData?.balance - totalAmount;
        } else {
            paidAmount = customerData?.balance;
            debt = totalAmount - customerData?.balance;
        }
        }

        // Calculate the sum of totalCash and stationTotalAmount
        const sum = (dailySalesBookData?.totalCash || 0) + stationTotalAmount;

        // Check if the sum exceeds totalSales
        if (sum > dailySalesBookData.totalSales) {
        throw new HttpsError(
            "Failed to create debtor",
            "Quantity and Amount exceeded the day sales"
        );
        } else {
        //update debtor
        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("debtors")
            .doc(debtor?.id)
            .update({
                customerPrice,
                quantity,
                totalAmount: stationTotalAmount,
                customerDebt: totalAmount,
                truck,
                fuel,
                paidAmount,
                paid,
                customerID,
                customerName,
                updated_by,
                description,
                updated_at,
            });

        //update data to debtors Bucket
        await admin
            .firestore()
            .collection("debtorBucket")
            .doc(debtor?.id)
            .update({
            customerPrice,
            quantity,
            customerDebt: totalAmount,
            totalAmount: stationTotalAmount,
            truck,
            fuel,
            paidAmount,
            paid,
            customerID,
            customerName,
            updated_by,
            description,
            updated_at,
            });

        //check if customer is changed
        if (customerID !== debtor?.customerID) {
            //update new customer
            //update debt details to customer
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
                quantity,
                totalAmount,
                stationTotalAmount,
                truck,
                fuel,
                customerID,
                customerName,
                day: debtor?.day,
                paidAmount,
                paid,
                created_by,
                updated_by,
                description,
                created_at,
                updated_at,
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

            //update old customer
            //delete debt details to old customer
            await admin
            .firestore()
            .collection("customers")
            .doc(debtor?.customerID)
            .collection("expenses")
            .doc(debtor?.id)
            .delete();

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
            totalExpensesAmount += expenseData.totalAmount;
            });

            // Fetch customer expenses
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

            //Find difference
            const diff = totalExpensesAmount - totalPaymentsAmount;
            let customerBalance = 0;
            let customerDebt = 0;

            if (diff > 0) {
            customerDebt = diff;
            } else if (diff < 0) {
            customerBalance = totalPaymentsAmount - totalExpensesAmount;
            }

            //update old customer path
            await admin
            .firestore()
            .collection("customers")
            .doc(debtor?.customerID)
            .collection("account")
            .doc("info")
            .update({
                debt: customerDebt,
                balance: customerBalance,
            });

            //update old customer bucket
            await admin
            .firestore()
            .collection("customerBucket")
            .doc(debtor?.customerID)
            .update({
                debt: customerDebt,
                balance: customerBalance,
            });
        } else {
            //update same customer
            //update debt details to customer
            await admin
            .firestore()
            .collection("customers")
            .doc(customerID)
            .collection("expenses")
            .doc(debtor?.id)
            .update({
                customerPrice,
                stationPrice,
                quantity,
                totalAmount,
                stationTotalAmount,
                truck,
                fuel,
                paidAmount,
                paid,
                updated_by,
                description,
                updated_at,
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
        }

        //update daily sales book
        await admin
            .firestore()
            .collection("dailySalesBooks")
            .doc(debtor?.dayBookID)
            .update({
                totalDebtAmount: FieldValue.increment(totalAmountDiff),
                stationDebtAmount: FieldValue.increment(stationTotalAmountDiff),
            });

        return { status: 200, message: "Debtor is updated successfully" };
        }
    } catch (error) {
        console.error("Error updating debtor:", error);
        throw new HttpsError("Failed to update debtor"); // Throw a meaningful error
    }
});
