"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNgoProfile = exports.verifyDelivery = exports.assignDestinationAndVolunteer = exports.getDestinations = exports.getNgoDashboardData = void 0;
const db_1 = __importDefault(require("../config/db"));
const enums_1 = require("../types/enums");
const getNgoDashboardData = async (req, res) => {
    try {
        const donations = await db_1.default.donation.findMany({
            include: {
                orgDonor: true,
                indDonor: true,
                assignments: {
                    include: {
                        volunteer: true,
                        proof: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ donations });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error fetching NGO data' });
    }
};
exports.getNgoDashboardData = getNgoDashboardData;
const getDestinations = async (req, res) => {
    try {
        const hospitals = await db_1.default.hospital.findMany();
        const needyLocations = await db_1.default.needyLocation.findMany();
        return res.json({
            hospitals,
            needyLocations
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error fetching destinations' });
    }
};
exports.getDestinations = getDestinations;
const assignDestinationAndVolunteer = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'User not authenticated' });
        const ngo = await db_1.default.ngo.findUnique({ where: { userId } });
        if (!ngo)
            return res.status(404).json({ message: 'NGO profile not found' });
        const { donationId, destinationType, // HOSPITAL, SHELTER, NEEDY_AREA
        destinationId, // id of hospital or needy location
        destinationName, destinationAddress, volunteerId // optional, if null, volunteer accepts manually
         } = req.body;
        const donation = await db_1.default.donation.findUnique({ where: { id: donationId } });
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        if (donation.status !== enums_1.DonationStatus.PENDING) {
            return res.status(400).json({ message: 'Donation is already assigned or processed' });
        }
        // Determine status of donation and volunteer status
        const donationStatus = volunteerId ? enums_1.DonationStatus.ASSIGNED : enums_1.DonationStatus.ACCEPTED;
        const assignmentStatus = volunteerId ? enums_1.VolunteerStatus.ASSIGNED : enums_1.VolunteerStatus.AVAILABLE;
        const assignment = await db_1.default.$transaction(async (tx) => {
            // Create assignment
            const assign = await tx.deliveryAssignment.create({
                data: {
                    donationId,
                    ngoId: ngo.id,
                    volunteerId: volunteerId || null,
                    destinationType,
                    destinationName,
                    destinationAddress,
                    hospitalId: destinationType === 'HOSPITAL' ? destinationId : null,
                    needyLocationId: destinationType !== 'HOSPITAL' ? destinationId : null,
                    status: assignmentStatus,
                },
            });
            // Update donation status
            await tx.donation.update({
                where: { id: donationId },
                data: { status: donationStatus },
            });
            // If volunteer is pre-assigned, update their status and notify them
            if (volunteerId) {
                await tx.volunteer.update({
                    where: { id: volunteerId },
                    data: { status: enums_1.VolunteerStatus.ASSIGNED },
                });
                const volunteer = await tx.volunteer.findUnique({
                    where: { id: volunteerId },
                    select: { userId: true }
                });
                if (volunteer) {
                    await tx.notification.create({
                        data: {
                            userId: volunteer.userId,
                            title: 'New Delivery Assignment!',
                            message: `You have been assigned to pick up food from ${donation.pickupAddress} and deliver to ${destinationName}.`,
                            type: 'DONATION_REQUEST',
                        }
                    });
                }
            }
            return assign;
        });
        // Notify Donor
        const donorUserId = donation.orgDonorId
            ? (await db_1.default.organization.findUnique({ where: { id: donation.orgDonorId } }))?.userId
            : (await db_1.default.individualDonor.findUnique({ where: { id: donation.indDonorId } }))?.userId;
        if (donorUserId) {
            await db_1.default.notification.create({
                data: {
                    userId: donorUserId,
                    title: 'Donation Accepted by NGO',
                    message: `Your donation of ${donation.foodName} has been processed. Destination: ${destinationName}.`,
                    type: 'STATUS_UPDATE',
                }
            });
        }
        return res.status(201).json({
            message: 'Destination assigned successfully',
            assignment,
        });
    }
    catch (error) {
        console.error('Assign error:', error);
        return res.status(500).json({ message: 'Internal server error during assignment', error: error.message });
    }
};
exports.assignDestinationAndVolunteer = assignDestinationAndVolunteer;
const verifyDelivery = async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const assignment = await db_1.default.deliveryAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                donation: true,
                volunteer: true,
                proof: true
            }
        });
        if (!assignment) {
            return res.status(404).json({ message: 'Delivery assignment not found' });
        }
        if (!assignment.proof) {
            return res.status(400).json({ message: 'No delivery proof has been uploaded yet' });
        }
        await db_1.default.$transaction(async (tx) => {
            // 1. Update delivery proof as verified
            await tx.deliveryProof.update({
                where: { assignmentId },
                data: {
                    verified: true,
                    verifiedAt: new Date()
                }
            });
            // 2. Update donation as verified
            await tx.donation.update({
                where: { id: assignment.donationId },
                data: { status: enums_1.DonationStatus.VERIFIED }
            });
            // 3. Make volunteer available again
            if (assignment.volunteer) {
                await tx.volunteer.update({
                    where: { id: assignment.volunteer.id },
                    data: { status: enums_1.VolunteerStatus.AVAILABLE }
                });
                // Notify volunteer
                await tx.notification.create({
                    data: {
                        userId: assignment.volunteer.userId,
                        title: 'Delivery Verified!',
                        message: `Your delivery of ${assignment.donation.foodName} has been verified. Thank you for your service!`,
                        type: 'GENERAL',
                    }
                });
            }
        });
        // Notify Donor
        const donation = assignment.donation;
        const donorUserId = donation.orgDonorId
            ? (await db_1.default.organization.findUnique({ where: { id: donation.orgDonorId } }))?.userId
            : (await db_1.default.individualDonor.findUnique({ where: { id: donation.indDonorId } }))?.userId;
        if (donorUserId) {
            await db_1.default.notification.create({
                data: {
                    userId: donorUserId,
                    title: 'Donation Completed & Verified!',
                    message: `The delivery of ${donation.foodName} to ${assignment.destinationName} is now complete and verified.`,
                    type: 'STATUS_UPDATE',
                }
            });
        }
        return res.json({ message: 'Delivery verified successfully' });
    }
    catch (error) {
        console.error('Verify delivery error:', error);
        return res.status(500).json({ message: 'Internal server error verifying delivery' });
    }
};
exports.verifyDelivery = verifyDelivery;
const updateNgoProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'User not authenticated' });
        const { regCertificateUrl, govApprovalUrl } = req.body;
        const ngo = await db_1.default.ngo.update({
            where: { userId },
            data: {
                regCertificateUrl,
                govApprovalUrl,
                documentStatus: 'PENDING'
            }
        });
        return res.json({ success: true, ngo });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating NGO profile documents' });
    }
};
exports.updateNgoProfile = updateNgoProfile;
