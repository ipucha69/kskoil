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

exports.createCustomer = onCall(async (request) => {
    try {
        const data = request?.data;
        const {
        name,
        phone,
        openingBalance,
        description,
        privateStatus,
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

        // Write customer data to Firestore
        const customer = await admin
        .firestore()
        .collection("customerBucket")
        .add({
            name,
            phone,
            description,
            balance,
            debt,
            openingBalance,
            status: true,
            private: privateStatus,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        await admin
        .firestore()
        .collection("customerBucket")
        .doc(customer.id)
        .update({ id: customer.id });

        // Write customer data to customer info
        await admin
        .firestore()
        .collection("customers")
        .doc(customer?.id)
        .collection("account")
        .doc("info")
        .set({
            name,
            phone,
            description,
            balance,
            debt,
            openingBalance,
            status: true,
            private: privateStatus,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        return { status: 200, message: "Customer is created successfully" };
    } catch (error) {
        console.error("Error creating customer:", error);
        throw new HttpsError("Failed to create customer", error.message);
    }
});
