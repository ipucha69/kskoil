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

exports.createPumpCard = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const {
        stationID,
        pumpID,
        description,
        oldCardCM,
        newCardCM,
        pump,
        day,
        created_by,
        updated_by,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        // Fetch old card and disable it
        const pumpsQuery = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("pumpCards")
        .doc(pumpID)
        .collection("info")
        .where("status", "==", true)
        .get();

        if (pumpsQuery.size > 0) {
        pumpsQuery.forEach(async (doc) => {
            const cardData = doc.data();
            //update and disable pump card
            await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumpCards")
            .doc(pumpID)
            .collection("info")
            .doc(cardData?.id)
            .update({
                status: false,
                cm: oldCardCM,
                detail: "CORRUPTED",
                updated_by,
                updated_at,
            });
        });
        }

        //Create new pump card
        const cardRef = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("pumpCards")
        .doc(pumpID)
        .collection("info")
        .add({
            typeName: pump?.typeName,
            name: pump?.name,
            typeID: pump?.typeID,
            description,
            om: 0,
            cm: newCardCM,
            pumpID,
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
        .collection("pumpCards")
        .doc(pumpID)
        .collection("info")
        .doc(cardRef?.id)
        .update({ id: cardRef?.id });

        //update pump details
        await admin
        .firestore()
        .collection("pumpDaySalesBook")
        .doc(stationID)
        .collection(day)
        .doc(pumpID)
        .update({ newCardOM: 0, newCardCM, oldCardCM, cardSwap: true, cardDescription: description });

        return { status: 200, message: "Pump card is replaced successfully" };
    } catch (error) {
        console.error("Error replacing pump card:", error);
        return { status: 500, message: "Failed to replace pump card" };
    }
});
