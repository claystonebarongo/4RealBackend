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

exports.getPendingPayments = async (req, res) => {
    try {
        const pending = await Payment.find({ status: 'pending' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, pending });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending payments', error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { adminId, notes } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }

        if (payment.status === 'verified') {
            return res.status(400).json({ message: 'Payment has already been verified.' });
        }

        payment.status = 'verified';
        payment.verifiedAt = new Date();
        payment.verifiedBy = adminId;
        payment.adminNotes = notes || 'Payment verified by administrator.';

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

// New Admin Utility: Revoke a payment
exports.revokePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { adminId, notes } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found.' });
        }

        // Update payment status to rejected
        payment.status = 'rejected';
        payment.adminNotes = notes || 'Payment revoked by administrator.';
        payment.verifiedBy = adminId;
        await payment.save();

        // Revert user status to unpaid
        await User.findByIdAndUpdate(payment.userId, { membershipStatus: 'unpaid' });

        res.status(200).json({
            success: true,
            message: 'Payment revoked successfully. User membership status is now inactive.',
            payment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server payment revocation error', error: error.message });
    }
};