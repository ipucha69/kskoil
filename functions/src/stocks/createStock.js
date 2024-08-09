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

        // Convert strings to numbers and round to two decimal places
        const parsedAgoLitres = parseFloat(agoLitres);
        const parsedPmsLitres = parseFloat(pmsLitres);

        const formattedAgoLitres = parseFloat(parsedAgoLitres.toFixed(2) || "0.00");
        const formattedPmsLitres = parseFloat(parsedPmsLitres.toFixed(2) || "0.00");

        const totalLitres = formattedAgoLitres + formattedPmsLitres;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        // const totalLitres = parseInt(agoLitres || "0") + parseInt(pmsLitres || "0");

        // Create stock on bucket
        const stock = await getFirestore().collection("stockBucket").add({
            agoLitres: formattedAgoLitres.toString(),
            pmsLitres: formattedPmsLitres.toString(),
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalLitres: totalLitres.toString(),
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
            agoLitres: formattedAgoLitres.toString(),
            pmsLitres: formattedPmsLitres.toString(),
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalLitres: totalLitres.toString(),
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
                async function incrementStringNumber(collectionRef, docId, fieldName, incrementBy) {
                    const docSnapshot = await collectionRef.doc(docId).get();
                    let currentValue = parseFloat(docSnapshot.data()[fieldName] || "0.00");
                    currentValue += incrementBy;
                    await collectionRef.doc(docId).update({ [fieldName]: currentValue.toString() });
                }
                
                // Usage within your function
                await incrementStringNumber(admin.firestore().collection("stock"), "info", 'agoLitres', formattedAgoLitres);
                await incrementStringNumber(admin.firestore().collection("stock"), "info", 'pmsLitres', formattedPmsLitres);
                await incrementStringNumber(admin.firestore().collection("stock"), "info", 'availableAgo', formattedAgoLitres);
                await incrementStringNumber(admin.firestore().collection("stock"), "info", 'availablePms', formattedPmsLitres);
                await incrementStringNumber(admin.firestore().collection("stock"), "info", 'totalLitres', totalLitres);
                await incrementStringNumber(admin.firestore().collection("stock"), "info", 'totalAvailableLitres', totalLitres);
                
                await admin
                .firestore()
                .collection("stock")
                .doc("info")
                .update({
                    // agoLitres: FieldValue.increment(parseInt(agoLitres)),
                    // pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                    // availableAgo: FieldValue.increment(parseInt(agoLitres)),
                    // availablePms: FieldValue.increment(parseInt(pmsLitres)),
                    totalAgoPrice: FieldValue.increment(agoTotalPrice),
                    totalPmsPrice: FieldValue.increment(pmsTotalPrice),
                    totalPrice: FieldValue.increment(totalPrice),
                    // totalLitres: FieldValue.increment(totalLitres),
                    // totalAvailableLitres: FieldValue.increment(totalLitres),
                });
            } else {
                //create details
                await admin
                .firestore()
                .collection("stock")
                .doc("info")
                .set({
                    agoLitres: formattedAgoLitres.toString(),
                    pmsLitres: formattedPmsLitres.toString(),
                    availableAgo: formattedAgoLitres.toString(),
                    availablePms: formattedPmsLitres.toString(),
                    totalAgoPrice: agoTotalPrice,
                    totalPmsPrice: pmsTotalPrice,
                    totalPrice,
                    totalLitres: totalLitres.toString(),
                    totalAvailableLitres: totalLitres.toString(),
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
                agoLitres: formattedAgoLitres.toString(),
                pmsLitres: formattedPmsLitres.toString(),
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres: totalLitres.toString(),
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

        async function incrementStringNumber(collectionRef, docId, fieldName, incrementBy) {
            const docSnapshot = await collectionRef.doc(docId).get();
            let currentValue = parseFloat(docSnapshot.data()[fieldName] || "0.00");
            currentValue += incrementBy;
            await collectionRef.doc(docId).update({ [fieldName]: currentValue.toString() });
        }
        
        // Usage within your function
        await incrementStringNumber(admin.firestore().collection("stationBucket"), station?.id, 'agoLitres', formattedAgoLitres);
        await incrementStringNumber(admin.firestore().collection("stationBucket"), station?.id, 'pmsLitres', formattedPmsLitres);
        await incrementStringNumber(admin.firestore().collection("stationBucket"), station?.id, 'availableAgoLitres', formattedAgoLitres);
        await incrementStringNumber(admin.firestore().collection("stationBucket"), station?.id, 'availablePmsLitres', formattedPmsLitres);
        
        await admin
            .firestore()
            .collection("stationBucket")
            .doc(station?.id)
            .update({
                // agoLitres: FieldValue.increment(parseInt(agoLitres)),
                // pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                // availableAgoLitres: FieldValue.increment(parseInt(agoLitres)),
                // availablePmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                totalFuelAmount: FieldValue.increment(totalPrice),
            });

        await incrementStringNumber(admin.firestore().collection("stations").doc(station?.id).collection("account"), "info", 'agoLitres', formattedAgoLitres);
        await incrementStringNumber(admin.firestore().collection("stations").doc(station?.id).collection("account"), "info", 'pmsLitres', formattedPmsLitres);
        await incrementStringNumber(admin.firestore().collection("stations").doc(station?.id).collection("account"), "info", 'availableAgoLitres', formattedAgoLitres);
        await incrementStringNumber(admin.firestore().collection("stations").doc(station?.id).collection("account"), "info", 'availablePmsLitres', formattedPmsLitres);
        
        await admin
            .firestore()
            .collection("stations")
            .doc(station?.id)
            .collection("account")
            .doc("info")
            .update({
                // agoLitres: FieldValue.increment(parseInt(agoLitres)),
                // pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                // availableAgoLitres: FieldValue.increment(parseInt(agoLitres)),
                // availablePmsLitres: FieldValue.increment(parseInt(pmsLitres)),
                totalFuelAmount: FieldValue.increment(totalPrice),
            });
        }

        return { status: 200, message: "Stock is added successfully" };
    } catch (error) {
        console.error("Error adding stock:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
