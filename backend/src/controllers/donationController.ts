import { Request, Response } from 'express';
import prisma from '../config/db';
import { DonationStatus, Role } from '../types/enums';
import { uploadImage } from '../config/cloudinary';

export const createDonation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const role = (req as any).user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      foodName,
      description,
      category,
      quantity,
      readyTime,
      expiryTime,
      pickupAddress,
      foodImage, // base64 string or file buffer
      notes,
      calories,
      protein,
      carbs,
      fat,
      nutritionScore
    } = req.body;

    let orgDonorId: string | null = null;
    let indDonorId: string | null = null;

    if (role === Role.ORGANIZATION_DONOR) {
      const org = await prisma.organization.findUnique({ where: { userId } });
      if (!org) return res.status(404).json({ message: 'Organization profile not found' });
      orgDonorId = org.id;
    } else if (role === Role.INDIVIDUAL_DONOR) {
      const ind = await prisma.individualDonor.findUnique({ where: { userId } });
      if (!ind) return res.status(404).json({ message: 'Individual donor profile not found' });
      indDonorId = ind.id;
    } else {
      return res.status(403).json({ message: 'Only donors can create food donations' });
    }

    let foodImageUrl = '';
    if (foodImage) {
      foodImageUrl = await uploadImage(foodImage, 'donations', 'food');
    } else {
      // Set a generic food image fallback
      foodImageUrl = await uploadImage(undefined, 'donations', 'food');
    }

    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    const generatedQrText = `FDB-DONATION-${uniqueId}-${Date.now()}`;

    const donation = await prisma.donation.create({
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
        status: DonationStatus.PENDING,
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
    const ngos = await prisma.user.findMany({ where: { role: Role.NGO } });
    for (const ngo of ngos) {
      await prisma.notification.create({
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
  } catch (error: any) {
    console.error('Create donation error:', error);
    return res.status(500).json({ message: 'Internal server error creating donation', error: error.message });
  }
};

export const getDonations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const role = (req as any).user?.role;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    let queryFilter: any = {};

    // Filter by status if provided
    if (status) {
      queryFilter.status = status as DonationStatus;
    }

    // Role-based filtering
    if (role === Role.ORGANIZATION_DONOR) {
      const org = await prisma.organization.findUnique({ where: { userId } });
      queryFilter.orgDonorId = org?.id;
    } else if (role === Role.INDIVIDUAL_DONOR) {
      const ind = await prisma.individualDonor.findUnique({ where: { userId } });
      queryFilter.indDonorId = ind?.id;
    } else if (role === Role.VOLUNTEER) {
      // Volunteers see donations linked to assignments they are handling or available ones
      const vol = await prisma.volunteer.findUnique({ where: { userId } });
      queryFilter.assignments = {
        some: { volunteerId: vol?.id }
      };
    }

    // Admin and NGO can view all donations based on filter

    const donations = await prisma.donation.findMany({
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
  } catch (error: any) {
    console.error('Get donations error:', error);
    return res.status(500).json({ message: 'Internal server error fetching donations' });
  }
};

export const getDonationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donation = await prisma.donation.findUnique({
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
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error fetching donation details' });
  }
};

export const updateDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { foodName, description, category, quantity, readyTime, expiryTime, pickupAddress, notes, status } = req.body;

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Only allow editing if pending, or if updating status (e.g. cancelling)
    const updated = await prisma.donation.update({
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
        status: (status as DonationStatus) || donation.status,
      },
      include: {
        orgDonor: true,
        indDonor: true,
      }
    });

    return res.json({ message: 'Donation updated successfully', donation: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error updating donation' });
  }
};

export const deleteDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donation = await prisma.donation.findUnique({ where: { id } });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== DonationStatus.PENDING) {
      return res.status(400).json({ message: 'Cannot delete a donation that has already been accepted or processed' });
    }

    await prisma.donation.delete({ where: { id } });
    return res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error deleting donation' });
  }
};
