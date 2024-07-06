/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable padded-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
const admin = require("firebase-admin");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.updateStock = onCall(async (request) => {
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
        id,
        driver,
        station,
        truck,
        storage,
        order,
        description,
        amount,
        amountAgo,
        amountPms,
        amountAgoPrice,
        amountPmsPrice,
        updated_by,
    } = data;

    const updated_at = Timestamp.fromDate(new Date());

    const totalLitres = parseInt(agoLitres || "0") + parseInt(pmsLitres || "0");
    const amountTotalLitres = amountAgo + amountPms;

    try {
        // Update stock bucket data in Firestore
        await admin.firestore().collection("stockBucket").doc(id).set(
        {
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalPrice,
            totalLitres,
            supplierID,
            supplierName,
            date,
            id,
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
            storage,
            description,
            updated_by,
            updated_at,
        },
        { merge: true }
        );

        //check if supplier is changed on update
        if (supplierID !== order?.supplierID) {
        //changed, delete data from old supplier
        // delete supplier purchase data in Firestore
        await admin
            .firestore()
            .collection("suppliers")
            .doc(order?.supplierID)
            .collection("purchases")
            .doc(id)
            .delete();

        //Re-calculate old old supplier balance and debt
        //Get supplier expenses and payments
        // Fetch old supplier expenses
        const expensesQuerySnapshot = await admin
            .firestore()
            .collection("suppliers")
            .doc(order?.supplierID)
            .collection("purchases")
            .get();

        let totalExpensesAmount = 0;
        expensesQuerySnapshot.forEach((doc) => {
            const expenseData = doc.data();
            totalExpensesAmount += expenseData.totalPrice;
        });

        // Fetch supplier payments
        const paymentsQuerySnapshot = await admin
            .firestore()
            .collection("suppliers")
            .doc(order?.supplierID)
            .collection("payments")
            .get();

        let totalPaymentsAmount = 0;
        paymentsQuerySnapshot.forEach((doc) => {
            const paymentData = doc.data();
            totalPaymentsAmount += paymentData.amount;
        });

        // Get the old supplier document
        const oldSupplierRef = admin
            .firestore()
            .collection("supplierBucket")
            .doc(order?.supplierID);
        const oldSupplierSnapshot = await oldSupplierRef.get();
        const oldSupplierData = oldSupplierSnapshot.data();

        let actualBalance = 0;
        let actualDebt = 0;

        const diffAmount = totalPaymentsAmount - totalExpensesAmount;
        const actualDiff = diffAmount + oldSupplierData?.openingBalance;
        if (actualDiff < 0) {
            actualDebt = Math.abs(actualDiff);
        } else {
            actualBalance = actualDiff;
        }

        // remove debt from old supplier
        await admin
            .firestore()
            .collection("suppliers")
            .doc(order?.supplierID)
            .collection("account")
            .doc("info")
            .update({
            debt: actualDebt,
            balance: actualBalance,
            });

        // remove debt from old supplier
        await admin
            .firestore()
            .collection("supplierBucket")
            .doc(order?.supplierID)
            .update({
            debt: actualDebt,
            balance: actualBalance,
            });

        //Write data to new supplier
        // Write stock data to supplier
        await admin
            .firestore()
            .collection("suppliers")
            .doc(supplierID)
            .collection("purchases")
            .doc(id)
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
            id,
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
            created_by: updated_by,
            updated_by,
            created_at: updated_at,
            updated_at,
            transferFrom: order?.supplierID,
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

        // Update debt to new supplier
        await admin
            .firestore()
            .collection("suppliers")
            .doc(supplierID)
            .collection("account")
            .doc("info")
            .update({
            debt: FieldValue.increment(diff),
            });

        // Update debt to new supplier
        await admin
            .firestore()
            .collection("supplierBucket")
            .doc(supplierID)
            .update({
            debt: FieldValue.increment(diff),
            });
        } else {
        //not changed, proceed with the update
        // Update supplier purchase data in Firestore
        await admin
            .firestore()
            .collection("suppliers")
            .doc(supplierID)
            .collection("purchases")
            .doc(id)
            .set(
            {
                agoLitres,
                pmsLitres,
                agoPrice,
                pmsPrice,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                supplierID,
                supplierName,
                date,
                id,
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
                updated_by,
                updated_at,
            },
            { merge: true }
            );

        // Update supplier debt
        await admin
            .firestore()
            .collection("suppliers")
            .doc(supplierID)
            .collection("account")
            .doc("info")
            .update({
            debt: FieldValue.increment(amount),
            });

        await admin
            .firestore()
            .collection("supplierBucket")
            .doc(supplierID)
            .update({
            debt: FieldValue.increment(amount),
            });
        }

        //check storage details
        if (storage) {
        //check if storage details are changed
        if (order?.storage) {
            //not changed proceed with update
            //update stock info
            await admin
            .firestore()
            .collection("stock")
            .doc("info")
            .update({
                agoLitres: FieldValue.increment(parseInt(amountAgo)),
                pmsLitres: FieldValue.increment(parseInt(amountPms)),
                availableAgo: FieldValue.increment(parseInt(amountAgo)),
                availablePms: FieldValue.increment(parseInt(amountPms)),
                totalAgoPrice: FieldValue.increment(amountAgoPrice),
                totalPmsPrice: FieldValue.increment(amountPmsPrice),
                totalPrice: FieldValue.increment(amount),
                totalLitres: FieldValue.increment(amountTotalLitres),
                totalAvailableLitres: FieldValue.increment(amountTotalLitres),
            });
        } else {
            //storage detail is changed
            //write stock info and update station details
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

            //delete order details from station
            await admin
            .firestore()
            .collection("stations")
            .doc(order?.stationID)
            .collection("stocks")
            .doc(id)
            .delete();

            await admin
            .firestore()
            .collection("stationBucket")
            .doc(order?.stationID)
            .update({
                agoLitres: FieldValue.increment(parseInt(-order?.agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(-order?.pmsLitres)),
                totalFuelAmount: FieldValue.increment(-order?.totalPrice),
            });

            await admin
            .firestore()
            .collection("stations")
            .doc(order?.stationID)
            .collection("account")
            .doc("info")
            .update({
                agoLitres: FieldValue.increment(parseInt(-order?.agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(-order?.pmsLitres)),
                totalFuelAmount: FieldValue.increment(-order?.totalPrice),
            });
        }
        } else {
        //storage detail is direct to station
        //check if storage detail is changed
        if (order?.storage) {
            //changed, remove data from storage
            await admin
            .firestore()
            .collection("stock")
            .doc("info")
            .update({
                agoLitres: FieldValue.increment(parseInt(-order?.agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(-order?.pmsLitres)),
                availableAgo: FieldValue.increment(parseInt(-order?.agoLitres)),
                availablePms: FieldValue.increment(parseInt(-order?.pmsLitres)),
                totalAgoPrice: FieldValue.increment(-order?.agoTotalPrice),
                totalPmsPrice: FieldValue.increment(-order?.pmsTotalPrice),
                totalPrice: FieldValue.increment(-order?.totalPrice),
                totalLitres: FieldValue.increment(-order?.totalLitres),
                totalAvailableLitres: FieldValue.increment(-order?.totalLitres),
            });
        } else {
            //not changed proceed with update
            //check if station detail is changed
            if (order?.stationID !== station?.id) {
            //remove data from old station then write data into new station
            await admin
                .firestore()
                .collection("stations")
                .doc(order?.stationID)
                .collection("stocks")
                .doc(id)
                .delete();

            await admin
                .firestore()
                .collection("stationBucket")
                .doc(order?.stationID)
                .update({
                agoLitres: FieldValue.increment(parseInt(-order?.agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(-order?.pmsLitres)),
                totalFuelAmount: FieldValue.increment(-order?.totalPrice),
                });

            await admin
                .firestore()
                .collection("stations")
                .doc(station?.id)
                .collection("account")
                .doc("info")
                .update({
                agoLitres: FieldValue.increment(parseInt(-order?.agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(-order?.pmsLitres)),
                totalFuelAmount: FieldValue.increment(-order?.totalPrice),
                });

            //write data into new station
            await admin
                .firestore()
                .collection("stations")
                .doc(station?.id)
                .collection("stocks")
                .doc(id)
                .update({
                agoLitres,
                pmsLitres,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID: station?.id,
                stationName: station?.name,
                date,
                id,
                description,
                updated_by,
                updated_at,
                });

            await admin
                .firestore()
                .collection("stationBucket")
                .doc(station?.id)
                .update({
                agoLitres: FieldValue.increment(parseInt(agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
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
                totalFuelAmount: FieldValue.increment(totalPrice),
                });
            } else {
            //not changed proceed with update
            //update station details
            await admin
                .firestore()
                .collection("stations")
                .doc(station?.id)
                .collection("stocks")
                .doc(id)
                .update({
                agoLitres,
                pmsLitres,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID: station?.id,
                stationName: station?.name,
                date,
                id,
                description,
                updated_by,
                updated_at,
                });

            await admin
                .firestore()
                .collection("stationBucket")
                .doc(station?.id)
                .update({
                agoLitres: FieldValue.increment(parseInt(agoLitres)),
                pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
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
                totalFuelAmount: FieldValue.increment(totalPrice),
                });
            }
        }
        }

        return { status: 200, message: "Stock is updated successfully" };
    } catch (error) {
        throw new HttpsError("internal", error.message); // Throw meaningful error
    }
});
