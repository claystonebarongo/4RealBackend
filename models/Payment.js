const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mpesaCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        default: 15000
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);