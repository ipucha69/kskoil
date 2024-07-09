// / eslint-disable linebreak-style /
// / eslint-disable object-curly-spacing /
// / eslint-disable indent /
// / eslint-disable linebreak-style /
// / eslint-disable no-unused-vars /
// / eslint-disable linebreak-style /
// / eslint-disable eol-last /
// / eslint-disable linebreak-style /
// / eslint-disable quotes /
// / eslint-disable max-len /
// / eslint-disable camelcase /
const admin = require("firebase-admin");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const moment = require("moment");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.createPriceTwoSale = onCall(async (request) => {
  try {
    //get data
    const data = request?.data;
    const {
        stationID,
        omAGO1Two,
        omAGO2Two,
        omAGO3Two,
        omAGO4Two,
        omPMS1Two,
        omPMS2Two,
        omPMS3Two,
        omPMS4Two,
        cmAGO1Two,
        cmAGO2Two,
        cmAGO3Two,
        cmAGO4Two,
        cmPMS1Two,
        cmPMS2Two,
        cmPMS3Two,
        cmPMS4Two,
        agoPriceTwo,
        agoTotalTwo,
        agoTotalLitresTwo,
        pmsPriceTwo,
        pmsTotalTwo,
        pmsTotalLitresTwo,
        totalLitresTwo,
        agoCashTwo,
        pmsCashTwo,
        totalCashTwo,
        totalSalesTwo,
        dayBookID,
        day,
        created_by,
        updated_by,
        description,
        skipped,
        stationName,
        saleType,
        checkedTwo,
    } = data;

    const created_at = Timestamp.fromDate(new Date());
    const updated_at = Timestamp.fromDate(new Date());

    //update day sales book
    await admin
        .firestore()
        .collection("dailySalesBooks")
        .doc(dayBookID)
        .update({
            omAGO1Two,
            omAGO2Two,
            omAGO3Two,
            omAGO4Two,
            omPMS1Two,
            omPMS2Two,
            omPMS3Two,
            omPMS4Two,
            cmAGO1Two,
            cmAGO2Two,
            cmAGO3Two,
            cmAGO4Two,
            cmPMS1Two,
            cmPMS2Two,
            cmPMS3Two,
            cmPMS4Two,
            agoTotalTwo,
            agoTotalLitresTwo,
            pmsTotalTwo,
            pmsTotalLitresTwo,
            totalLitresTwo,
            agoCashTwo,
            pmsCashTwo,
            totalCashTwo,
            totalSalesTwo,
            checkTwo: true,
            check: true,
            descriptionTwo: description,
            agoPriceTwo,
            pmsPriceTwo,
            agoTotal: FieldValue.increment(agoTotalTwo),
            agoTotalLitres: FieldValue.increment(agoTotalTwo),
            pmsTotal: FieldValue.increment(pmsTotalTwo),
            pmsTotalLitres: FieldValue.increment(agoTotalTwo),
            totalLitres: FieldValue.increment(totalLitresTwo),
            agoCash:FieldValue.increment(agoCashTwo),
            pmsCash: FieldValue.increment(pmsCashTwo),
            totalCash: FieldValue.increment(totalCashTwo),
            totalSales: FieldValue.increment(totalSalesTwo),
        });

        // Retrieve station pumps
        const pumpsSnapshot = await admin
            .firestore()
            .collection("pumpDaySalesBook")
            .doc(stationID)
            .collection(day)
            .get();

    async function setPumpSalesData({ om, cm, price, name, typeName, pumpID }) {
        const diff = cm - om;
        const amount = diff * price;
        const pumpSalesRef = admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("pumpSales");

        // Query to check if there's an existing pump sale with the same pumpID and dayBookID
        const querySnapshot = await pumpSalesRef
            .where("pumpID", "==", pumpID)
            .where("dayBookID", "==", dayBookID)
            .where("saleTwo", "==", true)
            .get();

        if (!querySnapshot.empty) {
            // If there's an existing pump sale, calculate the difference in cm and update cm field
            const existingPumpSale = querySnapshot.docs[0].data();
            const cmDifference = cm - existingPumpSale?.cm;
            const amountDifference = amount - existingPumpSale?.amount;

            await pumpSalesRef.doc(existingPumpSale?.id).update({
                cm: FieldValue.increment(cmDifference),
                amount: FieldValue.increment(amountDifference),
                saleType
            });

            await admin.firestore().collection("pumpSales").doc(existingPumpSale?.id).update({
                cm: FieldValue.increment(cmDifference),
                amount: FieldValue.increment(amountDifference),
                saleType
            });

            await admin.firestore().collection("stations").doc(stationID).collection("pumps").doc(pumpID).update({
                om: FieldValue.increment(cmDifference),
                litres: FieldValue.increment(cmDifference)
            });

            await admin.firestore().collection("pumpBucket").doc(pumpID).update({
                om: FieldValue.increment(cmDifference),
                litres: FieldValue.increment(cmDifference)
            });

            await admin
            .firestore()
            .collection("stationBucket")
            .doc(stationID)
            .update({ 
                availableAgoLitres: typeName === "AGO" ? FieldValue.increment(-cmDifference) : FieldValue.increment(0),
                availablePmsLitres: typeName === "PMS" ? FieldValue.increment(-cmDifference) : FieldValue.increment(0),
                soldAgoLitres: typeName === "AGO" ? FieldValue.increment(cmDifference) : FieldValue.increment(0), 
                soldPmsLitres: typeName === "PMS" ? FieldValue.increment(cmDifference) : FieldValue.increment(0),
                litres: FieldValue.increment(cmDifference),
                totalSalesAmount: FieldValue.increment(amountDifference),
             });

             await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("account")
            .doc("info")
            .update({ 
                availableAgoLitres: typeName === "AGO" ? FieldValue.increment(-cmDifference) : FieldValue.increment(0),
                availablePmsLitres: typeName === "PMS" ? FieldValue.increment(-cmDifference) : FieldValue.increment(0),
                soldAgoLitres: typeName === "AGO" ? FieldValue.increment(cmDifference) : FieldValue.increment(0), 
                soldPmsLitres: typeName === "PMS" ? FieldValue.increment(cmDifference) : FieldValue.increment(0),
                litres: FieldValue.increment(cmDifference),
                totalSalesAmount: FieldValue.increment(amountDifference),
             });

            await admin.firestore().collection("pumpDaySalesBook").doc(stationID).collection(day).doc(pumpID).update({
                cm: FieldValue.increment(cmDifference),
                totalFuelAmount: FieldValue.increment(amountDifference),
                litres: FieldValue.increment(cmDifference),
                omTwo: FieldValue.increment(cmDifference),
                cmTwo: FieldValue.increment(cmDifference)
            });

        } else {
            // If no existing pump sale found, proceed to add a new pump sale
            const diff = cm - om;
                const amount = diff * price;
                const pumpRef = await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("pumpSales")
                .add({
                    typeName,
                    name,
                    description,
                    om,
                    cm,
                    day,
                    price,
                    amount,
                    stationID,
                    stationName,
                    saleTwo: true,
                    pumpID,
                    dayBookID,
                    saleType,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at,
                    saleType
                });

                await pumpRef.update({ id: pumpRef.id });

                await admin.firestore().collection("pumpSales").doc(pumpRef.id).set({
                    typeName,
                    name,
                    description,
                    om,
                    cm,
                    day,
                    price,
                    amount,
                    stationID,
                    id: pumpRef.id,
                    stationName,
                    saleTwo: true,
                    pumpID,
                    dayBookID,
                    saleType,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at,
                    saleType
                });

                await admin
                .firestore()
                .collection("stationBucket")
                .doc(stationID)
                .update({ 
                    availableAgoLitres: typeName === "AGO" ? FieldValue.increment(-diff) : FieldValue.increment(0),
                    availablePmsLitres: typeName === "PMS" ? FieldValue.increment(-diff) : FieldValue.increment(0),
                    soldAgoLitres: typeName === "AGO" ? FieldValue.increment(diff) : FieldValue.increment(0), 
                    soldPmsLitres: typeName === "PMS" ? FieldValue.increment(diff) : FieldValue.increment(0),
                    litres: FieldValue.increment(diff),
                    totalSalesAmount: FieldValue.increment(amount),
                 });

                 await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("account")
                .doc("info")
                .update({ 
                    availableAgoLitres: typeName === "AGO" ? FieldValue.increment(-diff) : FieldValue.increment(0),
                    availablePmsLitres: typeName === "PMS" ? FieldValue.increment(-diff) : FieldValue.increment(0),
                    soldAgoLitres: typeName === "AGO" ? FieldValue.increment(diff) : FieldValue.increment(0), 
                    soldPmsLitres: typeName === "PMS" ? FieldValue.increment(diff) : FieldValue.increment(0),
                    litres: FieldValue.increment(diff),
                    totalSalesAmount: FieldValue.increment(amount),
                 });

                 await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("pumps")
                .doc(pumpID)
                .update({ 
                    om: cm, 
                    litres: FieldValue.increment(diff),
                    totalFuelAmount: FieldValue.increment(amount),
                 });

                await admin
                .firestore()
                .collection("pumpBucket")
                .doc(pumpID)
                .update({ 
                    om: cm, 
                    litres: FieldValue.increment(diff),
                    totalFuelAmount: FieldValue.increment(amount),
                 });

                await admin
                .firestore()
                .collection("pumpDaySalesBook")
                .doc(stationID)
                .collection(day)
                .doc(pumpID)
                .update({
                    updated_by,
                    updated_at,
                    cm,
                    cmTwo: cm,
                    litres: FieldValue.increment(diff),
                    totalFuelAmount: FieldValue.increment(amount),
                    saleType
                });
        }
    }

    pumpsSnapshot.forEach(async (doc) => {
        const pumpData = doc.data();
        const { typeName, name } = pumpData;

        if (typeName === "AGO" || typeName === "PMS") {
            let om, cm, price;

            switch (name) {
            case 1:
                om = typeName === "AGO" ? omAGO1Two : omPMS1Two;
                cm = typeName === "AGO" ? cmAGO1Two : cmPMS1Two;
                price = typeName === "AGO" ? agoPriceTwo : pmsPriceTwo;
                await setPumpSalesData({
                    om,
                    cm,
                    price,
                    name,
                    typeName,
                    pumpID: pumpData?.pumpID,
                });
                break;
            case 2:
                om = typeName === "AGO" ? omAGO2Two : omPMS2Two;
                cm = typeName === "AGO" ? cmAGO2Two : cmPMS2Two;
                price = typeName === "AGO" ? agoPriceTwo : pmsPriceTwo;
                await setPumpSalesData({
                    om,
                    cm,
                    price,
                    name,
                    typeName,
                    pumpID: pumpData?.pumpID,
                });
                break;
            case 3:
                om = typeName === "AGO" ? omAGO3Two : omPMS3Two;
                cm = typeName === "AGO" ? cmAGO3Two : cmPMS3Two;
                price = typeName === "AGO" ? agoPriceTwo : pmsPriceTwo;
                await setPumpSalesData({
                    om,
                    cm,
                    price,
                    name,
                    typeName,
                    pumpID: pumpData?.pumpID,
                });
                break;
            case 4:
                om = typeName === "AGO" ? omAGO4Two : omPMS4Two;
                cm = typeName === "AGO" ? cmAGO4Two : cmPMS4Two;
                price = typeName === "AGO" ? agoPriceTwo : pmsPriceTwo;
                await setPumpSalesData({
                    om,
                    cm,
                    price,
                    name,
                    typeName,
                    pumpID: pumpData?.pumpID,
                });
                break;
            default:
                break;
            }
        }
    });

    //update next day sales book if sale day was skipped
    if (skipped) {
        //get next day sales book
        const nextDay = moment(day, "DD-MM-YYYY")
            .add(1, "day")
            .format("DD-MM-YYYY");

        const dailySalesBooksRef = admin
            .firestore()
            .collection("dailySalesBooks");

        // Query for documents where stationID is and date is equal to nextDay
        const querySnapshot = await dailySalesBooksRef
            .where("stationID", "==", stationID)
            .where("day", "==", nextDay)
            .get();

        const dayBookData = querySnapshot.docs.map((doc) => doc.data());
        const dayData = dayBookData[0];

        //update data
        await admin
            .firestore()
            .collection("dailySalesBooks")
            .doc(dayData?.id)
            .update({
                omAGO1: cmAGO1Two,
                omAGO2: cmAGO2Two,
                omAGO3: cmAGO3Two,
                omAGO4: cmAGO4Two,
                omPMS1: cmPMS1Two,
                omPMS2: cmPMS2Two,
                omPMS3: cmPMS3Two,
                omPMS4: cmPMS4Two,
                cmAGO1: cmAGO1Two,
                cmAGO2: cmAGO2Two,
                cmAGO3: cmAGO3Two,
                cmAGO4: cmAGO4Two,
                cmPMS1: cmPMS1Two,
                cmPMS2: cmPMS2Two,
                cmPMS3: cmPMS3Two,
                cmPMS4: cmPMS4Two,
                agoPrice: agoPriceTwo,
                pmsPrice: pmsPriceTwo
            });
        }

        return { status: 200, message: "Day Price Two sale is saved successfully" };
    } catch (error) {
        console.error("Error saving day sale:", error);
        throw new HttpsError("Failed to save day sale"); // Throw a meaningful error
    }
});