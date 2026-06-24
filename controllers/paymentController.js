const Payment = require('../models/Payment');
const User = require('../models/User');

exports.submitPayment = async (req, res) => {
    try {
        const { userId, mpesaCode, amount } = req.body;


        const codeExists = await Payment.findOne({ mpesaCode });
        if (codeExists) {
            return res.status(400).json({ message: 'This M-PESA transaction code has already been submitted.' });
        }

        const newPayment = new Payment({

            userId,
            mpesaCode,
            amount: amount || 15000
        });

        await newPayment.save();

        res.status(201).json({
            success: true,
            message: 'Payment reference submitted successfully. Awaiting verification.',
            payment: newPayment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server payment submission error', error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }

        if (payment.status === 'verified') {
            return res.status(400).json({ message: 'Payment has already been verified.' });
        }

        payment.status = 'verified';
        await payment.save();

        await User.findByIdAndUpdate(payment.userId, { membershipStatus: 'paid' });

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully. User membership status is now active.',
            payment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server payment verification error', error: error.message });
    }
};