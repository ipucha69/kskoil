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

exports.dailyCustomerFinancialStatement = onCall(async (request) => {
    try {
        const data = request?.data;
        const { id, startDate, endDate } = data;
        console.log("id", id);

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
                    totalPayment += doc.data().amount;
                }
            })
        }


        //customer expenses
        let customerExpenses = [];
        const customerExpensesSnap = await admin.firestore().collection("customers").doc(id).collection("expenses").get();
        
        // Process each document
        if (!customerExpensesSnap.empty) {
            if (startDate && endDate) {
                customerExpensesSnap.forEach(doc => {
                    const expense = doc.data();
                    const expenseDay = moment(expense.day);
                    if (expenseDay.isSameOrAfter(startDate, "day") && expenseDay.isSameOrBefore(endDate, "day")) {

                        let paidAmount = expense.paidAmount.toString();

                        if(paidAmount < 1){
                            paidAmount = "";
                        }
        
                        const day = expense.day;
                        const detail = expense.truck;
                        const stationName = expense.stationName;
                        const litres = expense.quantity;
                        const price = expense.customerPrice.toString();
                        const amount = expense.customerDebt.toString();
                        const balance = "";
                        const type = "expense";
        
                        customerExpenses.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                    }
                });
            } else {
                if (startDate) {
                    customerExpensesSnap.forEach(doc => {
                        const expense = doc.data();
                        const expenseDay = moment(expense.day);
                        if (expenseDay.isSame(startDate, "day")) {
                            let paidAmount = expense.paidAmount.toString();

                            if(paidAmount < 1){
                                paidAmount = "";
                            }
            
                            const day = expense.day;
                            const detail = expense.truck;
                            const stationName = expense.stationName;
                            const litres = expense.quantity;
                            const price = expense.customerPrice.toString();
                            const amount = expense.customerDebt.toString();
                            const balance = "";
                            const type = "expense";
            
                            customerExpenses.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    });
                }

                if (endDate) {
                    customerExpensesSnap.forEach(doc => {
                        const expense = doc.data();
                        const expenseDay = moment(expense.day);
                        if (expenseDay.isSame(endDate, "day")) {
                            let paidAmount = expense.paidAmount.toString();

                            if(paidAmount < 1){
                                paidAmount = "";
                            }
            
                            const day = expense.day;
                            const detail = expense.truck;
                            const stationName = expense.stationName;
                            const litres = expense.quantity;
                            const price = expense.customerPrice.toString();
                            const amount = expense.customerDebt.toString();
                            const balance = "";
                            const type = "expense";
            
                            customerExpenses.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    });
                }

            }
        }


        //customer payment
        let customerPayments = [];
        const customerPaymentsSnap = await admin.firestore().collection("customers").doc(id).collection("payments").get();
        if (!customerPaymentsSnap.empty) {
            if (startDate && endDate) {
                customerPaymentsSnap.forEach(doc => {
                    const payment = doc.data();
    
                    let seconds;
                    payment.date.seconds? seconds = payment.date.seconds : seconds = payment.date._seconds;
                    const date = moment.unix(seconds);

                    if (date.isSameOrAfter(startDate, "day") && date.isSameOrBefore(endDate, "day")) {
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
                        const price = "";
                        const amount = "";
                        const paidAmount = payment.amount.toString();
                        const balance = "";
                        const type = "payment";
        
                        customerPayments.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                    }
                })
            } else {
                if (startDate) {
                    customerPaymentsSnap.forEach(doc => {
                        const payment = doc.data();
        
                        let seconds;
                        payment.date.seconds? seconds = payment.date.seconds : seconds = payment.date._seconds;
                        const date = moment.unix(seconds);
    
                        if (date.isSame(startDate, "day")) {
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
                            const price = "";
                            const amount = "";
                            const paidAmount = payment.amount.toString();
                            const balance = "";
                            const type = "payment";
            
                            customerPayments.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    })
                }

                if (endDate) {
                    customerPaymentsSnap.forEach(doc => {
                        const payment = doc.data();
        
                        let seconds;
                        payment.date.seconds? seconds = payment.date.seconds : seconds = payment.date._seconds;
                        const date = moment.unix(seconds);
    
                        if (date.isSame(endDate, "day")) {
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
                            const price = "";
                            const amount = "";
                            const paidAmount = payment.amount.toString();
                            const balance = "";
                            const type = "payment";
            
                            customerPayments.push([day, detail, stationName, litres, price, amount, paidAmount, balance, type]);
                        }
                    })
                }
            }
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
            return [...transaction.slice(0, 7), balance, ...transaction.slice(7)];
        });

        return {
            status: 200,
            message: "daily customer financial statement is fetched successfully",
            data: {
                openingBalance,
                fuelTaken,
                totalPayment,
                closingBalance,
                combinedData: updatedTransactions,
                title: `Financial statement as of ${startDate} to ${endDate}`
            },
        };
    } catch (error) {
        console.error("Error fetching daily customer financial statement:", error);
        throw new HttpsError("internal", error.message); // Throw a meaningful error
    }
});
