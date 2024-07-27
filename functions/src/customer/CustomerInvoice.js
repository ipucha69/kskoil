const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.customerInvoice = onCall(async (request) => {
    try {
        const data = request?.data;
        const { id } = data;
        console.log("id", id);

        // Customer profile
        let customer = {};
        const customerDoc = await admin.firestore().collection("customerBucket").doc(id).get();
        if (customerDoc.exists) {
            customer = customerDoc.data();
        }

        // Table contents - customer expenses
        let expenses = [];
        let totalDebt = 0;
        const customerExpensesSnap = await admin.firestore().collection("customers").doc(id).collection("expenses").where("paid", "==", false).get();
        if (!customerExpensesSnap.empty) {
            customerExpensesSnap.forEach(doc => {
                const expense = doc.data();
                const day = expense.day;
                const item = expense.fuel;
                const station = expense.stationName;
                const litres = expense.quantity;
                const unitPrice = formatCurrency(expense?.customerPrice);
                const totalAmount = formatCurrency(expense?.customerDebt);
                const diff = expense.customerDebt - expense.paidAmount;
                const debt = formatCurrency(diff);
                totalDebt += diff;
                expenses.push([day, station, item, litres, unitPrice, debt]);
            });
        }

        const sortedData = sortDataByDate(expenses);

        return {
            status: 200,
            message: "Customer invoice fetched successfully",
            data: {
                customer, 
                expenses: sortedData,
                totalDebt,
                title: "",
            },
        };
    } catch (error) {
        console.error("Error fetching customer invoice:", error);
        throw new HttpsError("internal", error.message);
    }
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
        maximumFractionDigits: 2,
    }).format(value);
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
