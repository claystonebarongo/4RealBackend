const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    vehicleDetails: {
        regNumber: { type: String, required: true },
        makeModel: { type: String, required: true },
        yearOfManufacture: { type: Number, required: true }
    },
    membershipStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    inspectionsRemaining: { type: Number, default: 3 },
    diagnosticTestsRemaining: { type: Number, default: 1 },
    periodicChecksRemaining: { type: Number, default: 3 }
}, { timestamps: true });


UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);