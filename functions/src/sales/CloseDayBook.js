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
const moment = require("moment");

exports.closeDayBook = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const { stationID, dayBookID, day, updated_by } = data;

        const updated_at = Timestamp.fromDate(new Date());

        const queryDate = moment(day, "DD-MM-YYYY")
        .add(1, "day")
        .format("DD-MM-YYYY");

        // Get the dailySalesBook document
        const dailySalesBookRef = admin
        .firestore()
        .collection("dailySalesBooks")
        .doc(dayBookID);
        const dailySalesBookSnapshot = await dailySalesBookRef.get();
        const dailySalesBookData = dailySalesBookSnapshot.data();

        // Fetch day debtors
        const debtorsQuerySnapshot = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("debtors")
        .where("dayBookID", "==", dayBookID)
        .get();

        let totalDebtAmount = 0;
        debtorsQuerySnapshot.forEach((doc) => {
        const debtorData = doc.data();
        totalDebtAmount += debtorData.totalAmount;
        });

        // Fetch day fuel expenses
        const fuelQuerySnapshot = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("expenses")
        .where("dayBookID", "==", dayBookID)
        .where("fuel", "==", true)
        .get();

        let totalFuelAmount = 0;
        fuelQuerySnapshot.forEach((doc) => {
        const fuelExpense = doc.data();
        totalFuelAmount += fuelExpense.amount;
        });

        // Calculate the sum of total Cash sales, fuel expenses amount and stations total debt amount
        const sum1 = totalDebtAmount + totalFuelAmount;
        const sum = dailySalesBookData.totalCash + sum1;

        // Check if the sum exceeds totalSales
        if (sum < dailySalesBookData.totalSales && Math.abs(dailySalesBookData.totalSales - sum) > 100) {
        console.log({ status: "fail", sum, sale: dailySalesBookData.totalSales });
        return {
            status: 500,
            message:
            "Sum of cash sales, fuel expenses and debts does not match total sales. Please review",
        };
        } else {
        //update next day sales book pumps
        // Retrieve station day sale pumps
        const pumpsSnapshot = await admin
            .firestore()
            .collection("pumpDaySalesBook")
            .doc(stationID)
            .collection(day)
            .get();

        if (!pumpsSnapshot.empty) {
            pumpsSnapshot.forEach(async (doc) => {
            const pumpData = doc.data();

            let cm = pumpData?.cm;

            if (pumpData?.cardSwap) {
                cm = pumpData?.newCardCM;
            }

            //update pump details
            //get next day sales pumps
            const pumpSalesDoc = await admin
                .firestore()
                .collection("pumpDaySalesBook")
                .doc(stationID)
                .collection(queryDate)
                .doc(pumpData?.pumpID)
                .get();

            const nextDayData = pumpSalesDoc.data();

            if (nextDayData) {
                await admin
                .firestore()
                .collection("pumpDaySalesBook")
                .doc(stationID)
                .collection(queryDate)
                .doc(pumpData?.pumpID)
                .update({ om: cm, cm, cardOM: cm, cardCM: cm });
            } else {
                //update station pump
                await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("pumps")
                .doc(pumpData?.pumpID)
                .update({ cardOM: cm, cardCM: cm });
            }
            });
        }

        //update daily sales book
        await admin
            .firestore()
            .collection("dailySalesBooks")
            .doc(dayBookID)
            .update({
            status: true,
            updated_by,
            updated_at,
            });

        return { status: 200, message: "Day book is closed successfully" };
        }
    } catch (error) {
        console.error("Error closing day book:", error);
        // throw new HttpsError("Failed to close day book");
        return { status: 500, message: "Failed to close day book sales" };
    }
});
