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
const { Timestamp, getFirestore } = require("firebase-admin/firestore");
const moment = require("moment");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.createNewBook = onCall(async (request) => {
    try {
        // Get all stations from the stationBucket collection
        const stationsSnapshot = await admin
        .firestore()
        .collection("stationBucket")
        .get();

        // Iterate through each station
        stationsSnapshot.forEach(async (stationDoc) => {
        const station = stationDoc.data();
        const stationID = stationDoc.id;

        // Get the current date in YYYY-MM-DD format
        // const currentDate = moment().utcOffset(3).format("DD-MM-YYYY");
        // const queryDate = moment()
        //   .utcOffset(3)
        //   .subtract(1, "day")
        //   .format("DD-MM-YYYY");

        const currentDate = "06-07-2024";

        // Check if a dailySalesBook already exists for the station and current date
        const existingBookQuery = await admin
            .firestore()
            .collection("dailySalesBooks")
            .where("stationID", "==", stationID)
            .where("date", "==", currentDate)
            .limit(1)
            .get();

        // If a dailySalesBook doesn't exist for the station and current date, create one
        if (existingBookQuery.empty) {
            //get station pumps and their details
            const pumpsSnapshot = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumps")
            .get();

            if (!pumpsSnapshot.empty) {
            const docRef = await getFirestore()
                .collection("dailySalesBooks")
                .add({
                totalDebtAmount: 0,
                stationDebtAmount: 0,
                totalExpensesAmount: 0,
                agoPrice: parseInt(station?.agoPrice),
                pmsPrice: parseInt(station?.pmsPrice),
                status: false,
                date: Timestamp.fromDate(new Date()),
                day: currentDate,
                stationID,
                stationName: station?.name,
                check: false,
                });

            await admin
                .firestore()
                .collection("dailySalesBooks")
                .doc(docRef?.id)
                .update({ id: docRef?.id });

            if (docRef?.id) {
                // Promises array for asynchronous operations
                const promises = [];

                //for each pump create new book  station pump
                pumpsSnapshot.forEach((pumpDoc) => {
                const pump = pumpDoc.data();
                const pumpID = pumpDoc.id;

                // Adding asynchronous operation to promises array
                promises.push(
                    getFirestore()
                    .collection("pumpDaySalesBook")
                    .doc(stationID)
                    .collection(currentDate)
                    .doc(pumpID)
                    .set({
                        pumpID,
                        day: currentDate,
                        date: Timestamp.fromDate(new Date()),
                        agoPrice: parseInt(station?.agoPrice),
                        pmsPrice: parseInt(station?.pmsPrice),
                        cardSwap: false,
                        om: pump?.cardCM,
                        cm: pump?.cardCM,
                        cardCM: pump?.cardCM,
                        cardOM: pump?.cardCM,
                        typeName: pump?.typeName,
                        name: pump?.name,
                        typeID: pump?.typeID,
                        description: pump?.description,
                        totalFuelAmount: 0,
                        dayBookID: docRef?.id,
                        litres: pump?.litres,
                        status: pump?.status,
                        stationID: pump?.stationID,
                        created_by: pump?.created_by,
                        updated_by: pump?.updated_by,
                        created_at: pump?.created_at,
                        updated_at: pump?.updated_at,
                    })
                );
                });

                // Wait for all asynchronous operations to complete
                await Promise.all(promises);

                console.log(
                `Daily Sales Book created successfully for station ${stationID} and date ${currentDate}`
                );

                return { status: 200, message: "New Book is added successfully" };
            } else {
                console.log(
                `Daily Sales Book created successfully for station ${stationID} and date ${currentDate}`
                );

                return { status: 200, message: "New Book is added successfully" };
            }
            } else {
            console.log(
                `Station ${stationID} has no registered pumps on date ${currentDate}`
            );

            return { status: 200, message: "New Book is not added" };
            }
        } else {
            console.log(
            `Daily Sales Book already exists for station ${stationID} and date ${currentDate}`
            );

            return { status: 200, message: "New Book is added" };
        }
        });
    } catch (error) {
        console.error("Error adding stock:", error);
        throw new HttpsError("Failed to create new book"); // Throw a meaningful error
    }
});
