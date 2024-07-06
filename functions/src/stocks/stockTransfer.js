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
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

exports.stockTransfer = onCall({ cors: true }, async (request) => {
    const data = request?.data;
    try {
        const {
        agoLitres,
        pmsLitres,
        agoPrice,
        pmsPrice,
        agoTotalPrice,
        pmsTotalPrice,
        totalPrice,
        stationID,
        stationName,
        stationLocation,
        customerID,
        customerName,
        date,
        destination,
        driver,
        truck,
        description,
        created_by,
        updated_by,
        } = data;

        const created_at = Timestamp.fromDate(new Date());
        const updated_at = Timestamp.fromDate(new Date());

        const totalLitres = parseInt(agoLitres || "0") + parseInt(pmsLitres || "0");

        // Create stock transfer on bucket
        const stock = await admin
        .firestore()
        .collection("stockTransferBucket")
        .add({
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalPrice,
            totalLitres,
            stationID,
            stationName,
            stationLocation,
            customerID,
            customerName,
            destination,
            driverID: driver?.id,
            driverName: driver?.name,
            driverLicence: driver?.licence,
            driverPhone: driver?.phone,
            truck,
            date,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        // Update documents with generated ID (assuming necessary)
        await admin
        .firestore()
        .collection("stockTransferBucket")
        .doc(stock.id)
        .update({ id: stock.id });

        //check transfer destination
        if (destination === "station") {
        // Write stock data to station
        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("stocks")
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
            stationID,
            stationName,
            stationLocation,
            destination,
            driverID: driver?.id,
            driverName: driver?.name,
            driverLicence: driver?.licence,
            driverPhone: driver?.phone,
            truck,
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
            .doc(stationID)
            .update({
            agoLitres: FieldValue.increment(parseInt(agoLitres)),
            pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
            totalFuelAmount: FieldValue.increment(totalPrice),
            });

        await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("account")
            .doc("info")
            .update({
            agoLitres: FieldValue.increment(parseInt(agoLitres)),
            pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
            totalFuelAmount: FieldValue.increment(totalPrice),
            });
        }

        if (destination === "customer") {
        // Write stock data to customer
        // Get the customer document
        const customerRef = admin
            .firestore()
            .collection("customerBucket")
            .doc(customerID);
        const customerSnapshot = await customerRef.get();
        const customerData = customerSnapshot.data();

        let paidAmount = 0;
        let paid = false;
        let balance = 0;
        let debt = 0;
        if (customerData?.balance > 0) {
            if (customerData?.balance > totalPrice) {
            paid = true;
            paidAmount = totalPrice;
            balance = customerData?.balance - totalPrice;
            } else {
            paidAmount = customerData?.balance;
            debt = totalPrice - customerData?.balance;
            }
        } else {
            debt = totalPrice;
        }

        //add data to private debtors Bucket
        await admin.firestore().collection("privateDebtors").doc(stock?.id).set({
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalPrice,
            totalLitres,
            stationID,
            stationName,
            stationLocation,
            customerID,
            customerName,
            destination,
            driverID: driver?.id,
            driverName: driver?.name,
            driverLicence: driver?.licence,
            driverPhone: driver?.phone,
            truck,
            date,
            paid,
            id: stock?.id,
            paidAmount,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
        });

        //add debt details to customer
        await admin
            .firestore()
            .collection("customers")
            .doc(customerID)
            .collection("privateExpenses")
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
            stationID,
            stationName,
            stationLocation,
            customerID,
            customerName,
            destination,
            driverID: driver?.id,
            driverName: driver?.name,
            driverLicence: driver?.licence,
            driverPhone: driver?.phone,
            truck,
            date,
            paid,
            paidAmount,
            id: stock?.id,
            description,
            created_by,
            updated_by,
            created_at,
            updated_at,
            });

        //update customer path
        await admin
            .firestore()
            .collection("customers")
            .doc(customerID)
            .collection("account")
            .doc("info")
            .update({
            debt: FieldValue.increment(debt),
            balance,
            });

        //update customer bucket
        await admin
            .firestore()
            .collection("customerBucket")
            .doc(customerID)
            .update({
            debt: FieldValue.increment(debt),
            balance,
            });
        }

        // Update relevant collections using FieldValue for concurrency safety
        await admin
        .firestore()
        .collection("stock")
        .doc("info")
        .update({
            transferredAgo: FieldValue.increment(parseInt(agoLitres)),
            transferredPms: FieldValue.increment(parseInt(pmsLitres)),
            availableAgo: FieldValue.increment(parseInt(-agoLitres)),
            availablePms: FieldValue.increment(parseInt(-pmsLitres)),
            totalAvailableLitres: FieldValue.increment(-totalLitres),
        });

        return { status: 200, message: "Stock is transferred successfully" };
    } catch (error) {
        console.error("Error transferring stock:", error);
        throw new HttpsError("Error transferring stock", error.message); // Throw a meaningful error
    }
});
