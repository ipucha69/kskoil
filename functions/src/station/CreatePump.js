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

exports.createPump = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const {
        stationID,
        typeName,
        typeID,
        description,
        om,
        created_by,
        updated_by,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        const omData = parseInt(om);

        // Check for pump with same type for the station
        const pumpsQuery = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("pumps")
        .where("typeName", "==", typeName)
        .get();

        if (pumpsQuery.size > 0) {
        // If pumps with the same typeName exist, find if there is missing number
        let existingNumbers = new Set();
        let maxNumber = 0;
        pumpsQuery.forEach((doc) => {
            const pumpData = doc.data();
            existingNumbers.add(pumpData.name);
            if (pumpData.name > maxNumber) {
            maxNumber = pumpData.name;
            }
        });

        let newPumpNumber;
        if (existingNumbers.size === maxNumber) {
            // If no missing numbers, increment maxNumber
            newPumpNumber = maxNumber + 1;
        } else {
            // Find the first missing number in the sequence
            newPumpNumber = 1;
            while (existingNumbers.has(newPumpNumber)) {
            newPumpNumber++;
            }
        }

        // Create the new pump
        const pumpRef = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumps")
            .add({
            typeName,
            name: newPumpNumber,
            typeID,
            description,
            om: omData,
            cm: omData,
            cardOM: omData,
            cardCM: omData,
            totalFuelAmount: 0,
            litres: 0,
            status: true,
            stationID,
            created_by,
            updated_by,
            created_at,
            updated_at,
            });

        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumps")
            .doc(pumpRef.id)
            .update({ id: pumpRef?.id });

        // Create the new pump on bucket
        await admin.firestore().collection("pumpBucket").doc(pumpRef.id).set({
            typeName,
            name: newPumpNumber,
            typeID,
            description,
            om: omData,
            cm: omData,
            cardOM: omData,
            cardCM: omData,
            totalFuelAmount: 0,
            litres: 0,
            id: pumpRef?.id,
            stationID,
            status: true,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        //create pump card
        const cardRef = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumpCards")
            .doc(pumpRef?.id)
            .collection("info")
            .add({
            typeName,
            name: newPumpNumber,
            typeID,
            description,
            om: omData,
            cm: omData,
            pumpID: pumpRef?.id,
            totalFuelAmount: 0,
            litres: 0,
            stationID,
            status: true,
            detail: "ACTIVE",
            created_by,
            updated_by,
            created_at,
            updated_at,
            });

        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumpCards")
            .doc(pumpRef?.id)
            .collection("info")
            .doc(cardRef?.id)
            .update({ id: cardRef?.id });
        } else {
        //create new pump add pump number = 1
        const pumpRef = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumps")
            .add({
            typeName,
            name: 1,
            typeID,
            description,
            om: omData,
            cm: omData,
            cardOM: omData,
            cardCM: omData,
            totalFuelAmount: 0,
            litres: 0,
            stationID,
            status: true,
            created_by,
            updated_by,
            created_at,
            updated_at,
            });

        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumps")
            .doc(pumpRef.id)
            .update({ id: pumpRef?.id });

        //create new pump on bucket add pump number = 1
        await admin.firestore().collection("pumpBucket").doc(pumpRef.id).set({
            typeName,
            name: 1,
            typeID,
            description,
            om: omData,
            cm: omData,
            cardOM: omData,
            cardCM: omData,
            totalFuelAmount: 0,
            litres: 0,
            id: pumpRef?.id,
            status: true,
            stationID,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        //create pump card
        const cardRef = await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumpCards")
            .doc(pumpRef?.id)
            .collection("info")
            .add({
            typeName,
            name: 1,
            typeID,
            description,
            om: omData,
            cm: omData,
            pumpID: pumpRef?.id,
            totalFuelAmount: 0,
            litres: 0,
            stationID,
            status: true,
            detail: "ACTIVE",
            created_by,
            updated_by,
            created_at,
            updated_at,
            });

        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumpCards")
            .doc(pumpRef?.id)
            .collection("info")
            .doc(cardRef?.id)
            .update({ id: cardRef?.id });
        }

        return { status: 200, message: "Pump is saved successfully" };
    } catch (error) {
        console.error("Error saving pump:", error);
        throw new HttpsError("Failed to save pump"); // Throw a meaningful error
    }
});
