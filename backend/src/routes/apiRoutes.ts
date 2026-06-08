import { Router, Request, Response } from 'express';
import prisma from '../config/db';

const router = Router();

// Standard public API dashboard documentation
router.get('/docs', (req: Request, res: Response) => {
  return res.json({
    title: 'FoodBridge Developer API Portal v1',
    description: 'REST APIs for partner NGOs, mobile clients, and government integration.',
    endpoints: [
      { path: '/api/v1/public/donations', method: 'GET', desc: 'List verified food donations' },
      { path: '/api/v1/public/heatmaps', method: 'GET', desc: 'Get active hunger index coordinates' },
      { path: '/api/v1/public/fridges', method: 'GET', desc: 'Get locations of community refrigerators' }
    ],
    rateLimit: '100 requests per minute per API token'
  });
});

// REST Endpoint: List verified donations
router.get('/public/donations', async (req: Request, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { status: 'VERIFIED' },
      select: {
        id: true,
        foodName: true,
        category: true,
        quantity: true,
        pickupAddress: true,
        createdAt: true
      }
    });
    return res.json({ success: true, count: donations.length, donations });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve public donations data' });
  }
});

// REST Endpoint: Get hunger index
router.get('/public/heatmaps', async (req: Request, res: Response) => {
  try {
    const heatData = [
      { location: 'Tirupati Railway Station Shelter', hungerIndex: 0.9, coordinates: [13.6280, 79.4160] },
      { location: 'Renigunta Road Slum Area', hungerIndex: 0.7, coordinates: [13.6180, 79.4440] },
      { location: 'Korlagunta District', hungerIndex: 0.85, coordinates: [13.6330, 79.4320] }
    ];
    return res.json({ success: true, heatmapData: heatData });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve heatmap index' });
  }
});

// REST Endpoint: Get community fridges
router.get('/public/fridges', async (req: Request, res: Response) => {
  try {
    const fridges = await prisma.communityFridge.findMany();
    return res.json({ success: true, count: fridges.length, fridges });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve community fridges' });
  }
});

export default router;
