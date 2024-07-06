/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable padded-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

exports.updateStockTransfer = onCall(async (request) => {
    const data = request?.data;
    const {
        agoLitres,
        pmsLitres,
        agoPrice,
        pmsPrice,
        agoTotalPrice,
        pmsTotalPrice,
        totalPrice,
        stationID,
        stationName,
        stationLocation,
        driver,
        truck,
        date,
        id,
        description,
        destination,
        customerID,
        customerName,
        stock,
        amount,
        amountAGO,
        amountPMS,
        updated_by,
    } = data;

    const updated_at = Timestamp.fromDate(new Date());

    const totalLitres = parseInt(agoLitres || "0") + parseInt(pmsLitres || "0");
    const totalAmountLitres = amountAGO + amountPMS;

    try {
        // Update stock transfer bucket data in Firestore
        await admin.firestore().collection("stockTransferBucket").doc(id).set(
        {
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalPrice,
            totalLitres,
            stationID,
            stationName,
            stationLocation,
            customerID,
            customerName,
            destination,
            driverID: driver?.id,
            driverName: driver?.name,
            driverLicence: driver?.licence,
            driverPhone: driver?.phone,
            truck,
            date,
            description,
            updated_by,
            updated_at,
        },
        { merge: true }
        );

        //check transfer destination
        if (destination === "station") {
        //check if destination is changed
        if (stock?.destination !== destination) {
            //destination is changed
            //remove data from customer and set data to station

            // remove customer transfer data in Firestore
            await admin
            .firestore()
            .collection("privateDebtors")
            .doc(stock?.id)
            .delete();

            await admin
            .firestore()
            .collection("customers")
            .doc(stock?.customerID)
            .collection("privateExpenses")
            .doc(stock?.id)
            .delete();

            //recalculate customer debt and balance
            // Fetch customer expenses
            const expensesQuerySnapshot = await admin
            .firestore()
            .collection("customers")
            .doc(stock?.customerID)
            .collection("privateExpenses")
            .get();

            let totalExpensesAmount = 0;
            expensesQuerySnapshot.forEach((doc) => {
            const expenseData = doc.data();
            totalExpensesAmount += expenseData.totalPrice;
            });

            // Fetch customer expenses
            const paymentsQuerySnapshot = await admin
            .firestore()
            .collection("customers")
            .doc(stock?.customerID)
            .collection("payments")
            .get();

            let totalPaymentsAmount = 0;
            paymentsQuerySnapshot.forEach((doc) => {
            const paymentData = doc.data();
            totalPaymentsAmount += paymentData.amount;
            });

            // Get the old customer document
            const oldCustomerRef = admin
            .firestore()
            .collection("customerBucket")
            .doc(stock?.customerID);
            const oldCustomerSnapshot = await oldCustomerRef.get();
            const oldCustomerData = oldCustomerSnapshot.data();

            let actualBalance = 0;
            let actualDebt = 0;

            //Find difference
            const diffAmount = totalPaymentsAmount - totalExpensesAmount;
            const actualDiff = diffAmount + oldCustomerData?.openingBalance;
            if (actualDiff < 0) {
            actualDebt = Math.abs(actualDiff);
            } else {
            actualBalance = actualDiff;
            }

            //update customer path
            await admin
            .firestore()
            .collection("customers")
            .doc(stock?.customerID)
            .collection("account")
            .doc("info")
            .update({
                debt: actualDebt,
                balance: actualBalance,
            });

            //update customer bucket
            await admin
            .firestore()
            .collection("customerBucket")
            .doc(stock?.customerID)
            .update({
                debt: actualDebt,
                balance: actualBalance,
            });

            //WRITE DATA INTO STATION
            await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("stocks")
            .doc(id)
            .set({
                agoLitres,
                pmsLitres,
                agoPrice,
                pmsPrice,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID,
                stationName,
                stationLocation,
                destination,
                driverID: driver?.id,
                driverName: driver?.name,
                driverLicence: driver?.licence,
                driverPhone: driver?.phone,
                truck,
                date,
                id,
                description,
                created_by: updated_by,
                updated_by,
                created_at: updated_at,
                updated_at,
                from: stock?.customerName,
                fromID: stock?.customerID,
            });

            await admin
            .firestore()
            .collection("stationBucket")
            .doc(stationID)
            .update({
                agoLitres: FieldValue.increment(agoLitres),
                pmsLitres: FieldValue.increment(pmsLitres),
                totalFuelAmount: FieldValue.increment(totalPrice),
            });

            await admin
            .firestore()
            .collection("stations")
            .doc(stationID)
            .collection("account")
            .doc("info")
            .update({
                agoLitres: FieldValue.increment(agoLitres),
                pmsLitres: FieldValue.increment(pmsLitres),
                totalFuelAmount: FieldValue.increment(totalPrice),
            });
        } else {
            //destination not changed
            //check if station is changed
            if (stock?.stationID !== stationID) {
            //remove data from old station and write data into new station
            // Delete old station transfer data in Firestore
            await admin
                .firestore()
                .collection("stations")
                .doc(stock?.stationID)
                .collection("stocks")
                .doc(id)
                .delete();

            await admin
                .firestore()
                .collection("stationBucket")
                .doc(stock?.stationID)
                .update({
                agoLitres: FieldValue.increment(-stock?.agoLitres),
                pmsLitres: FieldValue.increment(-stock?.pmsLitres),
                totalFuelAmount: FieldValue.increment(-stock?.totalPrice),
                });

            await admin
                .firestore()
                .collection("stations")
                .doc(stock?.stationID)
                .collection("account")
                .doc("info")
                .update({
                agoLitres: FieldValue.increment(-stock?.agoLitres),
                pmsLitres: FieldValue.increment(-stock?.pmsLitres),
                totalFuelAmount: FieldValue.increment(-stock?.totalPrice),
                });

            //WRITE DATA INTO NEW STATION
            // Update station transfer data in Firestore
            await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("stocks")
                .doc(id)
                .set(
                {
                    agoLitres,
                    pmsLitres,
                    agoPrice,
                    pmsPrice,
                    agoTotalPrice,
                    pmsTotalPrice,
                    totalPrice,
                    totalLitres,
                    stationID,
                    stationName,
                    stationLocation,
                    destination,
                    driverID: driver?.id,
                    driverName: driver?.name,
                    driverLicence: driver?.licence,
                    driverPhone: driver?.phone,
                    truck,
                    date,
                    id,
                    description,
                    created_by: updated_by,
                    updated_by,
                    created_at: updated_at,
                    updated_at,
                    from: stock?.stationName,
                    fromID: stock?.stationID,
                },
                { merge: true }
                );

            await admin
                .firestore()
                .collection("stationBucket")
                .doc(stationID)
                .update({
                agoLitres: FieldValue.increment(agoLitres),
                pmsLitres: FieldValue.increment(pmsLitres),
                totalFuelAmount: FieldValue.increment(totalPrice),
                });

            await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("account")
                .doc("info")
                .update({
                agoLitres: FieldValue.increment(agoLitres),
                pmsLitres: FieldValue.increment(pmsLitres),
                totalFuelAmount: FieldValue.increment(totalPrice),
                });
            } else {
            // Update station transfer data in Firestore
            await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("stocks")
                .doc(id)
                .set(
                {
                    agoLitres,
                    pmsLitres,
                    agoTotalPrice,
                    pmsTotalPrice,
                    totalPrice,
                    totalLitres,
                    stationID,
                    stationName,
                    stationLocation,
                    driverID: driver?.id,
                    driverName: driver?.name,
                    driverLicence: driver?.licence,
                    driverPhone: driver?.phone,
                    truck,
                    date,
                    id,
                    description,
                    updated_by,
                    updated_at,
                },
                { merge: true }
                );

            await admin
                .firestore()
                .collection("stationBucket")
                .doc(stationID)
                .update({
                agoLitres: FieldValue.increment(amountAGO),
                pmsLitres: FieldValue.increment(amountPMS),
                totalFuelAmount: FieldValue.increment(amount),
                });

            await admin
                .firestore()
                .collection("stations")
                .doc(stationID)
                .collection("account")
                .doc("info")
                .update({
                agoLitres: FieldValue.increment(amountAGO),
                pmsLitres: FieldValue.increment(amountPMS),
                totalFuelAmount: FieldValue.increment(amount),
                });
            }
        }
        } else {
        //check if destination is changed
        if (stock?.destination !== destination) {
            //destination is changed from station to customer
            // remove station transfer data in Firestore
            await admin
            .firestore()
            .collection("stations")
            .doc(stock?.stationID)
            .collection("stocks")
            .doc(id)
            .delete();

            await admin
            .firestore()
            .collection("stationBucket")
            .doc(stock?.stationID)
            .update({
                agoLitres: FieldValue.increment(-stock?.agoLitres),
                pmsLitres: FieldValue.increment(-stock?.pmsLitres),
                totalFuelAmount: FieldValue.increment(-stock?.totalPrice),
            });

            await admin
            .firestore()
            .collection("stations")
            .doc(stock?.stationID)
            .collection("account")
            .doc("info")
            .update({
                agoLitres: FieldValue.increment(-stock?.agoLitres),
                pmsLitres: FieldValue.increment(-stock?.pmsLitres),
                totalFuelAmount: FieldValue.increment(-stock?.totalPrice),
            });

            //WRITE DATA INTO CUSTOMER
            // Get the customer document
            const customerRef = admin
            .firestore()
            .collection("customerBucket")
            .doc(customerID);
            const customerSnapshot = await customerRef.get();
            const customerData = customerSnapshot.data();

            let paidAmount = 0;
            let paid = false;
            let balance = 0;
            let debt = 0;
            if (customerData?.balance > 0) {
            if (customerData?.balance > totalPrice) {
                paid = true;
                paidAmount = totalPrice;
                balance = customerData?.balance - totalPrice;
            } else {
                paidAmount = customerData?.balance;
                debt = totalPrice - customerData?.balance;
            }
            } else {
            debt = totalPrice;
            }

            //add data to private debtors Bucket
            await admin.firestore().collection("privateDebtors").doc(id).set({
            agoLitres,
            pmsLitres,
            agoPrice,
            pmsPrice,
            agoTotalPrice,
            pmsTotalPrice,
            totalPrice,
            totalLitres,
            stationID,
            stationName,
            stationLocation,
            customerID,
            customerName,
            destination,
            driverID: driver?.id,
            driverName: driver?.name,
            driverLicence: driver?.licence,
            driverPhone: driver?.phone,
            truck,
            date,
            paid,
            id,
            paidAmount,
            description,
            created_by: updated_by,
            updated_by,
            created_at: updated_at,
            updated_at,
            from: stock?.stationName,
            fromID: stock?.stationID,
            });

            //add debt details to customer
            await admin
            .firestore()
            .collection("customers")
            .doc(customerID)
            .collection("privateExpenses")
            .doc(id)
            .set({
                agoLitres,
                pmsLitres,
                agoPrice,
                pmsPrice,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID,
                stationName,
                stationLocation,
                customerID,
                customerName,
                destination,
                driverID: driver?.id,
                driverName: driver?.name,
                driverLicence: driver?.licence,
                driverPhone: driver?.phone,
                truck,
                date,
                paid,
                paidAmount,
                id,
                description,
                created_by: updated_by,
                updated_by,
                created_at: updated_at,
                updated_at,
                from: stock?.stationName,
                fromID: stock?.stationID,
            });

            //update customer path
            await admin
            .firestore()
            .collection("customers")
            .doc(customerID)
            .collection("account")
            .doc("info")
            .update({
                debt: FieldValue.increment(debt),
                balance,
            });

            //update customer bucket
            await admin
            .firestore()
            .collection("customerBucket")
            .doc(customerID)
            .update({
                debt: FieldValue.increment(debt),
                balance,
            });
        } else {
            //destination not changed
            //check if customer is changed
            if (stock?.customerID !== customerID) {
            //Remove data from old customer and write data into new customer

            //REMOVE DATA FRO OLD CUSTOMER

            await admin.firestore().collection("privateDebtors").doc(id).delete();

            //remove debt details to customer
            await admin
                .firestore()
                .collection("customers")
                .doc(stock?.customerID)
                .collection("privateExpenses")
                .doc(id)
                .delete();

            //re-calculate old customer debt and balance
            // Fetch old customer expenses
            const expensesQuerySnapshot = await admin
                .firestore()
                .collection("customers")
                .doc(stock?.customerID)
                .collection("privateExpenses")
                .get();

            let totalExpensesAmount = 0;
            expensesQuerySnapshot.forEach((doc) => {
                const expenseData = doc.data();
                totalExpensesAmount += expenseData.totalPrice;
            });

            // Fetch old customer expenses
            const paymentsQuerySnapshot = await admin
                .firestore()
                .collection("customers")
                .doc(stock?.customerID)
                .collection("payments")
                .get();

            let totalPaymentsAmount = 0;
            paymentsQuerySnapshot.forEach((doc) => {
                const paymentData = doc.data();
                totalPaymentsAmount += paymentData.amount;
            });

            // Get the old customer document
            const oldCustomerRef = admin
                .firestore()
                .collection("customerBucket")
                .doc(stock?.customerID);
            const oldCustomerSnapshot = await oldCustomerRef.get();
            const oldCustomerData = oldCustomerSnapshot.data();

            let actualBalance = 0;
            let actualDebt = 0;

            //Find difference
            const diffAmount = totalPaymentsAmount - totalExpensesAmount;
            const actualDiff = diffAmount + oldCustomerData?.openingBalance;
            if (actualDiff < 0) {
                actualDebt = Math.abs(actualDiff);
            } else {
                actualBalance = actualDiff;
            }

            //update old customer path
            await admin
                .firestore()
                .collection("customers")
                .doc(stock?.customerID)
                .collection("account")
                .doc("info")
                .update({
                debt: actualDebt,
                balance: actualBalance,
                });

            //update old customer bucket
            await admin
                .firestore()
                .collection("customerBucket")
                .doc(stock?.customerID)
                .update({
                debt: actualDebt,
                balance: actualBalance,
                });

            //WRITE DATA INTO NEW CUSTOMER
            // Get the customer document
            const customerRef = admin
                .firestore()
                .collection("customerBucket")
                .doc(customerID);
            const customerSnapshot = await customerRef.get();
            const customerData = customerSnapshot.data();

            let paidAmount = 0;
            let paid = false;
            let balance = 0;
            let debt = 0;
            if (customerData?.balance > 0) {
                if (customerData?.balance > totalPrice) {
                paid = true;
                paidAmount = totalPrice;
                balance = customerData?.balance - totalPrice;
                } else {
                paidAmount = customerData?.balance;
                debt = totalPrice - customerData?.balance;
                }
            } else {
                debt = totalPrice;
            }

            //add data to private debtors Bucket
            await admin.firestore().collection("privateDebtors").doc(id).set({
                agoLitres,
                pmsLitres,
                agoPrice,
                pmsPrice,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID,
                stationName,
                stationLocation,
                customerID,
                customerName,
                destination,
                driverID: driver?.id,
                driverName: driver?.name,
                driverLicence: driver?.licence,
                driverPhone: driver?.phone,
                truck,
                date,
                paid,
                id,
                paidAmount,
                description,
                created_by: updated_by,
                updated_by,
                created_at: updated_at,
                updated_at,
                from: stock?.customerName,
                fromID: stock?.customerID,
            });

            //add debt details to customer
            await admin
                .firestore()
                .collection("customers")
                .doc(customerID)
                .collection("privateExpenses")
                .doc(id)
                .set({
                agoLitres,
                pmsLitres,
                agoPrice,
                pmsPrice,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID,
                stationName,
                stationLocation,
                customerID,
                customerName,
                destination,
                driverID: driver?.id,
                driverName: driver?.name,
                driverLicence: driver?.licence,
                driverPhone: driver?.phone,
                truck,
                date,
                paid,
                paidAmount,
                id,
                description,
                created_by: updated_by,
                updated_by,
                created_at: updated_at,
                updated_at,
                from: stock?.customerName,
                fromID: stock?.customerID,
                });

            //update customer path
            await admin
                .firestore()
                .collection("customers")
                .doc(customerID)
                .collection("account")
                .doc("info")
                .update({
                debt: FieldValue.increment(debt),
                balance,
                });

            //update customer bucket
            await admin
                .firestore()
                .collection("customerBucket")
                .doc(customerID)
                .update({
                debt: FieldValue.increment(debt),
                balance,
                });
            } else {
            //customer did not change
            //update customer details

            //update data to private debtors Bucket
            await admin.firestore().collection("privateDebtors").doc(id).update({
                agoLitres,
                pmsLitres,
                agoPrice,
                pmsPrice,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID,
                stationName,
                stationLocation,
                customerID,
                customerName,
                destination,
                driverID: driver?.id,
                driverName: driver?.name,
                driverLicence: driver?.licence,
                driverPhone: driver?.phone,
                truck,
                date,
                id,
                description,
                updated_by,
                updated_at,
            });

            //update debt details to customer
            await admin
                .firestore()
                .collection("customers")
                .doc(customerID)
                .collection("privateExpenses")
                .doc(id)
                .update({
                agoLitres,
                pmsLitres,
                agoPrice,
                pmsPrice,
                agoTotalPrice,
                pmsTotalPrice,
                totalPrice,
                totalLitres,
                stationID,
                stationName,
                stationLocation,
                customerID,
                customerName,
                destination,
                driverID: driver?.id,
                driverName: driver?.name,
                driverLicence: driver?.licence,
                driverPhone: driver?.phone,
                truck,
                date,
                id,
                description,
                updated_by,
                updated_at,
                });

            //re-calculate customer debt and balance
            // Fetch customer expenses
            const expensesQuerySnapshot = await admin
                .firestore()
                .collection("customers")
                .doc(customerID)
                .collection("privateExpenses")
                .get();

            let totalExpensesAmount = 0;
            expensesQuerySnapshot.forEach((doc) => {
                const expenseData = doc.data();
                totalExpensesAmount += expenseData.totalPrice;
            });

            // Fetch customer expenses
            const paymentsQuerySnapshot = await admin
                .firestore()
                .collection("customers")
                .doc(customerID)
                .collection("payments")
                .get();

            let totalPaymentsAmount = 0;
            paymentsQuerySnapshot.forEach((doc) => {
                const paymentData = doc.data();
                totalPaymentsAmount += paymentData.amount;
            });

            // Get the customer document
            const customerRef = admin
                .firestore()
                .collection("customerBucket")
                .doc(customerID);
            const customerSnapshot = await customerRef.get();
            const customerData = customerSnapshot.data();

            let actualBalance = 0;
            let actualDebt = 0;

            //Find difference
            const diffAmount = totalPaymentsAmount - totalExpensesAmount;
            const actualDiff = diffAmount + customerData?.openingBalance;
            if (actualDiff < 0) {
                actualDebt = Math.abs(actualDiff);
            } else {
                actualBalance = actualDiff;
            }

            //update customer path
            await admin
                .firestore()
                .collection("customers")
                .doc(customerID)
                .collection("account")
                .doc("info")
                .update({
                debt: actualDebt,
                balance: actualBalance,
                });

            //update customer bucket
            await admin
                .firestore()
                .collection("customerBucket")
                .doc(customerID)
                .update({
                debt: actualDebt,
                balance: actualBalance,
                });
            }
        }
        }

        await admin
        .firestore()
        .collection("stock")
        .doc("info")
        .update({
            transferredAgo: FieldValue.increment(parseInt(amountAGO)),
            transferredPms: FieldValue.increment(parseInt(amountPMS)),
            availableAgo: FieldValue.increment(parseInt(-amountAGO)),
            availablePms: FieldValue.increment(parseInt(-amountPMS)),
            totalAvailableLitres: FieldValue.increment(-totalAmountLitres),
        });

        return { status: 200, message: "Stock transfer is updated successfully" };
    } catch (error) {
        console.log(error);
        throw new HttpsError("Error updating stock transfer", error.message); // Throw meaningful error
    }
});
