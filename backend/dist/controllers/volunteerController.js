"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocation = exports.uploadProof = exports.updateDeliveryStatus = exports.acceptAssignment = exports.getAvailableAssignments = void 0;
const db_1 = __importDefault(require("../config/db"));
const enums_1 = require("../types/enums");
const cloudinary_1 = require("../config/cloudinary");
const getAvailableAssignments = async (req, res) => {
    try {
        // Available assignments are those where no volunteer is assigned yet
        const assignments = await db_1.default.deliveryAssignment.findMany({
            where: {
                volunteerId: null,
            },
            include: {
                donation: {
                    include: {
                        orgDonor: true,
                        indDonor: true,
                    }
                },
                ngo: true
            }
        });
        return res.json({ assignments });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error fetching available assignments' });
    }
};
exports.getAvailableAssignments = getAvailableAssignments;
const acceptAssignment = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params; // assignmentId
        if (!userId)
            return res.status(401).json({ message: 'Not authenticated' });
        const volunteer = await db_1.default.volunteer.findUnique({ where: { userId } });
        if (!volunteer)
            return res.status(404).json({ message: 'Volunteer profile not found' });
        if (volunteer.status !== enums_1.VolunteerStatus.AVAILABLE) {
            return res.status(400).json({ message: 'You must complete your active delivery before accepting a new one' });
        }
        const assignment = await db_1.default.deliveryAssignment.findUnique({
            where: { id },
            include: { donation: true }
        });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        if (assignment.volunteerId) {
            return res.status(400).json({ message: 'This assignment has already been taken' });
        }
        await db_1.default.$transaction(async (tx) => {
            // 1. Assign volunteer
            await tx.deliveryAssignment.update({
                where: { id },
                data: {
                    volunteerId: volunteer.id,
                    status: enums_1.VolunteerStatus.ASSIGNED
                }
            });
            // 2. Set volunteer status as assigned
            await tx.volunteer.update({
                where: { id: volunteer.id },
                data: { status: enums_1.VolunteerStatus.ASSIGNED }
            });
            // 3. Set donation status as ASSIGNED
            await tx.donation.update({
                where: { id: assignment.donationId },
                data: { status: enums_1.DonationStatus.ASSIGNED }
            });
        });
        return res.json({ message: 'Assignment accepted successfully' });
    }
    catch (error) {
        console.error('Accept assignment error:', error);
        return res.status(500).json({ message: 'Internal server error accepting assignment' });
    }
};
exports.acceptAssignment = acceptAssignment;
const updateDeliveryStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params; // assignmentId
        const { status } = req.body; // VolunteerStatus enum: ON_THE_WAY, ARRIVED_AT_PICKUP, FOOD_PICKED_UP, DELIVERING, DELIVERED
        if (!userId)
            return res.status(401).json({ message: 'Not authenticated' });
        const volunteer = await db_1.default.volunteer.findUnique({ where: { userId } });
        if (!volunteer)
            return res.status(404).json({ message: 'Volunteer profile not found' });
        const assignment = await db_1.default.deliveryAssignment.findUnique({
            where: { id },
            include: { donation: true }
        });
        if (!assignment)
            return res.status(404).json({ message: 'Assignment not found' });
        if (assignment.volunteerId !== volunteer.id) {
            return res.status(403).json({ message: 'You are not authorized for this assignment' });
        }
        const nextStatus = status;
        await db_1.default.$transaction(async (tx) => {
            // Update assignment status
            await tx.deliveryAssignment.update({
                where: { id },
                data: { status: nextStatus }
            });
            // Update volunteer status
            await tx.volunteer.update({
                where: { id: volunteer.id },
                data: { status: nextStatus }
            });
            // Sync donation status based on volunteer action
            let donStatus = assignment.donation.status;
            if (nextStatus === enums_1.VolunteerStatus.FOOD_PICKED_UP) {
                donStatus = enums_1.DonationStatus.PICKED_UP;
            }
            else if (nextStatus === enums_1.VolunteerStatus.DELIVERED) {
                donStatus = enums_1.DonationStatus.DELIVERED;
            }
            await tx.donation.update({
                where: { id: assignment.donationId },
                data: { status: donStatus }
            });
        });
        // Notify Donor & NGO
        const donorUserId = assignment.donation.orgDonorId
            ? (await db_1.default.organization.findUnique({ where: { id: assignment.donation.orgDonorId } }))?.userId
            : (await db_1.default.individualDonor.findUnique({ where: { id: assignment.donation.indDonorId } }))?.userId;
        const ngoUserId = (await db_1.default.ngo.findUnique({ where: { id: assignment.ngoId } }))?.userId;
        const updateMsg = `Volunteer has updated delivery status: ${nextStatus.replace(/_/g, ' ')}`;
        if (donorUserId) {
            await db_1.default.notification.create({
                data: {
                    userId: donorUserId,
                    title: 'Delivery Status Updated',
                    message: updateMsg,
                    type: 'STATUS_UPDATE',
                }
            });
        }
        if (ngoUserId) {
            await db_1.default.notification.create({
                data: {
                    userId: ngoUserId,
                    title: 'Delivery Status Updated',
                    message: updateMsg,
                    type: 'STATUS_UPDATE',
                }
            });
        }
        return res.json({ message: `Status updated to ${nextStatus}` });
    }
    catch (error) {
        console.error('Update status error:', error);
        return res.status(500).json({ message: 'Internal server error updating delivery status' });
    }
};
exports.updateDeliveryStatus = updateDeliveryStatus;
const uploadProof = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params; // assignmentId
        const { photo, recipientPhoto, notes } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'Not authenticated' });
        const volunteer = await db_1.default.volunteer.findUnique({ where: { userId } });
        if (!volunteer)
            return res.status(404).json({ message: 'Volunteer profile not found' });
        const assignment = await db_1.default.deliveryAssignment.findUnique({
            where: { id },
            include: { donation: true }
        });
        if (!assignment)
            return res.status(404).json({ message: 'Assignment not found' });
        // Upload images
        const photoUrl = await (0, cloudinary_1.uploadImage)(photo, 'delivery_proofs', 'proof');
        const recipientPhotoUrl = recipientPhoto ? await (0, cloudinary_1.uploadImage)(recipientPhoto, 'delivery_proofs', 'proof') : null;
        const proof = await db_1.default.deliveryProof.create({
            data: {
                assignmentId: assignment.id,
                photoUrl,
                recipientPhotoUrl,
                notes,
            }
        });
        return res.status(201).json({
            message: 'Delivery proof uploaded successfully',
            proof,
        });
    }
    catch (error) {
        console.error('Upload proof error:', error);
        return res.status(500).json({ message: 'Internal server error uploading proof', error: error.message });
    }
};
exports.uploadProof = uploadProof;
const updateLocation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { latitude, longitude } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'Not authenticated' });
        const volunteer = await db_1.default.volunteer.findUnique({ where: { userId } });
        if (!volunteer)
            return res.status(404).json({ message: 'Volunteer profile not found' });
        // Update volunteer location
        const updatedVolunteer = await db_1.default.volunteer.update({
            where: { id: volunteer.id },
            data: {
                currentLat: parseFloat(latitude),
                currentLng: parseFloat(longitude),
            }
        });
        // Find any active assignment (not delivered/verified yet)
        const activeAssignment = await db_1.default.deliveryAssignment.findFirst({
            where: {
                volunteerId: volunteer.id,
                status: {
                    in: [
                        enums_1.VolunteerStatus.ASSIGNED,
                        enums_1.VolunteerStatus.ON_THE_WAY,
                        enums_1.VolunteerStatus.ARRIVED_AT_PICKUP,
                        enums_1.VolunteerStatus.FOOD_PICKED_UP,
                        enums_1.VolunteerStatus.DELIVERING
                    ]
                }
            }
        });
        if (activeAssignment) {
            // Log location history in tracking table
            await db_1.default.deliveryTracking.create({
                data: {
                    assignmentId: activeAssignment.id,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                }
            });
        }
        return res.json({
            message: 'Location updated successfully',
            latitude: updatedVolunteer.currentLat,
            longitude: updatedVolunteer.currentLng,
            hasActiveAssignment: !!activeAssignment
        });
    }
    catch (error) {
        console.error('Location update error:', error);
        return res.status(500).json({ message: 'Internal server error updating location' });
    }
};
exports.updateLocation = updateLocation;
