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
const {
  Timestamp,
  getFirestore,
} = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.createAdditionalStock = onCall({cors: true}, async (request) => {
    try {
        const data = request?.data;
        const {
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalPrice,
            day,
            station,
            description,
            created_by,
            updated_by,
        } = data;

        // Convert strings to numbers and round to two decimal places
        // const parsedAgoLitres = parseFloat(agoLitres);
        // const parsedPmsLitres = parseFloat(pmsLitres);

        // const formattedAgoLitres = parseFloat(parsedAgoLitres.toFixed(2) || "0.00");
        // const formattedPmsLitres = parseFloat(parsedPmsLitres.toFixed(2) || "0.00");

        const totalLitres = agoLitres + pmsLitres;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());
        const date = Timestamp.fromDate(new Date());

        // const totalLitres = parseInt(agoLitres || "0") + parseInt(pmsLitres || "0");

        // Create stock on bucket
        const stock = await getFirestore().collection("excessiveStockBucket").add({
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalLitres,
            totalPrice,
            date,
            day,
            stationID: station?.id,
            stationName: station?.name,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        await admin
        .firestore()
        .collection("excessiveStockBucket")
        .doc(stock.id)
        .update({ id: stock.id });

        // Write excessive stock data to station
        await admin
            .firestore()
            .collection("stations")
            .doc(station?.id)
            .collection("excessiveStocks")
            .doc(stock?.id)
            .set({
                agoLitres,
                pmsLitres,
                agoPrice,
                pmsPrice,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID: station?.id,
                stationName: station?.name,
                date,
                day,
                id: stock?.id,
                description,
                created_by,
                updated_by,
                created_at,
                updated_at,
            });

        async function incrementStringNumber(collectionRef, docId, fieldName, incrementBy) {
            const docSnapshot = await collectionRef.doc(docId).get();
            let currentValue = docSnapshot.data()[fieldName];
            currentValue += incrementBy;
            await collectionRef.doc(docId).update({ [fieldName]: currentValue});
        }
        
        // Usage within your function
        await incrementStringNumber(admin.firestore().collection("stationBucket"), station?.id, 'agoLitres', agoLitres);
        await incrementStringNumber(admin.firestore().collection("stationBucket"), station?.id, 'pmsLitres', pmsLitres);
        await incrementStringNumber(admin.firestore().collection("stationBucket"), station?.id, 'availableAgoLitres', agoLitres);
        await incrementStringNumber(admin.firestore().collection("stationBucket"), station?.id, 'availablePmsLitres', pmsLitres);
        

        await incrementStringNumber(admin.firestore().collection("stations").doc(station?.id).collection("account"), "info", 'agoLitres', agoLitres);
        await incrementStringNumber(admin.firestore().collection("stations").doc(station?.id).collection("account"), "info", 'pmsLitres', pmsLitres);
        await incrementStringNumber(admin.firestore().collection("stations").doc(station?.id).collection("account"), "info", 'availableAgoLitres', agoLitres);
        await incrementStringNumber(admin.firestore().collection("stations").doc(station?.id).collection("account"), "info", 'availablePmsLitres', pmsLitres);
        

        return { status: 200, message: "Excess stock is added successfully" };
    } catch (error) {
        console.error("Error adding excess stock:", error);
        throw new HttpsError("Error adding excess stock", error.message); // Throw a meaningful error
    }
});