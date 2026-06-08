import { Request, Response } from 'express';
import prisma from '../config/db';
import { VolunteerStatus, DonationStatus } from '../types/enums';
import { uploadImage } from '../config/cloudinary';

export const getAvailableAssignments = async (req: Request, res: Response) => {
  try {
    // Available assignments are those where no volunteer is assigned yet
    const assignments = await prisma.deliveryAssignment.findMany({
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
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error fetching available assignments' });
  }
};

export const acceptAssignment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params; // assignmentId

    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const volunteer = await prisma.volunteer.findUnique({ where: { userId } });
    if (!volunteer) return res.status(404).json({ message: 'Volunteer profile not found' });

    if (volunteer.status !== VolunteerStatus.AVAILABLE) {
      return res.status(400).json({ message: 'You must complete your active delivery before accepting a new one' });
    }

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id },
      include: { donation: true }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.volunteerId) {
      return res.status(400).json({ message: 'This assignment has already been taken' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Assign volunteer
      await tx.deliveryAssignment.update({
        where: { id },
        data: {
          volunteerId: volunteer.id,
          status: VolunteerStatus.ASSIGNED
        }
      });

      // 2. Set volunteer status as assigned
      await tx.volunteer.update({
        where: { id: volunteer.id },
        data: { status: VolunteerStatus.ASSIGNED }
      });

      // 3. Set donation status as ASSIGNED
      await tx.donation.update({
        where: { id: assignment.donationId },
        data: { status: DonationStatus.ASSIGNED }
      });
    });

    return res.json({ message: 'Assignment accepted successfully' });
  } catch (error) {
    console.error('Accept assignment error:', error);
    return res.status(500).json({ message: 'Internal server error accepting assignment' });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params; // assignmentId
    const { status } = req.body; // VolunteerStatus enum: ON_THE_WAY, ARRIVED_AT_PICKUP, FOOD_PICKED_UP, DELIVERING, DELIVERED

    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const volunteer = await prisma.volunteer.findUnique({ where: { userId } });
    if (!volunteer) return res.status(404).json({ message: 'Volunteer profile not found' });

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id },
      include: { donation: true }
    });

    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (assignment.volunteerId !== volunteer.id) {
      return res.status(403).json({ message: 'You are not authorized for this assignment' });
    }

    const nextStatus = status as VolunteerStatus;

    await prisma.$transaction(async (tx) => {
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
      if (nextStatus === VolunteerStatus.FOOD_PICKED_UP) {
        donStatus = DonationStatus.PICKED_UP;
      } else if (nextStatus === VolunteerStatus.DELIVERED) {
        donStatus = DonationStatus.DELIVERED;
      }

      await tx.donation.update({
        where: { id: assignment.donationId },
        data: { status: donStatus }
      });
    });

    // Notify Donor & NGO
    const donorUserId = assignment.donation.orgDonorId 
      ? (await prisma.organization.findUnique({ where: { id: assignment.donation.orgDonorId } }))?.userId 
      : (await prisma.individualDonor.findUnique({ where: { id: assignment.donation.indDonorId! } }))?.userId;

    const ngoUserId = (await prisma.ngo.findUnique({ where: { id: assignment.ngoId } }))?.userId;

    const updateMsg = `Volunteer has updated delivery status: ${nextStatus.replace(/_/g, ' ')}`;

    if (donorUserId) {
      await prisma.notification.create({
        data: {
          userId: donorUserId,
          title: 'Delivery Status Updated',
          message: updateMsg,
          type: 'STATUS_UPDATE',
        }
      });
    }

    if (ngoUserId) {
      await prisma.notification.create({
        data: {
          userId: ngoUserId,
          title: 'Delivery Status Updated',
          message: updateMsg,
          type: 'STATUS_UPDATE',
        }
      });
    }

    return res.json({ message: `Status updated to ${nextStatus}` });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ message: 'Internal server error updating delivery status' });
  }
};

export const uploadProof = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params; // assignmentId
    const { photo, recipientPhoto, notes } = req.body;

    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const volunteer = await prisma.volunteer.findUnique({ where: { userId } });
    if (!volunteer) return res.status(404).json({ message: 'Volunteer profile not found' });

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id },
      include: { donation: true }
    });

    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Upload images
    const photoUrl = await uploadImage(photo, 'delivery_proofs', 'proof');
    const recipientPhotoUrl = recipientPhoto ? await uploadImage(recipientPhoto, 'delivery_proofs', 'proof') : null;

    const proof = await prisma.deliveryProof.create({
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
  } catch (error: any) {
    console.error('Upload proof error:', error);
    return res.status(500).json({ message: 'Internal server error uploading proof', error: error.message });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { latitude, longitude } = req.body;

    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const volunteer = await prisma.volunteer.findUnique({ where: { userId } });
    if (!volunteer) return res.status(404).json({ message: 'Volunteer profile not found' });

    // Update volunteer location
    const updatedVolunteer = await prisma.volunteer.update({
      where: { id: volunteer.id },
      data: {
        currentLat: parseFloat(latitude),
        currentLng: parseFloat(longitude),
      }
    });

    // Find any active assignment (not delivered/verified yet)
    const activeAssignment = await prisma.deliveryAssignment.findFirst({
      where: {
        volunteerId: volunteer.id,
        status: {
          in: [
            VolunteerStatus.ASSIGNED,
            VolunteerStatus.ON_THE_WAY,
            VolunteerStatus.ARRIVED_AT_PICKUP,
            VolunteerStatus.FOOD_PICKED_UP,
            VolunteerStatus.DELIVERING
          ]
        }
      }
    });

    if (activeAssignment) {
      // Log location history in tracking table
      await prisma.deliveryTracking.create({
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
  } catch (error: any) {
    console.error('Location update error:', error);
    return res.status(500).json({ message: 'Internal server error updating location' });
  }
};
