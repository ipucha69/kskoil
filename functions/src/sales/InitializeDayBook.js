const admin = require("firebase-admin");
const { Timestamp, getFirestore } = require("firebase-admin/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const moment = require("moment-timezone");

exports.initializeDayBook = onSchedule(
    {
        schedule: "every day 07:00",
        timeZone: "Africa/Dar_es_Salaam",
    },
    async (request) => {
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
            const currentDate = moment()
            .tz("Africa/Dar_es_Salaam")
            .format("DD-MM-YYYY");
            const queryDate = moment()
            .tz("Africa/Dar_es_Salaam")
            .subtract(1, "day")
            .format("DD-MM-YYYY");

            // Check if a dailySalesBook already exists for the station and current date
            const existingBookQuery = await admin
            .firestore()
            .collection("dailySalesBooks")
            .where("stationID", "==", stationID)
            .where("date", "==", currentDate)
            .limit(1)
            .get();

            // If a dailySalesBook doesn't already exist for the station and current date, create one
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
                    day: queryDate,
                    stationID,
                    stationName: station?.name,
                    stationLocation: station?.location,
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
                        .collection(queryDate)
                        .doc(pumpID)
                        .set({
                        pumpID,
                        day: queryDate,
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
            }

            return { status: 200, message: "New Book is not added" };
            } else {
            console.log(
                `Daily Sales Book already exists for station ${stationID} and date ${currentDate}`
            );
            }

            return { status: 200, message: "New Book is not added" };
        });
        } catch (error) {
        console.error("Error creating new book:", error);
        }
    }
);
