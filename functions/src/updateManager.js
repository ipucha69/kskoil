/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable padded-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.updateManager = onCall(async (request) => {
    const data = request?.data;
    const { email, userID, name, stationID, status, disabled, updated_by } = data;

    const updated_at = Timestamp.fromDate(new Date());

    try {
        // Update user in Firebase Authentication
        const user = await admin.auth().updateUser(userID, {
        email,
        displayName: name,
        emailVerified: true,
        disabled,
        });

        // Update user data in Firestore
        await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("managers")
        .doc(user?.id)
        .set(
            {
            userID,
            name,
            email,
            stationID,
            role: "manager",
            updated_at,
            updated_by,
            status,
            },
            { merge: true }
        );

        await admin.firestore().collection("userBucket").doc(userID).set(
        {
            name,
            email,
            stationID,
            role: "manager",
            status,
            userID,
            updated_at,
            updated_by,
        },
        { merge: true }
        );

        if (status) {
        //update manager name to station
        await admin
            .firestore()
            .collection("stationBucket")
            .doc(stationID)
            .update({
            manager: name,
            });

        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("account")
            .doc("info")
            .update({
            manager: name,
            });
        }

        return { status: 200, message: "Manager is updated successfully" };
    } catch (error) {
        throw new HttpsError("Failed to update manager", error.message); // Throw meaningful error
    }
});
