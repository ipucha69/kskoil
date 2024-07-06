// /* eslint-disable linebreak-style */
// /* eslint-disable object-curly-spacing */
// /* eslint-disable indent */
// /* eslint-disable linebreak-style */
// /* eslint-disable no-unused-vars */
// /* eslint-disable linebreak-style */
// /* eslint-disable eol-last */
// /* eslint-disable linebreak-style */
// /* eslint-disable quotes */
// /* eslint-disable max-len */
// /* eslint-disable camelcase */
// const admin = require("firebase-admin");
// const cors = require("cors");
// const { onCall, HttpsError } = require("firebase-functions/v2/https");
// const { FieldValue } = require("firebase-admin/firestore");

// exports.createTransferStock = cors(
//   onCall(async (request) => {
//     try {
//       const data = request?.data;
//       const {
//         agoLitres,
//         pmsLitres,
//         agoTotalPrice,
//         pmsTotalPrice,
//         totalPrice,
//         stationID,
//         stationName,
//         customerID,
//         customerName,
//         date,
//         destination,
//         description,
//         created_by,
//         updated_by,
//       } = data;

//       const created_at = Timestamp.fromDate(new Date());
//       const updated_at = Timestamp.fromDate(new Date());

//       const totalLitres =
//         parseInt(agoLitres || "0") + parseInt(pmsLitres || "0");

//       // Create stock transfer on bucket
//       const stock = await admin
//         .firestore()
//         .collection("stockTransferBucket")
//         .add({
//           agoLitres,
//           pmsLitres,
//           agoTotalPrice,
//           pmsTotalPrice,
//           totalPrice,
//           totalLitres,
//           stationID,
//           stationName,
//           customerID,
//           customerName,
//           destination,
//           date,
//           description,
//           created_by,
//           updated_by,
//           created_at,
//           updated_at,
//         });

//       // Update the document with the generated ID
//       await admin
//         .firestore()
//         .collection("stockTransferBucket")
//         .doc(stock?.id)
//         .update({ id: stock?.id });

//       //check transfer destination
//       if (destination === "station") {
//         // Write stock data to station
//         await admin
//           .firestore()
//           .collection("stations")
//           .doc(stationID)
//           .collection("stocks")
//           .doc(stock?.id)
//           .set({
//             agoLitres,
//             pmsLitres,
//             agoTotalPrice,
//             pmsTotalPrice,
//             totalPrice,
//             totalLitres,
//             stationID,
//             stationName,
//             destination,
//             date,
//             id: stock?.id,
//             description,
//             created_by,
//             updated_by,
//             created_at,
//             updated_at,
//           });

//         await admin
//           .firestore()
//           .collection("stationBucket")
//           .doc(stationID)
//           .update({
//             agoLitres: FieldValue.increment(parseInt(agoLitres)),
//             pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
//             totalFuelAmount: FieldValue.increment(totalPrice),
//           });

//         await admin
//           .firestore()
//           .collection("stations")
//           .doc(stationID)
//           .collection("account")
//           .doc("info")
//           .update({
//             agoLitres: FieldValue.increment(parseInt(agoLitres)),
//             pmsLitres: FieldValue.increment(parseInt(pmsLitres)),
//             totalFuelAmount: FieldValue.increment(totalPrice),
//           });
//       }

//       if (destination === "customer") {
//         // Write stock data to customer
//         // Get the customer document
//         const customerRef = admin
//           .firestore()
//           .collection("customerBucket")
//           .doc(customerID);
//         const customerSnapshot = await customerRef.get();
//         const customerData = customerSnapshot.data();

//         let paidAmount = 0;
//         let paid = false;
//         let balance = 0;
//         let debt = 0;
//         if (customerData?.balance > 0) {
//           if (customerData?.balance > totalAmount) {
//             paid = true;
//             paidAmount = totalAmount;
//             balance = customerData?.balance - totalAmount;
//           } else {
//             paidAmount = customerData?.balance;
//             debt = totalAmount - customerData?.balance;
//           }
//         } else {
//           debt = totalAmount;
//         }

//         //add data to private debtors Bucket
//         const debtor = await admin
//           .firestore()
//           .collection("privateDebtors")
//           .add({
//             agoLitres,
//             pmsLitres,
//             agoTotalPrice,
//             pmsTotalPrice,
//             totalPrice,
//             totalLitres,
//             stationID,
//             stationName,
//             customerID,
//             customerName,
//             destination,
//             date,
//             paid,
//             paidAmount,
//             description,
//             created_by,
//             updated_by,
//             created_at,
//             updated_at,
//           });

//         await admin
//           .firestore()
//           .collection("privateDebtors")
//           .doc(debtor?.id)
//           .update({
//             id: debtor?.id,
//           });

//         //add debt details to customer
//         await admin
//           .firestore()
//           .collection("customers")
//           .doc(customerID)
//           .collection("privateExpenses")
//           .doc(debtor?.id)
//           .set({
//             agoLitres,
//             pmsLitres,
//             agoTotalPrice,
//             pmsTotalPrice,
//             totalPrice,
//             totalLitres,
//             stationID,
//             stationName,
//             customerID,
//             customerName,
//             destination,
//             date,
//             paid,
//             paidAmount,
//             id: debtor?.id,
//             description,
//             created_by,
//             updated_by,
//             created_at,
//             updated_at,
//           });

//         //update customer path
//         await admin
//           .firestore()
//           .collection("customers")
//           .doc(customerID)
//           .collection("account")
//           .doc("info")
//           .update({
//             debt: FieldValue.increment(debt),
//             balance,
//           });

//         //update customer bucket
//         await admin
//           .firestore()
//           .collection("customerBucket")
//           .doc(customerID)
//           .update({
//             debt: FieldValue.increment(debt),
//             balance,
//           });
//       }

//       await admin
//         .firestore()
//         .collection("stock")
//         .doc("info")
//         .update({
//           transferredAgo: FieldValue.increment(parseInt(agoLitres)),
//           transferredPms: FieldValue.increment(parseInt(pmsLitres)),
//           availableAgo: FieldValue.increment(parseInt(-agoLitres)),
//           availablePms: FieldValue.increment(parseInt(-pmsLitres)),
//           totalAvailableLitres: FieldValue.increment(-totalLitres),
//         });

//       return { status: 200, message: "Stock is transferred successfully" };
//     } catch (error) {
//       console.error("Error transferring stock:", error);
//       throw new HttpsError("Error transferring stock", error.message); // Throw a meaningful error
//     }
//   })
// );
