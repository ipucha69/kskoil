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
const moment = require("moment");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.dailySupplierFinancialStatements = onCall(async (request) => {
    try {
        const { id, startDate, endDate } = request.data;
        console.log("id", id);

        // BALANCE BD
        let openingBalance = 0;
        let supplier = {};
        const supplierDoc = await admin.firestore().collection("suppliers").doc(id).collection("account").doc("info").get();
        if (supplierDoc.exists) {
            supplier = supplierDoc.data();
            openingBalance += supplier.openingBalance;
        }

        // FUEL TAKEN
        let fuelTaken = 0;
        const supplierPurchasesSnap = await admin.firestore().collection("suppliers").doc(id).collection("purchases").get();
        if (!supplierPurchasesSnap.empty) {
            supplierPurchasesSnap.forEach(doc => {
                const data = doc.data();
                if (data.totalPrice) {
                    fuelTaken += data.totalPrice;
                }
            });
        }

        // PAYMENT
        let totalPayment = 0;
        const supplierPaymentsSnap = await admin.firestore().collection("suppliers").doc(id).collection("payments").get();
        if (!supplierPaymentsSnap.empty) {
            supplierPaymentsSnap.forEach(doc => {
                const data = doc.data();
                if (data.amount) {
                    totalPayment += data.amount;
                }
            });
        }

        // BALANCE CD
        const closingBalance = openingBalance + fuelTaken - totalPayment;

        // TABLE CONTENTS
        // Supplier purchases
        let supplierPurchases = [];
        const supplierPurchaseSnap = await admin.firestore().collection("suppliers").doc(id).collection("purchases").get();
        if (!supplierPurchaseSnap.empty) {
            supplierPurchaseSnap.forEach(doc => {
                const purchase = doc.data();
                let seconds;
                purchase.date.seconds? seconds = purchase.date.seconds : seconds = purchase.date._seconds;
                const day = moment.unix(seconds).format("DD-MM-YYYY");

                if ((startDate && day.isSameOrAfter(startDate, "day")) && (endDate && day.isSameOrBefore(endDate, "day"))) {
                    if ("agoLitres" in purchase) {
                        if (purchase.agoLitres) {
                            const detail = purchase.truck;
                            let stationName = purchase.stationName || "";
                            // const day = date.format("DD-MM-YYYY");
                            const litres = purchase.agoLitres;
                            const price = purchase.agoPrice;
                            const amount = purchase.agoTotalPrice.toString();
                            const paidAmount = "";
                            const balance = "";
                            const type = "expense"; 
    
                            supplierPurchases.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    }

                    if ("pmsLitres" in purchase) {
                        if (purchase.pmsLitres) {
                            // const day = date.format("DD-MM-YYYY");
                            const detail = purchase.truck;
                            let stationName = purchase.stationName || "";
                            const litres = purchase.pmsLitres;
                            const price = purchase.pmsPrice;
                            const amount = purchase.pmsTotalPrice.toString();
                            const paidAmount = "";
                            const balance = "";
                            const type = "expense"; 
    
                            supplierPurchases.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    }
                } else if (startDate && day.isSame(startDate, "day")) {
                    if ("agoLitres" in purchase) {
                        if (purchase.agoLitres) {
                            const detail = purchase.truck;
                            let stationName = purchase.stationName || "";
                            // const day = date.format("DD-MM-YYYY");
                            const litres = purchase.agoLitres;
                            const price = purchase.agoPrice;
                            const amount = purchase.agoTotalPrice.toString();
                            const paidAmount = "";
                            const balance = "";
                            const type = "expense"; 
    
                            supplierPurchases.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    }

                    if ("pmsLitres" in purchase) {
                        if (purchase.pmsLitres) {
                            // const day = date.format("DD-MM-YYYY");
                            const detail = purchase.truck;
                            let stationName = purchase.stationName || "";
                            const litres = purchase.pmsLitres;
                            const price = purchase.pmsPrice;
                            const amount = purchase.pmsTotalPrice.toString();
                            const paidAmount = "";
                            const balance = "";
                            const type = "expense"; 
    
                            supplierPurchases.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    }
                } else if (endDate && day.isSame(endDate, "day")) {
                    if ("agoLitres" in purchase) {
                        if (purchase.agoLitres) {
                            const detail = purchase.truck;
                            let stationName = purchase.stationName || "";
                            // const day = date.format("DD-MM-YYYY");
                            const litres = purchase.agoLitres;
                            const price = purchase.agoPrice;
                            const amount = purchase.agoTotalPrice.toString();
                            const paidAmount = "";
                            const balance = "";
                            const type = "expense"; 
    
                            supplierPurchases.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    }

                    if ("pmsLitres" in purchase) {
                        if (purchase.pmsLitres) {
                            // const day = date.format("DD-MM-YYYY");
                            const detail = purchase.truck;
                            let stationName = purchase.stationName || "";
                            const litres = purchase.pmsLitres;
                            const price = purchase.pmsPrice;
                            const amount = purchase.pmsTotalPrice.toString();
                            const paidAmount = "";
                            const balance = "";
                            const type = "expense"; 
    
                            supplierPurchases.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    }
                }
            });
        }

        // Supplier payments
        let supplierPayments = [];
        const supplierPaymentsSnaps = await admin.firestore().collection("suppliers").doc(id).collection("payments").get();
        if (!supplierPaymentsSnaps.empty) {
            supplierPaymentsSnaps.forEach(doc => {
                const payment = doc.data();

                let seconds;
                payment.date.seconds? seconds = payment.date.seconds : seconds = payment.date._seconds;
                const day = moment.unix(seconds).format("DD-MM-YYYY");

                if ((startDate && day.isSameOrAfter(startDate, "day")) && (endDate && day.isSameOrBefore(endDate, "day"))) {
                    const detail = payment.paymentMethod.label;
                    let stationName = payment.stationName || "";
                    const litres = "";
                    const price = "";
                    const amount = "";
                    const paidAmount = payment.amount.toString();
                    const balance = ""; 
                    const type = "payment"; 

                    supplierPayments.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                } else if (startDate && day.isSame(startDate, "day")) {
                    const detail = payment.paymentMethod.label;
                    let stationName = payment.stationName || "";
                    const litres = "";
                    const price = "";
                    const amount = "";
                    const paidAmount = payment.amount.toString();
                    const balance = ""; 
                    const type = "payment"; 
    
                    supplierPayments.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                } else if (endDate && day.isSame(endDate, "day")) {
                    const detail = payment.paymentMethod.label;
                    let stationName = payment.stationName || "";
                    const litres = "";
                    const price = "";
                    const amount = "";
                    const paidAmount = payment.amount.toString();
                    const balance = ""; 
                    const type = "payment"; 
    
                    supplierPayments.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                }
            });
        }

        const combinedData = [...supplierPurchases,...supplierPayments];

        //Sort combined data asc using date
        const rowData = combinedData.sort((a, b) => {
            const [dayA, monthA, yearA] = a[0].split('-').map(Number);
            const [dayB, monthB, yearB] = b[0].split('-').map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB;
          });


          // update balance on each row 
        let currentBalance = openingBalance;
        const updatedTransactions = rowData.map(transaction => {
            if (transaction[8] === 'expense') {
                const expenseValue = parseInt(transaction[5], 10); // Get the expense value from index 5
                currentBalance += expenseValue; // Subtract the expense value from the current balance
            } else {
            const paymentValue = parseInt(transaction[6], 10) || 0; // Get the payment value from index 6, default to 0 if empty
            currentBalance -= paymentValue; // Add the payment value to the current balance
            }
            currentBalance = Math.abs(currentBalance); // Remove negative sign if present 
            const balance = currentBalance.toString();  //convert into string
            return [...transaction.slice(0, 7), balance, ...transaction.slice(7)];
        });


        return {
            status: 200,
            message: "supplier financial statement is fetched successfully",
            data: {
                openingBalance,
                fuelTaken,
                totalPayment,
                closingBalance,
                combinedData: updatedTransactions,
            },
        };
    } catch (error) {
        console.error("Error fetching supplier financial statement:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});