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

exports.dailyCustomerInvoice = onCall(async (request) => {
    try {
        const data = request?.data;
        const { id, startDate, endDate } = data;
        console.log("id", id);

        //Customer profile
        let customer = {};
        const customerDoc = await admin.firestore().collection("customerBucket").doc(id).get();
        if (customerDoc.exists) {
            customer = customerDoc.data();
        }


        //TABLE CONTENTS
        //customer expenses
        let expenses = [];
        const customerExpensesSnap = await admin.firestore().collection("customers").doc(id).collection("expenses").get();
        if (!customerExpensesSnap.empty) {
            if (startDate && endDate) {
                customerExpensesSnap.forEach(doc => {
                    const expense = doc.data();
                    const expenseDay = moment(expense.day);
                    if (expenseDay.isSameOrAfter(startDate, "day") && expenseDay.isSameOrBefore(endDate, "day")) {
                        const day = expense.day;
                        const item = expense.fuel;
                        const station = expense.stationName;
                        const litres = expense.quantity;
                        const unitPrice = expense.stationPrice.toString();
                        const totalAmount = expense.totalAmount.toString();
        
                        expenses.push({day, item, station, litres, unitPrice, totalAmount});
                    }
                })
            } else {
                if (startDate) {
                    customerExpensesSnap.forEach(doc => {
                        const expense = doc.data();
                        const expenseDay = moment(expense.day);
                        if (expenseDay.isSame(startDate, "day")) {
                            const day = expense.day;
                            const item = expense.fuel;
                            const station = expense.stationName;
                            const litres = expense.quantity;
                            const unitPrice = expense.stationPrice.toString();
                            const totalAmount = expense.totalAmount.toString();
            
                            expenses.push({day, item, station, litres, unitPrice, totalAmount});
                        }
                    });
                }

                if (endDate) {
                    customerExpensesSnap.forEach(doc => {
                        const expense = doc.data();
                        const expenseDay = moment(expense.day);
                        if (expenseDay.isSame(endDate, "day")) {
                            const day = expense.day;
                            const item = expense.fuel;
                            const station = expense.stationName;
                            const litres = expense.quantity;
                            const unitPrice = expense.stationPrice.toString();
                            const totalAmount = expense.totalAmount.toString();
            
                            expenses.push({day, item, station, litres, unitPrice, totalAmount});
                        }
                    });
                }
            }
        }


        return {
            status: 200,
            message: "daily customer invoice is fetched successfully",
            data: {
                customer, 
                expenses
            },
        };
    } catch (error) {
        console.error("Error fetching daily customer invoice:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
