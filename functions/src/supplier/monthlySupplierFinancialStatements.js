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

exports.monthlySupplierFinancialStatements = onCall(async (request) => {
    try {
        const { id, startMonth, endMonth } = request.data;
        console.log("id", id);

        const getSupplierDoc = async () => {
            const supplierDoc = await admin.firestore().collection("suppliers").doc(id).collection("account").doc("info").get();
            return supplierDoc.exists ? supplierDoc.data() : {};
        };

        const getTotalFuelTaken = async () => {
            const supplierPurchasesSnap = await admin.firestore().collection("suppliers").doc(id).collection("purchases").get();
            return supplierPurchasesSnap.empty ? 0 : supplierPurchasesSnap.docs.reduce((total, doc) => total + (doc.data().totalPrice || 0), 0);
        };

        const getTotalPayment = async () => {
            const supplierPaymentsSnap = await admin.firestore().collection("suppliers").doc(id).collection("payments").get();
            return supplierPaymentsSnap.empty ? 0 : supplierPaymentsSnap.docs.reduce((total, doc) => total + (doc.data().amount || 0), 0);
        };

        const supplier = await getSupplierDoc();
        const openingBalance = supplier.openingBalance || 0;
        const fuelTaken = await getTotalFuelTaken();
        const totalPayment = await getTotalPayment();
        const closingBalance = openingBalance + fuelTaken - totalPayment;

        const getSupplierTransactions = async (collection) => {
            const snapshot = await admin.firestore().collection("suppliers").doc(id).collection(collection).get();
            return snapshot.empty ? [] : snapshot.docs.map(doc => doc.data());
        };

        const filterAndFormatTransactions = (transactions, type, startMonth, endMonth) => {
            return transactions.flatMap((transaction) => {
                const seconds = transaction.date.seconds || transaction.date._seconds;
                const day = moment.unix(seconds).format("DD-MM-YYYY");
                if (moment(day, "DD-MM-YYYY").isBetween(moment(startMonth, "YYYY-MM"), moment(endMonth, "YYYY-MM"), null, '[]')) {
                    const formattedTransactions = formatTransaction(transaction, day, type);
                    return formattedTransactions;
                }
                return [];
            });
        };

        const formatTransaction = (transaction, day, type) => {
            let formattedTransactions = [];
            if (type === "expense") {
                if (transaction.agoLitres) {
                    formattedTransactions.push([
                        day,
                        transaction.truck,
                        transaction.stationName || "",
                        "AGO",
                        transaction.agoLitres,
                        formatCurrency(transaction.agoPrice),
                        formatCurrency(transaction.agoTotalPrice),
                        "",
                        ""
                    ]);
                }
                if (transaction.pmsLitres) {
                    formattedTransactions.push([
                        day,
                        transaction.truck,
                        transaction.stationName || "",
                        "PMS",
                        transaction.pmsLitres,
                        formatCurrency(transaction.pmsPrice),
                        formatCurrency(transaction.pmsTotalPrice),
                        "",
                        ""
                    ]);
                }
            } else if (type === "payment") {
                formattedTransactions.push([
                    day,
                    `${transaction.paymentMethod.label} Payment`,
                    transaction.stationName || "",
                    "",
                    "",
                    "",
                    "",
                    formatCurrency(transaction.amount),
                    ""
                ]);
            }
            return formattedTransactions;
        };

        const supplierPurchases = await getSupplierTransactions("purchases");
        const supplierPayments = await getSupplierTransactions("payments");

        const filteredPurchases = filterAndFormatTransactions(supplierPurchases, "expense", startMonth, endMonth);
        const filteredPayments = filterAndFormatTransactions(supplierPayments, "payment", startMonth, endMonth);

        const combinedData = [...filteredPurchases, ...filteredPayments].sort((a, b) => new Date(a[0].split("-").reverse().join("-")) - new Date(b[0].split("-").reverse().join("-")));

        let currentBalance = openingBalance;
        const updatedTransactions = combinedData.map(transaction => {
            if (transaction[3] === 'AGO' || transaction[3] === 'PMS') {
                currentBalance += parseFloat(transaction[6].replace(/,/g, ""));
            } else {
                currentBalance -= parseFloat(transaction[7].replace(/,/g, "")) || 0;
            }
            transaction[8] = formatCurrency(Math.abs(currentBalance));
            return transaction.slice(0, 9); // Remove the type from the transaction array
        });

        return {
            status: 200,
            message: "Supplier financial statement is fetched successfully",
            data: {
                openingBalance: formatCurrency(openingBalance),
                fuelTaken: formatCurrency(fuelTaken),
                totalPayment: formatCurrency(totalPayment),
                closingBalance: formatCurrency(closingBalance),
                combinedData: updatedTransactions,
                title: `Financial statement as of ${formatMonthYear(startMonth)} to ${formatMonthYear(endMonth)}`
            },
        };
    } catch (error) {
        console.error("Error fetching supplier financial statement:", error);
        throw new HttpsError("internal", error.message);
    }
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
        maximumFractionDigits: 2,
    }).format(value);
};

const formatMonthYear = (monthYear) => {
    return moment(monthYear, "YYYY-MM").format("MMM YYYY").toUpperCase();
  };
