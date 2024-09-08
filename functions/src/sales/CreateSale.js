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

exports.createSale = onCall(async (request) => {
  try {
    //get data
    const data = request?.data;
    const {
      stationID,
      omAGO1,
      omAGO2,
      omAGO3,
      omAGO4,
      omPMS1,
      omPMS2,
      omPMS3,
      omPMS4,
      cmAGO1,
      cmAGO2,
      cmAGO3,
      cmAGO4,
      cmPMS1,
      cmPMS2,
      cmPMS3,
      cmPMS4,
      agoPrice,
      agoTotal,
      agoTotalLitres,
      pmsPrice,
      pmsTotal,
      pmsTotalLitres,
      totalLitres,
      agoCash,
      pmsCash,
      totalCash,
      totalSales,
      dayBookID,
      day,
      created_by,
      updated_by,
      description,
      skipped,
      stationName,
      saleType,
      availabeAgoL,
      availabePmsL,
      soldAgoL,
      soldPmsL,
    } = data;

    const created_at = Timestamp.fromDate(new Date());
    const updated_at = Timestamp.fromDate(new Date());

    //update day sales book
    await admin
      .firestore()
      .collection("dailySalesBooks")
      .doc(dayBookID)
      .update({
        omAGO1,
        omAGO2,
        omAGO3,
        omAGO4,
        omPMS1,
        omPMS2,
        omPMS3,
        omPMS4,
        cmAGO1,
        cmAGO2,
        cmAGO3,
        cmAGO4,
        cmPMS1,
        cmPMS2,
        cmPMS3,
        cmPMS4,
        agoTotalOne: agoTotal,
        agoTotal,
        agoTotalLitresOne: agoTotalLitres,
        agoTotalLitres,
        pmsTotalOne: pmsTotal,
        pmsTotal,
        pmsTotalLitresOne: pmsTotalLitres,
        pmsTotalLitres,
        totalLitresOne: totalLitres,
        totalLitres,
        agoCashOne: agoCash,
        agoCash,
        pmsCashOne: pmsCash,
        pmsCash,
        totalCashOne: totalCash,
        totalCash,
        totalSalesOne: totalSales,
        totalSales,
        checkOne: true,
        checkTwo: false,
        check: true,
        descriptionOne: description,
        description,
        saleType,
      });

    if (saleType == 2) {
      //update day sales book
      await admin
        .firestore()
        .collection("dailySalesBooks")
        .doc(dayBookID)
        .update({
          omAGO1Two: cmAGO1,
          omAGO2Two: cmAGO2,
          omAGO3Two: cmAGO3,
          omAGO4Two: cmAGO4,
          omPMS1Two: cmPMS1,
          omPMS2Two: cmPMS2,
          omPMS3Two: cmPMS3,
          omPMS4Two: cmPMS4,
          cmAGO1Two: cmAGO1,
          cmAGO2Two: cmAGO2,
          cmAGO3Two: cmAGO3,
          cmAGO4Two: cmAGO4,
          cmPMS1Two: cmPMS1,
          cmPMS2Two: cmPMS2,
          cmPMS3Two: cmPMS3,
          cmPMS4Two: cmPMS4,
        });
    }

    await admin.firestore().collection("stationBucket").doc(stationID).update({
      availableAgoLitres: availabeAgoL,
      availablePmsLitres: availabePmsL,
      soldAgoLitres: soldAgoL,
      soldPmsLitres: soldPmsL,
    });

    await admin
      .firestore()
      .collection("stations")
      .doc(stationID)
      .collection("account")
      .doc("info")
      .update({
        availableAgoLitres: availabeAgoL,
        availablePmsLitres: availabePmsL,
        soldAgoLitres: soldAgoL,
        soldPmsLitres: soldPmsL,
      });

    // Retrieve station pumps
    const pumpsSnapshot = await admin
      .firestore()
      .collection("pumpDaySalesBook")
      .doc(stationID)
      .collection(day)
      .get();

    async function setPumpSalesData({ om, cm, price, name, typeName, pumpID }) {
      const diff = parseFloat((cm - om).toFixed(2));
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
        .where("saleTwo", "==", false)
        .get();

      if (!querySnapshot.empty) {
        // If there's an existing pump sale, calculate the difference in cm and update cm field
        const existingPumpSale = querySnapshot.docs[0].data();
        const cmDifference = cm - existingPumpSale?.cm;
        const amountDifference = amount - existingPumpSale?.amount;

        await pumpSalesRef.doc(existingPumpSale?.id).update({
          cm: FieldValue.increment(cmDifference),
          amount: FieldValue.increment(amountDifference),
          saleType,
        });

        await admin
          .firestore()
          .collection("pumpSales")
          .doc(existingPumpSale?.id)
          .update({
            cm: FieldValue.increment(cmDifference),
            amount: FieldValue.increment(amountDifference),
            saleType,
          });

        await admin
          .firestore()
          .collection("stations")
          .doc(stationID)
          .collection("pumps")
          .doc(pumpID)
          .update({
            om: FieldValue.increment(cmDifference),
            litres: FieldValue.increment(cmDifference),
          });

        await admin
          .firestore()
          .collection("pumpBucket")
          .doc(pumpID)
          .update({
            om: FieldValue.increment(cmDifference),
            litres: FieldValue.increment(cmDifference),
          });

        await admin
          .firestore()
          .collection("stationBucket")
          .doc(stationID)
          .update({
            // availableAgoLitres: typeName === "AGO" ? availableAgoL.toString() : data?.availableAgoLitres,
            // availablePmsLitres: typeName === "PMS" ? availablePmsL.toString() : data?.availablePmsLitres,
            // soldAgoLitres: typeName === "AGO" ? soldAgoL.toString() : data?.soldAgoLitres,
            // soldPmsLitres: typeName === "PMS" ? soldPmsL.toString() : data?.soldPmsLitres,
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
            //  availableAgoLitres: typeName === "AGO" ? availableAgoL.toString() : data?.availableAgoLitres,
            //  availablePmsLitres: typeName === "PMS" ? availablePmsL.toString() : data?.availablePmsLitres,
            //  soldAgoLitres: typeName === "AGO" ? soldAgoL.toString() : data?.soldAgoLitres,
            //  soldPmsLitres: typeName === "PMS" ? soldPmsL.toString() : data?.soldPmsLitres,
            litres: FieldValue.increment(cmDifference),
            totalSalesAmount: FieldValue.increment(amountDifference),
          });

        await admin
          .firestore()
          .collection("pumpDaySalesBook")
          .doc(stationID)
          .collection(day)
          .doc(pumpID)
          .update({
            cm: FieldValue.increment(cmDifference),
            cmOne: FieldValue.increment(cmDifference),
            totalFuelAmount: FieldValue.increment(amountDifference),
            litres: FieldValue.increment(cmDifference),
          });

        if (saleType == 2) {
          await admin
            .firestore()
            .collection("pumpDaySalesBook")
            .doc(stationID)
            .collection(day)
            .doc(pumpID)
            .update({
              omTwo: FieldValue.increment(cmDifference),
              cmTwo: FieldValue.increment(cmDifference),
            });
        }
      } else {
        // If no existing pump sale found, proceed to add a new pump sale
        const diff = parseFloat((cm - om).toFixed(2));
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
            pumpID,
            dayBookID,
            saleTwo: false,
            saleType,
            created_by,
            updated_by,
            created_at,
            updated_at,
            saleType,
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
          saleTwo: false,
          pumpID,
          dayBookID,
          saleType,
          created_by,
          updated_by,
          created_at,
          updated_at,
          saleType,
        });

        await admin
          .firestore()
          .collection("stationBucket")
          .doc(stationID)
          .update({
            // availableAgoLitres: typeName === "AGO" ? availableAgoL.toString() : data?.availableAgoLitres,
            // availablePmsLitres: typeName === "PMS" ? availablePmsL.toString() : data?.availablePmsLitres,
            // soldAgoLitres: typeName === "AGO" ? soldAgoL.toString() : data?.soldAgoLitres,
            // soldPmsLitres: typeName === "PMS" ? soldPmsL.toString() : data?.soldPmsLitres,
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
            // availableAgoLitres: typeName === "AGO" ? availableAgoL.toString() : data?.availableAgoLitres,
            // availablePmsLitres: typeName === "PMS" ? availablePmsL.toString() : data?.availablePmsLitres,
            // soldAgoLitres: typeName === "AGO" ? soldAgoL.toString() : data?.soldAgoLitres,
            // soldPmsLitres: typeName === "PMS" ? soldPmsL.toString() : data?.soldPmsLitres,
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
            cmOne: cm,
            litres: FieldValue.increment(diff),
            totalFuelAmount: FieldValue.increment(amount),
            saleType,
          });

        if (saleType == 2) {
          await admin
            .firestore()
            .collection("pumpDaySalesBook")
            .doc(stationID)
            .collection(day)
            .doc(pumpID)
            .update({
              omTwo: cm,
              cmTwo: cm,
            });
        }
      }
    }

    pumpsSnapshot.forEach(async (doc) => {
      const pumpData = doc.data();
      const { typeName, name } = pumpData;

      if (typeName === "AGO" || typeName === "PMS") {
        let om, cm, price;

        switch (name) {
          case 1:
            om = typeName === "AGO" ? omAGO1 : omPMS1;
            cm = typeName === "AGO" ? cmAGO1 : cmPMS1;
            price = typeName === "AGO" ? agoPrice : pmsPrice;
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
            om = typeName === "AGO" ? omAGO2 : omPMS2;
            cm = typeName === "AGO" ? cmAGO2 : cmPMS2;
            price = typeName === "AGO" ? agoPrice : pmsPrice;
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
            om = typeName === "AGO" ? omAGO3 : omPMS3;
            cm = typeName === "AGO" ? cmAGO3 : cmPMS3;
            price = typeName === "AGO" ? agoPrice : pmsPrice;
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
            om = typeName === "AGO" ? omAGO4 : omPMS4;
            cm = typeName === "AGO" ? cmAGO4 : cmPMS4;
            price = typeName === "AGO" ? agoPrice : pmsPrice;
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

      if (dayData) {
        //update data
        await admin
          .firestore()
          .collection("dailySalesBooks")
          .doc(dayData?.id)
          .update({
            omAGO1,
            omAGO2,
            omAGO3,
            omAGO4,
            omPMS1,
            omPMS2,
            omPMS3,
            omPMS4,
            cmAGO1,
            cmAGO2,
            cmAGO3,
            cmAGO4,
            cmPMS1,
            cmPMS2,
            cmPMS3,
            cmPMS4,
          });
      }
    }

    return { status: 200, message: "Day sale is saved successfully" };
  } catch (error) {
    console.error("Error saving day sale:", error);
    throw new HttpsError("Failed to save day sale"); // Throw a meaningful error
  }
});
