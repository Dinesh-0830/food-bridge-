"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDonation = exports.updateDonation = exports.getDonationById = exports.getDonations = exports.createDonation = void 0;
const db_1 = __importDefault(require("../config/db"));
const enums_1 = require("../types/enums");
const cloudinary_1 = require("../config/cloudinary");
const createDonation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { foodName, description, category, quantity, readyTime, expiryTime, pickupAddress, foodImage, // base64 string or file buffer
        notes, calories, protein, carbs, fat, nutritionScore } = req.body;
        let orgDonorId = null;
        let indDonorId = null;
        if (role === enums_1.Role.ORGANIZATION_DONOR) {
            const org = await db_1.default.organization.findUnique({ where: { userId } });
            if (!org)
                return res.status(404).json({ message: 'Organization profile not found' });
            orgDonorId = org.id;
        }
        else if (role === enums_1.Role.INDIVIDUAL_DONOR) {
            const ind = await db_1.default.individualDonor.findUnique({ where: { userId } });
            if (!ind)
                return res.status(404).json({ message: 'Individual donor profile not found' });
            indDonorId = ind.id;
        }
        else {
            return res.status(403).json({ message: 'Only donors can create food donations' });
        }
        let foodImageUrl = '';
        if (foodImage) {
            foodImageUrl = await (0, cloudinary_1.uploadImage)(foodImage, 'donations', 'food');
        }
        else {
            // Set a generic food image fallback
            foodImageUrl = await (0, cloudinary_1.uploadImage)(undefined, 'donations', 'food');
        }
        const uniqueId = Math.floor(1000 + Math.random() * 9000);
        const generatedQrText = `FDB-DONATION-${uniqueId}-${Date.now()}`;
        const donation = await db_1.default.donation.create({
            data: {
                foodName,
                description,
                category,
                quantity: parseInt(quantity),
                readyTime,
                expiryTime,
                pickupAddress,
                foodImageUrl,
                notes,
                orgDonorId,
                indDonorId,
                status: enums_1.DonationStatus.PENDING,
                calories: calories ? parseInt(calories) : null,
                protein: protein ? parseInt(protein) : null,
                carbs: carbs ? parseInt(carbs) : null,
                fat: fat ? parseInt(fat) : null,
                nutritionScore: nutritionScore ? parseInt(nutritionScore) : null,
                qrCodeText: generatedQrText
            },
            include: {
                orgDonor: true,
                indDonor: true,
            }
        });
        // Notify NGOs about new pending donation
        // (This will also trigger a socket notification if active)
        const ngos = await db_1.default.user.findMany({ where: { role: enums_1.Role.NGO } });
        for (const ngo of ngos) {
            await db_1.default.notification.create({
                data: {
                    userId: ngo.id,
                    title: 'New Food Donation Available!',
                    message: `${donation.quantity} meals of ${donation.foodName} are ready for pickup.`,
                    type: 'DONATION_REQUEST',
                }
            });
        }
        return res.status(201).json({
            message: 'Donation created successfully',
            donation,
        });
    }
    catch (error) {
        console.error('Create donation error:', error);
        return res.status(500).json({ message: 'Internal server error creating donation', error: error.message });
    }
};
exports.createDonation = createDonation;
const getDonations = async (req, res) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const { status } = req.query;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        let queryFilter = {};
        // Filter by status if provided
        if (status) {
            queryFilter.status = status;
        }
        // Role-based filtering
        if (role === enums_1.Role.ORGANIZATION_DONOR) {
            const org = await db_1.default.organization.findUnique({ where: { userId } });
            queryFilter.orgDonorId = org?.id;
        }
        else if (role === enums_1.Role.INDIVIDUAL_DONOR) {
            const ind = await db_1.default.individualDonor.findUnique({ where: { userId } });
            queryFilter.indDonorId = ind?.id;
        }
        else if (role === enums_1.Role.VOLUNTEER) {
            // Volunteers see donations linked to assignments they are handling or available ones
            const vol = await db_1.default.volunteer.findUnique({ where: { userId } });
            queryFilter.assignments = {
                some: { volunteerId: vol?.id }
            };
        }
        // Admin and NGO can view all donations based on filter
        const donations = await db_1.default.donation.findMany({
            where: queryFilter,
            include: {
                orgDonor: true,
                indDonor: true,
                assignments: {
                    include: {
                        volunteer: true,
                        ngo: true,
                        proof: true,
                        tracking: {
                            orderBy: { timestamp: 'desc' },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ donations });
    }
    catch (error) {
        console.error('Get donations error:', error);
        return res.status(500).json({ message: 'Internal server error fetching donations' });
    }
};
exports.getDonations = getDonations;
const getDonationById = async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await db_1.default.donation.findUnique({
            where: { id },
            include: {
                orgDonor: true,
                indDonor: true,
                assignments: {
                    include: {
                        volunteer: true,
                        ngo: true,
                        proof: true,
                        tracking: {
                            orderBy: { timestamp: 'desc' }
                        }
                    }
                }
            }
        });
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        return res.json({ donation });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error fetching donation details' });
    }
};
exports.getDonationById = getDonationById;
const updateDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const { foodName, description, category, quantity, readyTime, expiryTime, pickupAddress, notes, status } = req.body;
        const donation = await db_1.default.donation.findUnique({ where: { id } });
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        // Only allow editing if pending, or if updating status (e.g. cancelling)
        const updated = await db_1.default.donation.update({
            where: { id },
            data: {
                foodName: foodName || donation.foodName,
                description: description || donation.description,
                category: category || donation.category,
                quantity: quantity ? parseInt(quantity) : donation.quantity,
                readyTime: readyTime || donation.readyTime,
                expiryTime: expiryTime || donation.expiryTime,
                pickupAddress: pickupAddress || donation.pickupAddress,
                notes: notes || donation.notes,
                status: status || donation.status,
            },
            include: {
                orgDonor: true,
                indDonor: true,
            }
        });
        return res.json({ message: 'Donation updated successfully', donation: updated });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error updating donation' });
    }
};
exports.updateDonation = updateDonation;
const deleteDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const donation = await db_1.default.donation.findUnique({ where: { id } });
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        if (donation.status !== enums_1.DonationStatus.PENDING) {
            return res.status(400).json({ message: 'Cannot delete a donation that has already been accepted or processed' });
        }
        await db_1.default.donation.delete({ where: { id } });
        return res.json({ message: 'Donation deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error deleting donation' });
    }
};
exports.deleteDonation = deleteDonation;
