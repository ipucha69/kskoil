/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable padded-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.updatePassword = onCall(async (request) => {
    const data = request?.data;
    const { newPassword, userID } = data;

    try {
        // Update user password in Firebase Authentication
        await admin.auth().updateUser(userID, {
        password: newPassword,
        });

        return { status: 200, message: "Password is updated successfully" };
    } catch (error) {
        throw new HttpsError("internal", error.message); // Throw meaningful error
    }
});
