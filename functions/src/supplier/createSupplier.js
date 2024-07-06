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

exports.createSupplier = onCall(async (request) => {
    try {
        const data = request?.data;
        const {
        name,
        phone,
        openingBalance,
        description,
        created_by,
        updated_by,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        let balance = 0;
        let debt = 0;

        if (openingBalance < 0) {
        debt = Math.abs(openingBalance);
        } else {
        balance = openingBalance;
        }

        // Write supplier data to Firestore
        const supplier = await admin
        .firestore()
        .collection("supplierBucket")
        .add({
            name,
            phone,
            description,
            balance,
            debt,
            openingBalance,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        await admin
        .firestore()
        .collection("supplierBucket")
        .doc(supplier.id)
        .update({ id: supplier.id });

        // Write supplier data to supplier info path
        await admin
        .firestore()
        .collection("suppliers")
        .doc(supplier?.id)
        .collection("account")
        .doc("info")
        .set({
            name,
            phone,
            description,
            balance,
            debt,
            openingBalance,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        return { status: 200, message: "Supplier is created successfully" };
    } catch (error) {
        console.error("Error creating supplier:", error);
        throw new HttpsError("Failed to create supplier", error.message);
    }
});
