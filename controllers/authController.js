const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {


    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching members', error: error.message });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { name, phone, email, password, regNumber, makeModel, yearOfManufacture } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email or phone number already exists.' });
        }
        const newUser = new User({
            name,
            phone,
            email,
            password,
            role: 'user',
            vehicleDetails: { regNumber, makeModel, yearOfManufacture }
        });
        await newUser.save();
        res.status(201).json({
            success: true,
            message: 'Registration successful! Proceed to submit your activation payment.',
            user: {
                id: newUser._id,
                name: newUser.name,
                membershipStatus: newUser.membershipStatus,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server registration error', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        res.status(200).json({
            success: true,
            message: 'Welcome back to 4REAL!',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                membershipStatus: user.membershipStatus,
                vehicleDetails: user.vehicleDetails,
                inspectionsRemaining: user.inspectionsRemaining,
                diagnosticTestsRemaining: user.diagnosticTestsRemaining,
                periodicChecksRemaining: user.periodicChecksRemaining
            }
        });


    } catch (error) {
        res.status(500).json({ message: 'Server login error', error: error.message });
    }
};