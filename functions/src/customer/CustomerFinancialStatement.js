/* eslint-disable max-len */
const admin = require("firebase-admin");
const moment = require("moment");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.customerFinancialStatements = onCall(async (request) => {
  try {
    const { id } = request?.data || {};

    if (!id) {
      throw new HttpsError("invalid-argument", "Customer ID is required");
    }

    const openingBalance = await getOpeningBalance(id);
    const fuelTaken = await getFuelTaken(id);
    const totalPayment = await getTotalPayment(id);
    const combinedData = await getCombinedData(id);
    const closingBalance = openingBalance + fuelTaken - totalPayment;

    const sortedData = sortDataByDate(combinedData);
    const updatedTransactions = updateBalances(sortedData, openingBalance);

    return {
      status: 200,
      message: "Customer financial statement fetched successfully",
      data: {
        openingBalance: formatCurrency(openingBalance),
        fuelTaken: formatCurrency(fuelTaken),
        totalPayment: formatCurrency(totalPayment),
        closingBalance: formatCurrency(closingBalance),
        combinedData: updatedTransactions,
        title: "Financial statement",
      },
    };
  } catch (error) {
    console.error("Error fetching customer financial statement:", error);
    throw new HttpsError("internal", error.message);
  }
});

const getOpeningBalance = async (customerId) => {
  const customerDoc = await admin
    .firestore()
    .collection("customers")
    .doc(customerId)
    .collection("account")
    .doc("info")
    .get();
  return customerDoc.exists ? customerDoc.data().openingBalance || 0 : 0;
};

const getFuelTaken = async (customerId) => {
  let fuelTaken = 0;
  const snapshot = await admin
    .firestore()
    .collection("debtorBucket")
    .where("customerID", "==", customerId)
    .get();
  snapshot.forEach((doc) => {
    if (doc.data().customerDebt) {
      fuelTaken += doc.data().customerDebt;
    }
  });
  return fuelTaken;
};

const getTotalPayment = async (customerId) => {
  let totalPayment = 0;
  const snapshot = await admin
    .firestore()
    .collection("customerPayments")
    .where("customerID", "==", customerId)
    .get();
  snapshot.forEach((doc) => {
    if (doc.data().amount) {
      totalPayment += parseInt(doc.data().amount);
    }
  });
  return totalPayment;
};

const getCombinedData = async (customerId) => {
  const customerExpenses = await getCustomerExpenses(customerId);
  const customerPayments = await getCustomerPayments(customerId);
  return [...customerExpenses, ...customerPayments];
};

const getCustomerExpenses = async (customerId) => {
  const expenses = [];
  const snapshot = await admin
    .firestore()
    .collection("customers")
    .doc(customerId)
    .collection("expenses")
    .get();
  snapshot.forEach((doc) => {
    const expense = doc.data();
    // const paidAmount = expense.paidAmount > 0 ? expense.paidAmount.toString() : "";

    expenses.push([
      expense.day,
      expense.truck,
      expense.stationName,
      expense.fuel,
      expense.quantity,
      formatCurrency(expense.customerPrice),
      formatCurrency(expense.customerDebt),
      "",
      "",
      "expense",
    ]);
  });
  return expenses;
};

const getCustomerPayments = async (customerId) => {
  const payments = [];
  const snapshot = await admin
    .firestore()
    .collection("customers")
    .doc(customerId)
    .collection("payments")
    .get();
  snapshot.forEach((doc) => {
    const payment = doc.data();
    const paymentMethod =
      payment?.paymentMethod?.toLowerCase() === "cash"
        ? "Cash Payment"
        : "Bank Payment";
    const seconds = payment.date.seconds || payment.date._seconds;
    const day = moment.unix(seconds).format("DD-MM-YYYY");

    payments.push([
      day,
      paymentMethod,
      payment.stationName,
      "",
      "",
      "",
      "",
      formatCurrency(payment.amount),
      "",
      "payment",
    ]);
  });
  return payments;
};

const sortDataByDate = (data) => {
  return data.sort((a, b) => {
    const [dayA, monthA, yearA] = a[0].split("-").map(Number);
    const [dayB, monthB, yearB] = b[0].split("-").map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA - dateB;
  });
};

const updateBalances = (data, openingBalance) => {
    let currentBalance = openingBalance;
    return data.map((transaction) => {
      const [
        day,
        detail,
        stationName,
        fuel,
        litres,
        price,
        amount,
        paidAmount,
        ,
        type,
      ] = transaction;
  
      // Parse amount and paidAmount without commas
      const parsedAmount = parseFloat(amount.replace(/,/g, ""));
      const parsedPaidAmount = parseFloat(paidAmount.replace(/,/g, ""));
  
      if (type === "expense") {
        currentBalance += parsedAmount;
      } else {
        currentBalance -= parsedPaidAmount || 0;
      }
  
      currentBalance = Math.abs(currentBalance);
  
      return [
        day,
        detail,
        stationName,
        fuel,
        litres,
        price,
        amount,
        paidAmount,
        formatCurrency(currentBalance),
      ];
    });
  };  

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2,
  }).format(value);
};
