import { Request, Response } from 'express';
import prisma from '../config/db';
import { Role, DonationStatus } from '../types/enums';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error fetching users' });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED' or 'PENDING'

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Invalid approval status value' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, role: true, status: true },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: updatedUser.id,
        title: `Account Status Update`,
        message: `Your FoodBridge account status has been updated to: ${status}.`,
        type: 'GENERAL',
      }
    });

    return res.json({ message: `User account is now ${status}`, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error updating account status' });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // 1. Total meals delivered (sum of quantity where status is VERIFIED or DELIVERED)
    const verifiedDonations = await prisma.donation.findMany({
      where: {
        status: { in: [DonationStatus.DELIVERED, DonationStatus.VERIFIED] }
      },
      select: { quantity: true }
    });
    const totalMealsDelivered = verifiedDonations.reduce((sum, d) => sum + d.quantity, 0);

    // 2. Count registrations by role
    const totalDonorsOrg = await prisma.organization.count();
    const totalDonorsInd = await prisma.individualDonor.count();
    const totalVolunteers = await prisma.volunteer.count();
    const totalNgos = await prisma.ngo.count();

    // 3. Donation counts by status
    const pendingDonationsCount = await prisma.donation.count({ where: { status: DonationStatus.PENDING } });
    const activeDonationsCount = await prisma.donation.count({
      where: { status: { in: [DonationStatus.ACCEPTED, DonationStatus.ASSIGNED, DonationStatus.PICKED_UP] } }
    });
    const completedDonationsCount = await prisma.donation.count({
      where: { status: { in: [DonationStatus.DELIVERED, DonationStatus.VERIFIED] } }
    });

    // 4. Donor Leaderboard (sum of quantity by Organization or Individual)
    const orgDonationsGrouped = await prisma.donation.groupBy({
      by: ['orgDonorId'],
      where: {
        orgDonorId: { not: null },
        status: { in: [DonationStatus.DELIVERED, DonationStatus.VERIFIED] }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const indDonationsGrouped = await prisma.donation.groupBy({
      by: ['indDonorId'],
      where: {
        indDonorId: { not: null },
        status: { in: [DonationStatus.DELIVERED, DonationStatus.VERIFIED] }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    // Map leaderboard IDs to names
    const orgIds = orgDonationsGrouped.map(g => g.orgDonorId!).filter(Boolean);
    const indIds = indDonationsGrouped.map(g => g.indDonorId!).filter(Boolean);

    const orgNames = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true }
    });

    const indNames = await prisma.individualDonor.findMany({
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
    const recentDeliveries = await prisma.deliveryAssignment.findMany({
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
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ message: 'Internal server error calculating analytics' });
  }
};

export const approveNgoDocs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid document approval status' });
    }

    const ngo = await prisma.ngo.findUnique({ where: { id } });
    if (!ngo) {
      return res.status(404).json({ message: 'NGO profile not found' });
    }

    const updatedNgo = await prisma.ngo.update({
      where: { id },
      data: { documentStatus: status },
    });

    await prisma.notification.create({
      data: {
        userId: ngo.userId,
        title: `NGO Legal Documents Update`,
        message: `Your uploaded NGO registration/legal documents have been: ${status}.`,
        type: 'GENERAL',
      }
    });

    return res.json({ success: true, ngo: updatedNgo });
  } catch (error) {
    console.error('Error approving NGO docs:', error);
    return res.status(500).json({ message: 'Internal server error approving NGO documents' });
  }
};

