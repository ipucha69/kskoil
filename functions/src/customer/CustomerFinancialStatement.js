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

exports.customerFinancialStatements = onCall(async (request) => {
    try {
        const data = request?.data;
        const { id } = data; 

        //BALANCE BD
        let openingBalance = 0;
        let customer = {};
        const customerDoc = await admin.firestore().collection("customers").doc(id).collection("account").doc("info").get();
        if (customerDoc.exists) {
            customer = customerDoc.data();
            openingBalance += customer.openingBalance;
        }

        //FUEL TAKEN
        let fuelTaken = 0;
        const debtorSnapshot = await admin.firestore().collection("debtorBucket").where("customerID", "==", id).get();
        if (!debtorSnapshot.empty) {
            debtorSnapshot.forEach(doc => {
                if ("customerDebt" in doc.data()) {
                    fuelTaken += doc.data().customerDebt;
                }
            })
        }


        let totalPayment = 0;
        const paymentSnapshot = await admin.firestore().collection("customerPayments").where("customerID", "==", id).get();
        if (!paymentSnapshot.empty) {
            paymentSnapshot.forEach(doc => {
                if ("amount" in doc.data()) {
                    totalPayment += parseInt(doc.data().amount);
                }
            })
        }

        //TABLE CONTENTS

        //customer expenses
        let customerExpenses = [];
        const customerExpensesSnap = await admin.firestore().collection("customers").doc(id).collection("expenses").get();
        if (!customerExpensesSnap.empty) {
            customerExpensesSnap.forEach(doc => {
                const expense = doc.data();

                let paidAmount = expense.paidAmount.toString();

                if(paidAmount < 1){
                    paidAmount = "";
                }

                const day = expense.day;
                const detail = expense.truck;
                const stationName = expense.stationName;
                const fuel = expense.fuel;
                const litres = expense.quantity;
                const price = expense.customerPrice.toString();
                const amount = expense.customerDebt.toString();
                const balance = "";
                // const paidAmount = "";
                const type = "expense";

                customerExpenses.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
            })
        }


        //customer payment
        let customerPayments = [];
        const customerPaymentsSnap = await admin.firestore().collection("customers").doc(id).collection("payments").get();
        if (!customerPaymentsSnap.empty) {
            customerPaymentsSnap.forEach(doc => {
                const payment = doc.data();

                let paymentMethod = payment?.paymentMethod;
                if(paymentMethod?.toLowerCase() === "cash"){
                    paymentMethod = "Cash Payment";
                } else if(paymentMethod?.toLowerCase() === "bank"){
                    paymentMethod = "Bank Payment";
                }

                let seconds;
                payment.date.seconds? seconds = payment.date.seconds : seconds = payment.date._seconds;
                const day = moment.unix(seconds).format("DD-MM-YYYY");

                const detail = paymentMethod;
                const stationName = payment.stationName;
                const litres = "";
                const fuel = "";
                const price = "";
                const amount = "";
                const paidAmount = payment.amount.toString();
                const balance = "";
                const type = "payment";

                customerPayments.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
            })
        }

        const combinedData = [...customerExpenses,...customerPayments];

        //BALANCE CD
        const closingBalance = openingBalance + fuelTaken - totalPayment;

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
            // Remove transaction[8] and insert the balance
            const updatedTransaction = [...transaction.slice(0, 7), balance];
            const sortedTransaction = [...updatedTransaction.slice(0, 8)];

            return sortedTransaction;
        });

        return {
            status: 200,
            message: "customer financial statement is fetched successfully",
            data: {
                openingBalance,
                fuelTaken,
                totalPayment,
                closingBalance,
                combinedData: updatedTransactions,
                title: "Financial statement"
            },
        };
    } catch (error) {
        console.error("Error fetching customer financial statement:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
