"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveNgoDocs = exports.getAnalytics = exports.approveUser = exports.getAllUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const enums_1 = require("../types/enums");
const getAllUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            include: {
                organization: true,
                individualDonor: true,
                volunteer: true,
                ngo: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        // Format users for the dashboard
        const formatted = users.map((u) => {
            const profile = u.organization || u.individualDonor || u.volunteer || u.ngo;
            return {
                id: u.id,
                email: u.email,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
                profile,
            };
        });
        return res.json({ users: formatted });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'APPROVED' or 'REJECTED' or 'PENDING'
        if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
            return res.status(400).json({ message: 'Invalid approval status value' });
        }
        const user = await db_1.default.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await db_1.default.user.update({
            where: { id },
            data: { status },
            select: { id: true, email: true, role: true, status: true },
        });
        // Notify user
        await db_1.default.notification.create({
            data: {
                userId: updatedUser.id,
                title: `Account Status Update`,
                message: `Your FoodBridge account status has been updated to: ${status}.`,
                type: 'GENERAL',
            }
        });
        return res.json({ message: `User account is now ${status}`, user: updatedUser });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error updating account status' });
    }
};
exports.approveUser = approveUser;
const getAnalytics = async (req, res) => {
    try {
        // 1. Total meals delivered (sum of quantity where status is VERIFIED or DELIVERED)
        const verifiedDonations = await db_1.default.donation.findMany({
            where: {
                status: { in: [enums_1.DonationStatus.DELIVERED, enums_1.DonationStatus.VERIFIED] }
            },
            select: { quantity: true }
        });
        const totalMealsDelivered = verifiedDonations.reduce((sum, d) => sum + d.quantity, 0);
        // 2. Count registrations by role
        const totalDonorsOrg = await db_1.default.organization.count();
        const totalDonorsInd = await db_1.default.individualDonor.count();
        const totalVolunteers = await db_1.default.volunteer.count();
        const totalNgos = await db_1.default.ngo.count();
        // 3. Donation counts by status
        const pendingDonationsCount = await db_1.default.donation.count({ where: { status: enums_1.DonationStatus.PENDING } });
        const activeDonationsCount = await db_1.default.donation.count({
            where: { status: { in: [enums_1.DonationStatus.ACCEPTED, enums_1.DonationStatus.ASSIGNED, enums_1.DonationStatus.PICKED_UP] } }
        });
        const completedDonationsCount = await db_1.default.donation.count({
            where: { status: { in: [enums_1.DonationStatus.DELIVERED, enums_1.DonationStatus.VERIFIED] } }
        });
        // 4. Donor Leaderboard (sum of quantity by Organization or Individual)
        const orgDonationsGrouped = await db_1.default.donation.groupBy({
            by: ['orgDonorId'],
            where: {
                orgDonorId: { not: null },
                status: { in: [enums_1.DonationStatus.DELIVERED, enums_1.DonationStatus.VERIFIED] }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });
        const indDonationsGrouped = await db_1.default.donation.groupBy({
            by: ['indDonorId'],
            where: {
                indDonorId: { not: null },
                status: { in: [enums_1.DonationStatus.DELIVERED, enums_1.DonationStatus.VERIFIED] }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });
        // Map leaderboard IDs to names
        const orgIds = orgDonationsGrouped.map(g => g.orgDonorId).filter(Boolean);
        const indIds = indDonationsGrouped.map(g => g.indDonorId).filter(Boolean);
        const orgNames = await db_1.default.organization.findMany({
            where: { id: { in: orgIds } },
            select: { id: true, name: true }
        });
        const indNames = await db_1.default.individualDonor.findMany({
            where: { id: { in: indIds } },
            select: { id: true, fullName: true }
        });
        const orgLeaderboard = orgDonationsGrouped.map((g) => ({
            name: orgNames.find((o) => o.id === g.orgDonorId)?.name || 'Unknown Hotel',
            meals: g._sum.quantity || 0,
            type: 'Hotel/Organization'
        }));
        const indLeaderboard = indDonationsGrouped.map((g) => ({
            name: indNames.find((i) => i.id === g.indDonorId)?.fullName || 'Unknown Donor',
            meals: g._sum.quantity || 0,
            type: 'Individual'
        }));
        const combinedLeaderboard = [...orgLeaderboard, ...indLeaderboard]
            .sort((a, b) => b.meals - a.meals)
            .slice(0, 5);
        // 5. Recent Delivery Logs (for active monitoring)
        const recentDeliveries = await db_1.default.deliveryAssignment.findMany({
            include: {
                donation: {
                    include: {
                        orgDonor: true,
                        indDonor: true,
                    }
                },
                ngo: true,
                volunteer: true,
            },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });
        return res.json({
            summary: {
                totalMealsDelivered,
                users: {
                    organizations: totalDonorsOrg,
                    individuals: totalDonorsInd,
                    volunteers: totalVolunteers,
                    ngos: totalNgos,
                    total: totalDonorsOrg + totalDonorsInd + totalVolunteers + totalNgos
                },
                donations: {
                    pending: pendingDonationsCount,
                    active: activeDonationsCount,
                    completed: completedDonationsCount,
                    total: pendingDonationsCount + activeDonationsCount + completedDonationsCount
                }
            },
            leaderboard: combinedLeaderboard,
            recentDeliveries: recentDeliveries.map(d => ({
                id: d.id,
                foodName: d.donation.foodName,
                quantity: d.donation.quantity,
                donorName: d.donation.orgDonor?.name || d.donation.indDonor?.fullName || 'Anonymous',
                ngoName: d.ngo.name,
                volunteerName: d.volunteer?.fullName || 'Unassigned',
                destination: d.destinationName,
                status: d.status,
                updatedAt: d.updatedAt
            }))
        });
    }
    catch (error) {
        console.error('Analytics error:', error);
        return res.status(500).json({ message: 'Internal server error calculating analytics' });
    }
};
exports.getAnalytics = getAnalytics;
const approveNgoDocs = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid document approval status' });
        }
        const ngo = await db_1.default.ngo.findUnique({ where: { id } });
        if (!ngo) {
            return res.status(404).json({ message: 'NGO profile not found' });
        }
        const updatedNgo = await db_1.default.ngo.update({
            where: { id },
            data: { documentStatus: status },
        });
        await db_1.default.notification.create({
            data: {
                userId: ngo.userId,
                title: `NGO Legal Documents Update`,
                message: `Your uploaded NGO registration/legal documents have been: ${status}.`,
                type: 'GENERAL',
            }
        });
        return res.json({ success: true, ngo: updatedNgo });
    }
    catch (error) {
        console.error('Error approving NGO docs:', error);
        return res.status(500).json({ message: 'Internal server error approving NGO documents' });
    }
};
exports.approveNgoDocs = approveNgoDocs;
