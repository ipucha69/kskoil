/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
/* eslint-disable linebreak-style */
/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable camelcase */
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.createUser = onCall(async (request) => {
    try {
        const data = request?.data;
        const { email, name, role, roleID, created_at, created_by } = data;

        // Create user in Firebase Authentication
        const user = await admin.auth().createUser({
        email,
        emailVerified: true,
        password: "psms@1234", // Consider using a stronger password policy
        displayName: name,
        disabled: false,
        });

        if (role === "admin") {
        await admin.auth().setCustomUserClaims(user.uid, { admin: true, role });
        } else {
        await admin.auth().setCustomUserClaims(user.uid, { admin: false, role });
        }

        // Write user data to Firestore
        await admin
        .firestore()
        .collection("users")
        .doc("admins")
        .collection(user?.uid)
        .doc("public")
        .collection("account")
        .doc("info")
        .set({
            email,
            name,
            status: true,
            role,
            roleID,
            userID: user.uid,
            created_at,
            created_by,
            updated_at: created_at,
            updated_by: created_by,
        });

        // Write user data to "userBucket" collection (consider streamlining structure)
        await admin.firestore().collection("userBucket").doc(user?.uid).set({
        name,
        email,
        status: true,
        role,
        roleID,
        userID: user?.uid,
        created_at,
        created_by,
        updated_at: created_at,
        updated_by: created_by,
        });

        if (role === "admin") {
        await admin
            .auth()
            .setCustomUserClaims(user?.uid, { admin: true, role: role })
            .then(() => {
            // The new custom claims will propagate to the user's ID token the
            // next time a new one is issued.
            console.log("User claim is added");
            });
        } else {
        await admin
            .auth()
            .setCustomUserClaims(user?.uid, { admin: false, role: role })
            .then(() => {
            // The new custom claims will propagate to the user's ID token the
            // next time a new one is issued.
            console.log("User claim is added");
            });
        }

        return { status: 200, message: "User is created successfully" };
    } catch (error) {
        console.error("Error creating user:", error);
        throw new HttpsError("Failed to create user", error.message); // Throw a meaningful error
    }
});
