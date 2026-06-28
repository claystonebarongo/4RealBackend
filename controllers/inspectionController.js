const Inspection = require('../models/Inspection');
const User = require('../models/User');

// Update an existing request to scheduled status
exports.scheduleInspection = async (req, res) => {
    try {
        const { id } = req.params;
        const { appointmentDate, inspectionResponse } = req.body;

        const inspection = await Inspection.findById(id);
        if (!inspection) {
            return res.status(404).json({ message: 'Inspection request not found.' });
        }

        inspection.status = 'scheduled';
        inspection.appointmentDate = appointmentDate;
        inspection.inspectionResponse = inspectionResponse || 'Your appointment has been scheduled. Please visit our center.';

        await inspection.save();

        res.status(200).json({
            success: true,
            message: 'Appointment successfully scheduled.',
            inspection
        });
    } catch (error) {
        res.status(500).json({ message: 'Server scheduling error', error: error.message });
    }
};

// Admin utility to cancel a pending request
exports.cancelInspection = async (req, res) => {
    try {
        const { id } = req.params;

        const inspection = await Inspection.findById(id);
        if (!inspection) {
            return res.status(404).json({ message: 'Inspection request not found.' });
        }

        inspection.status = 'cancelled';
        inspection.inspectionResponse = 'Your inspection request has been cancelled by the admin.';

        await inspection.save();

        res.status(200).json({
            success: true,
            message: 'Inspection request cancelled successfully.',
            inspection
        });
    } catch (error) {
        res.status(500).json({ message: 'Server cancellation error', error: error.message });
    }
};

// Admin utility to see what needs to be scheduled
exports.getPendingInspections = async (req, res) => {
    try {
        const pending = await Inspection.find({ status: 'pending' })
            .populate('userId', 'name email')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, pending });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending inspections', error: error.message });
    }
};

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
            inspectionResponse: 'Service successfully completed.'
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

exports.getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await Inspection.find({ userId }).sort({ appointmentDate: -1, createdAt: -1 });
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ message: 'Server fetching history error', error: error.message });
    }
};