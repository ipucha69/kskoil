/* eslint-disable max-len */
const admin = require("firebase-admin");
const moment = require("moment");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.monthlyCustomerFinancialStatement = onCall(async (request) => {
  try {
    const { id, startMonth, endMonth } = request?.data || {};

    if (!id || !startMonth || !endMonth) {
      throw new HttpsError(
        "invalid-argument",
        "Customer ID, start month, and end month are required"
      );
    }

    const openingBalance = await getOpeningBalance(id);
    const fuelTaken = await getFuelTaken(id);
    const totalPayment = await getTotalPayment(id);
    const combinedData = await getCombinedData(id, startMonth, endMonth);
    const closingBalance = openingBalance + fuelTaken - totalPayment;

    const sortedData = sortDataByDate(combinedData);
    const updatedTransactions = updateBalances(sortedData, openingBalance);

    const title = `Financial statement from ${formatMonthYear(startMonth)} tO ${formatMonthYear(endMonth)}`;

    return {
      status: 200,
      message: "Customer financial statement fetched successfully",
      data: {
        openingBalance: formatCurrency(openingBalance),
        fuelTaken: formatCurrency(fuelTaken),
        totalPayment: formatCurrency(totalPayment),
        closingBalance: formatCurrency(closingBalance),
        combinedData: updatedTransactions,
        title,
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

const getCombinedData = async (customerId, startMonth, endMonth) => {
  const customerExpenses = await getCustomerExpenses(
    customerId,
    startMonth,
    endMonth
  );
  const customerPayments = await getCustomerPayments(
    customerId,
    startMonth,
    endMonth
  );
  return [...customerExpenses, ...customerPayments];
};

const getCustomerExpenses = async (customerId, startMonth, endMonth) => {
  const expenses = [];
  const startMoment = moment(startMonth, "YYYY-MM").startOf("month");
  const endMoment = moment(endMonth, "YYYY-MM").endOf("month");

  const snapshot = await admin
    .firestore()
    .collection("customers")
    .doc(customerId)
    .collection("expenses")
    .get();

  snapshot.forEach((doc) => {
    const expense = doc.data();
    const expenseDay = moment(expense.day, "DD-MM-YYYY");

    if (expenseDay.isBetween(startMoment, endMoment, undefined, "[]")) {
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
    }
  });
  return expenses;
};

const getCustomerPayments = async (customerId, startMonth, endMonth) => {
  const payments = [];
  const startTimestamp = moment(startMonth, "YYYY-MM")
    .startOf("month")
    .toDate();
  const endTimestamp = moment(endMonth, "YYYY-MM").endOf("month").toDate();

  const snapshot = await admin
    .firestore()
    .collection("customers")
    .doc(customerId)
    .collection("payments")
    .where("date", ">=", startTimestamp)
    .where("date", "<=", endTimestamp)
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
    if (type === "expense") {
      currentBalance += parseInt(amount.replace(/,/g, ""), 10);
    } else {
      currentBalance -= parseInt(paidAmount.replace(/,/g, ""), 10) || 0;
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

const formatMonthYear = (monthYear) => {
    return moment(monthYear, "YYYY-MM").format("MMM YYYY").toUpperCase();
  };
