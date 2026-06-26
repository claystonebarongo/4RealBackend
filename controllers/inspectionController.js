const Inspection = require('../models/Inspection');
const User = require('../models/User');


exports.scheduleInspection = async (req, res) => {
    try {
        const { userId, type, appointmentDate, inspectionResponse } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }


        if (user.membershipStatus !== 'paid') {
            return res.status(403).json({ message: 'Account must be paid and active to schedule appointments.' });
        }

        // Create a new inspection record with a 'scheduled' status
        const scheduledInspection = new Inspection({
            userId,
            type,
            status: 'scheduled',
            appointmentDate,
            inspectionResponse: inspectionResponse || 'Your appointment has been scheduled. Please visit our center.'
        });

        await scheduledInspection.save();

        res.status(201).json({
            success: true,
            message: 'Appointment scheduled successfully.',
            inspection: scheduledInspection
        });
    } catch (error) {
        res.status(500).json({ message: 'Server scheduling error', error: error.message });
    }
};

// Existing: Mechanics log an inspection that has just been completed (Deducts balance)
exports.logInspection = async (req, res) => {
    try {
        const { userId, type, findings, mechanicNotes } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.membershipStatus !== 'paid') {
            return res.status(403).json({ message: 'Account must be paid and active to log services.' });
        }

        if (type === 'standard_inspection') {
            if (user.inspectionsRemaining <= 0) return res.status(400).json({ message: 'No standard inspections remaining.' });
            user.inspectionsRemaining -= 1;
        } else if (type === 'diagnostic_test') {
            if (user.diagnosticTestsRemaining <= 0) return res.status(400).json({ message: 'No diagnostic tests remaining.' });
            user.diagnosticTestsRemaining -= 1;
        } else if (type === 'periodic_check') {
            if (user.periodicChecksRemaining <= 0) return res.status(400).json({ message: 'No periodic checks remaining.' });
            user.periodicChecksRemaining -= 1;
        } else {
            return res.status(400).json({ message: 'Invalid inspection type.' });
        }

        const inspection = new Inspection({
            userId,
            type,
            status: 'completed',
            findings,
            mechanicNotes,
            inspectionResponse: 'Service successfully completed.' // Dynamic override for dashboard tracking
        });

        await inspection.save();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Service logged successfully and balance updated.',
            inspection,
            remainingBalances: {
                inspections: user.inspectionsRemaining,
                diagnosticTests: user.diagnosticTestsRemaining,
                periodicChecks: user.periodicChecksRemaining
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server service logging error', error: error.message });
    }
};

// Updated: Fetches history but handles upcoming schedules elegantly
exports.getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        // Sorts by newest appointments and newest created records first
        const history = await Inspection.find({ userId }).sort({ appointmentDate: -1, createdAt: -1 });
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ message: 'Server fetching history error', error: error.message });
    }
};