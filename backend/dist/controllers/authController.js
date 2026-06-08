"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const enums_1 = require("../types/enums");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_foodbridge_key_123!';
const register = async (req, res) => {
    try {
        const { email, password, role, // ORGANIZATION_DONOR, INDIVIDUAL_DONOR, VOLUNTEER, NGO
        // Org fields
        name, contactPerson, mobile, address, orgType, openingTime, closingTime, logoUrl, 
        // Individual donor fields
        fullName, profilePhoto, 
        // Volunteer fields
        city, district, state, pincode, currentLat, currentLng, gender, dob, govIdNumber, idProofUrl, vehicleType, vehicleNumber, availability, } = req.body;
        // Check if user exists
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }
        // Validate role
        if (!Object.values(enums_1.Role).includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Initial status for volunteers/NGOs/Orgs could be pending or pre-approved depending on setup
        // For demo purposes, we will default individual donors and admin to APPROVED, and others to APPROVED as well (or PENDING if requested, let's make NGOs and Volunteers start as PENDING so Admin Dashboard has approval workflows to demo!)
        // Yes! Let's make ORGANIZATION_DONOR, VOLUNTEER, NGO start as PENDING, so the admin approval feature is fully demonstrated. Individual donors and admins are APPROVED immediately.
        const initialStatus = (role === enums_1.Role.INDIVIDUAL_DONOR || role === enums_1.Role.ADMIN) ? 'APPROVED' : 'PENDING';
        // Create User transaction
        const newUser = await db_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: role,
                    status: initialStatus,
                },
            });
            if (role === enums_1.Role.ORGANIZATION_DONOR) {
                await tx.organization.create({
                    data: {
                        userId: user.id,
                        name,
                        contactPerson,
                        mobile,
                        address,
                        orgType,
                        openingTime: openingTime || '09:00',
                        closingTime: closingTime || '22:00',
                        logoUrl: logoUrl || null,
                    },
                });
            }
            else if (role === enums_1.Role.INDIVIDUAL_DONOR) {
                await tx.individualDonor.create({
                    data: {
                        userId: user.id,
                        fullName,
                        mobile,
                        address,
                        profilePhoto: profilePhoto || null,
                    },
                });
            }
            else if (role === enums_1.Role.VOLUNTEER) {
                await tx.volunteer.create({
                    data: {
                        userId: user.id,
                        fullName,
                        mobile,
                        address,
                        city,
                        district,
                        state,
                        pincode,
                        currentLat: currentLat ? parseFloat(currentLat) : 39.7817, // default Springfield coordinates
                        currentLng: currentLng ? parseFloat(currentLng) : -89.6501,
                        gender,
                        dob,
                        govIdNumber,
                        idProofUrl: idProofUrl || null,
                        profilePhoto: profilePhoto || null,
                        vehicleType,
                        vehicleNumber: vehicleNumber || null,
                        availability,
                    },
                });
            }
            else if (role === enums_1.Role.NGO) {
                await tx.ngo.create({
                    data: {
                        userId: user.id,
                        name,
                        contactPerson: contactPerson || name,
                        mobile,
                        address,
                        logoUrl: logoUrl || null,
                    },
                });
            }
            return user;
        });
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
        // Fetch newly created user with profile
        const createdUser = await db_1.default.user.findUnique({
            where: { id: newUser.id },
            include: {
                organization: true,
                individualDonor: true,
                volunteer: true,
                ngo: true,
            },
        });
        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: createdUser?.id,
                email: createdUser?.email,
                role: createdUser?.role,
                status: createdUser?.status,
                profile: createdUser?.organization || createdUser?.individualDonor || createdUser?.volunteer || createdUser?.ngo
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error during registration', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await db_1.default.user.findUnique({
            where: { email },
            include: {
                organization: true,
                individualDonor: true,
                volunteer: true,
                ngo: true,
            },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                profile: user.organization || user.individualDonor || user.volunteer || user.ngo,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error during login' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const reqUser = req.user;
        if (!reqUser) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: reqUser.id },
            include: {
                organization: true,
                individualDonor: true,
                volunteer: true,
                ngo: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                profile: user.organization || user.individualDonor || user.volunteer || user.ngo,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error fetching profile' });
    }
};
exports.getMe = getMe;
const logout = async (req, res) => {
    // Stateless JWT doesn't strictly need a backend logout, but we return a success status
    return res.json({ message: 'Logout successful' });
};
exports.logout = logout;
