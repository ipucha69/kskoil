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
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { FieldValue } = require("firebase-admin/firestore");

exports.stockDistribution = onCall({ cors: true }, async (request) => {
    try {
        const data = request?.data;
        const {
        litres,
        price,
        fuel,
        totalPrice,
        stationID,
        pumpID,
        pumpName,
        date,
        description,
        } = data;

        const created_by = "";
        const updated_by = "";
        const created_at = "";
        const updated_at = "";

        // Create stock transfer on bucket
        const stock = await admin
        .firestore()
        .collection("pumpStockTransferBucket")
        .add({
            litres,
            price,
            fuel,
            totalPrice,
            pumpID,
            stationID,
            pumpName,
            date,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        // Update documents with generated ID (assuming necessary)
        await Promise.all([
        admin
            .firestore()
            .collection("pumpStockTransferBucket")
            .doc(stock.id)
            .update({ id: stock.id }),
        admin
            .firestore()
            .collection("pumps")
            .doc(pumpID)
            .collection("stocks")
            .doc(stock.id)
            .set({
            litres,
            price,
            totalPrice,
            fuel,
            stationID,
            pumpID,
            pumpName,
            date,
            id: stock?.id,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
            }),
        admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("distributions")
            .doc(stock.id)
            .set({
            litres,
            price,
            totalPrice,
            fuel,
            stationID,
            pumpID,
            pumpName,
            date,
            id: stock?.id,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
            }),
        ]);

        // Update relevant collections using FieldValue for concurrency safety
        await Promise.all([
        admin
            .firestore()
            .collection("pumpBucket")
            .doc(pumpID)
            .update({
            litres: FieldValue.increment(parseInt(litres)),
            totalFuelAmount: FieldValue.increment(totalPrice),
            availableLitres: FieldValue.increment(parseInt(litres)),
            }),
        admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumps")
            .doc(pumpID)
            .update({
            litres: FieldValue.increment(parseInt(litres)),
            totalFuelAmount: FieldValue.increment(totalPrice),
            availableLitres: FieldValue.increment(parseInt(litres)),
            }),
        ]);

        return { status: 200, message: "Stock is distributed successfully" };
    } catch (error) {
        console.error("Error transferring stock:", error);
        throw new HttpsError("Error transferring stock", error.message); // Throw a meaningful error
    }
});
