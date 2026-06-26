const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['standard_inspection', 'diagnostic_test', 'periodic_check'],
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    // NEW: For the "Next Inspection" dashboard card
    appointmentDate: {
        type: Date
    },

    inspectionResponse: {
        type: String,
        default: 'Awaiting Inspection Schedule'
    },
    findings: {
        type: String,
        default: 'Awaiting inspection'
    },
    mechanicNotes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Inspection', InspectionSchema);