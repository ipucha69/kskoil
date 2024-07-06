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

exports.updateUser = onCall(async (request) => {
    const data = request?.data;
    const {
        email,
        userID,
        name,
        role,
        roleID,
        status,
        disabled,
        updated_at,
        updated_by,
    } = data;

    try {
        // Update user in Firebase Authentication
        await admin.auth().updateUser(userID, {
        email,
        displayName: name,
        emailVerified: true,
        disabled,
        });

        // Update user data in Firestore
        await admin
        .firestore()
        .collection("users")
        .doc("admins")
        .collection(userID)
        .doc("public")
        .collection("account")
        .doc("info")
        .set(
            {
            userID,
            name,
            email,
            role,
            roleID,
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
            role,
            roleID,
            status,
            userID,
            updated_at,
            updated_by,
        },
        { merge: true }
        );

        if (role === "admin") {
        await admin
            .auth()
            .setCustomUserClaims(userID, { admin: true, role: role })
            .then(() => {
            // The new custom claims will propagate to the user's ID token the
            // next time a new one is issued.
            console.log("User claim is added");
            });
        } else {
        await admin
            .auth()
            .setCustomUserClaims(userID, { admin: false, role: role })
            .then(() => {
            // The new custom claims will propagate to the user's ID token the
            // next time a new one is issued.
            console.log("User claim is added");
            });
        }

        return { status: 200, message: "User is updated successfully" };
    } catch (error) {
        throw new HttpsError("Failed to update user", "Failed to update user"); // Throw meaningful error
    }
});
