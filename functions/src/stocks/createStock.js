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
  FieldValue,
} = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.createStock = onCall(async (request) => {
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
            supplierID,
            supplierName,
            date,
            driver,
            station,
            truck,
            storage,
            description,
            created_by,
            updated_by,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        const totalLitres = parseInt(agoLitres || "0") + parseInt(pmsLitres || "0");

        // Create stock on bucket
        const stock = await getFirestore().collection("stockBucket").add({
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalLitres,
            totalPrice,
            supplierID,
            supplierName,
            date,
            paid: false,
            paidAmount: 0,
            storage,
            driverID: driver?.id,
            driverName: driver?.name,
            driverLicence: driver?.licence,
            driverPhone: driver?.phone,
            stationID: station?.id,
            stationName: station?.name,
            stationLocation: station?.location,
            stationRegion: station?.region,
            stationEwura: station?.ewura,
            stationTin: station?.tin,
            truck,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        await admin
        .firestore()
        .collection("stockBucket")
        .doc(stock.id)
        .update({ id: stock.id });

        // Write stock data to supplier
        await admin
        .firestore()
        .collection("suppliers")
        .doc(supplierID)
        .collection("purchases")
        .doc(stock.id)
        .set({
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalLitres,
            totalPrice,
            supplierID,
            supplierName,
            date,
            id: stock.id,
            paid: false,
            paidAmount: 0,
            storage,
            driverID: driver?.id,
            driverName: driver?.name,
            driverLicence: driver?.licence,
            driverPhone: driver?.phone,
            stationID: station?.id,
            stationName: station?.name,
            stationLocation: station?.location,
            stationRegion: station?.region,
            stationEwura: station?.ewura,
            stationTin: station?.tin,
            truck,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        //check if supplier has balance then deduct
        // Get the supplier document
        const supplierRef = admin
        .firestore()
        .collection("supplierBucket")
        .doc(supplierID);
        const supplierSnapshot = await supplierRef.get();
        const supplierData = supplierSnapshot.data();

        const diff = Math.abs(supplierData?.balance || 0 - totalPrice);

        // Update supplier debt
        await admin
        .firestore()
        .collection("suppliers")
        .doc(supplierID)
        .collection("account")
        .doc("info")
        .update({
            debt: FieldValue.increment(diff),
        });

        await admin
        .firestore()
        .collection("supplierBucket")
        .doc(supplierID)
        .update({
            debt: FieldValue.increment(diff),
        });

        if (storage) {
            //update stock data
            const stockInfo = await admin
                .firestore()
                .collection("stock")
                .doc("info")
                .get();

            if (stockInfo.exists) {
                //update available details
                await admin
                .firestore()
                .collection("stock")
                .doc("info")
                .update({
                    agoLitres: FieldValue.increment(parseInt(agoLitres)),
                    pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                    availableAgo: FieldValue.increment(parseInt(agoLitres)),
                    availablePms: FieldValue.increment(parseInt(pmsLitres)),
                    totalAgoPrice: FieldValue.increment(agoTotalPrice),
                    totalPmsPrice: FieldValue.increment(pmsTotalPrice),
                    totalPrice: FieldValue.increment(totalPrice),
                    totalLitres: FieldValue.increment(totalLitres),
                    totalAvailableLitres: FieldValue.increment(totalLitres),
                });
            } else {
                //create details
                await admin
                .firestore()
                .collection("stock")
                .doc("info")
                .set({
                    agoLitres: parseInt(agoLitres),
                    pmsLitres: parseInt(pmsLitres),
                    availableAgo: parseInt(agoLitres),
                    availablePms: parseInt(pmsLitres),
                    totalAgoPrice: agoTotalPrice,
                    totalPmsPrice: pmsTotalPrice,
                    totalPrice,
                    totalLitres,
                    totalAvailableLitres: totalLitres,
                });
            }
        } else {
        // Write stock data to station
        await admin
            .firestore()
            .collection("stations")
            .doc(station?.id)
            .collection("stocks")
            .doc(stock?.id)
            .set({
                agoLitres,
                pmsLitres,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID: station?.id,
                stationName: station?.name,
                date,
                id: stock?.id,
                description,
                created_by,
                updated_by,
                created_at,
                updated_at,
            });

        await admin
            .firestore()
            .collection("stationBucket")
            .doc(station?.id)
            .update({
                agoLitres: FieldValue.increment(parseInt(agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                availableAgoLitres: FieldValue.increment(parseInt(agoLitres)),
                availablePmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                totalFuelAmount: FieldValue.increment(totalPrice),
            });

        await admin
            .firestore()
            .collection("stations")
            .doc(station?.id)
            .collection("account")
            .doc("info")
            .update({
                agoLitres: FieldValue.increment(parseInt(agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                availableAgoLitres: FieldValue.increment(parseInt(agoLitres)),
                availablePmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                totalFuelAmount: FieldValue.increment(totalPrice),
            });
        }

        return { status: 200, message: "Stock is added successfully" };
    } catch (error) {
        console.error("Error adding stock:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
