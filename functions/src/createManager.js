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

exports.createManager = onCall(async (request) => {
    try {
        const data = request?.data;
        const { email, name, stationID, created_by, updated_by } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        // Create user in Firebase Authentication
        const user = await admin.auth().createUser({
        email,
        emailVerified: true,
        password: "manager@1234", // Consider using a stronger password policy
        displayName: name,
        disabled: false,
        });

        // Write user data to Firestore
        await admin
        .firestore()
        .collection("stations")
        .doc(stationID)
        .collection("managers")
        .doc(user?.uid)
        .set({
            email,
            name,
            stationID,
            status: true,
            role: "manager",
            userID: user.uid,
            created_at,
            created_by,
            updated_at,
            updated_by,
        });

        // Write user data to "userBucket" collection (consider streamlining structure)
        await admin.firestore().collection("userBucket").doc(user?.uid).set({
        name,
        email,
        stationID,
        status: true,
        role: "manager",
        roleID: "",
        userID: user?.uid,
        created_at,
        created_by,
        updated_at,
        updated_by,
        });

        await admin.firestore().collection("stationBucket").doc(stationID).update({
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

        return { status: 200, message: "Manager is created successfully" };
    } catch (error) {
        console.error("Error creating manager:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
