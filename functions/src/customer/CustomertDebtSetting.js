const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const moment = require('moment-timezone');

exports.customerDebtSettings = onSchedule({
    schedule: 'every day 07:00',
    timeZone: 'Africa/Dar_es_Salaam',
}, async () => {
    try {
        const customersSnapshot = await admin.firestore()
           .collection('customerBucket')
           .where('setting', '==', true)
           .get();

        if (!customersSnapshot.empty) {
            customersSnapshot.forEach(async (doc) => {
                const customer = doc.data();

                if ('targetName' in customer) {
                    if (customer.targetName === 'Payment Deadline') {
                        let seconds = customer.deadline.seconds? customer.deadline.seconds : customer.deadline._seconds;
                        const deadline = moment.unix(seconds).format('DD-MM-YYYY');

                        const today = moment();

                        if (today.isSameOrAfter(deadline, 'day')) {
                            await updateCustomerProfile(customer);
                        }
                    } else if (customer.targetName === 'Total Debt') {
                        if (parseInt(customer.targetAmount) <= customer.debt) {
                            await updateCustomerProfile(customer);
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error setting customer debt behavior:', error);
    }
});

async function updateCustomerProfile(customer) {
    try {
        const customerDoc = admin.firestore().collection('customers').doc(customer.customerID).collection('account').doc('info');
        await customerDoc.update({ status: false });
        await updateCustomerBucket(customer);
    } catch (e) {
        console.error('Error on updating customer profile:', e);
    }
}

async function updateCustomerBucket(customer) {
    try {
        const customerDoc = admin.firestore().collection('customerBucket').doc(customer.customerID);
        await customerDoc.update({ status: false });
    } catch (e) {
        console.error('Error on updating customer bucket:', e);
    }
}
