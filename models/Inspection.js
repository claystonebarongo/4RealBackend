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
        // Updated: Added 'pending' for requests that aren't scheduled yet
        type: String,
        enum: ['pending', 'scheduled', 'completed', 'cancelled'],
        default: 'pending'
    },
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
    },
    // Added: For administrative tracking
    scheduledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Inspection', InspectionSchema);