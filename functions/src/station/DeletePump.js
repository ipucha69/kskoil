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

exports.deletePump = onCall(async (request) => {
    try {
        //get data
        const data = request?.data;
        const { pump, updated_by } = data;

        const updated_at = Timestamp.fromDate(new Date());

        const pumpID = pump?.id;
        const stationID = pump?.stationID;

        // Delete the pump from main path
        await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("pumps")
        .doc(pumpID)
        .delete();

        // delete the pump from bucket
        await admin.firestore().collection("pumpBucket").doc(pumpID).delete();

        //write deleted data into archive
        await admin
        .firestore()
        .collection("archive")
        .doc("deleted")
        .collection("pumps")
        .doc(pumpID)
        .set({ ...pump, deleted_by: updated_by, deleted_at: updated_at });

        // Check for pump cards for the deleted pump
        const pumpsQuery = await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("pumpCards")
        .doc(pumpID)
        .collection("info")
        .get();

        if (pumpsQuery.size > 0) {
        pumpsQuery.forEach(async (doc) => {
            const cardData = doc.data();
            //delete pump card
            await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumpCards")
            .doc(pumpID)
            .collection("info")
            .doc(cardData?.id)
            .delete();
        });
        }

        return { status: 200, message: "Pump is deleted successfully" };
    } catch (error) {
        console.error("Error deleting pump:", error);
        throw new HttpsError("Failed to delete pump"); // Throw a meaningful error
    }
});
