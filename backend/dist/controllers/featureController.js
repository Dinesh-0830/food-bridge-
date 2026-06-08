"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCsrReport = exports.getColdStorages = exports.getReferrals = exports.createReferral = exports.getVolunteerAchievements = exports.askChatbot = exports.analyzeNutrition = exports.refillFridge = exports.getFridges = exports.deleteSchedule = exports.getSchedules = exports.createSchedule = exports.getDisasterStatus = exports.toggleDisasterMode = exports.getHungerHeatmap = exports.getEmergencyRequests = exports.createEmergencyRequest = exports.getLeaderboard = exports.getWasteAnalytics = exports.getSmartMatch = exports.verifyImage = exports.predictLeftovers = void 0;
const db_1 = __importDefault(require("../config/db"));
// 1. AI Leftover Food Prediction
const predictLeftovers = async (req, res) => {
    try {
        const { customerCount, dayOfWeek, eventType } = req.body;
        const count = parseInt(customerCount) || 100;
        // Simulated AI Prediction math based on historical trends
        let wasteFactor = 0.15; // default 15%
        if (dayOfWeek === 'Friday' || dayOfWeek === 'Saturday')
            wasteFactor += 0.05; // peak weekend waste
        if (eventType === 'Wedding Buffet')
            wasteFactor += 0.10; // buffets waste more
        if (eventType === 'Corporate Lunch')
            wasteFactor -= 0.03; // corporate events are more controlled
        const predictedQty = Math.round(count * wasteFactor);
        const confidence = Math.round(85 + Math.random() * 10); // 85% to 95% confidence
        const suggestedTime = dayOfWeek === 'Sunday' ? '09:30 PM' : '10:00 PM';
        return res.json({
            predictedQty,
            suggestedTime,
            confidence,
            recommendation: `Based on your inputs, we recommend preparing packaging containers by ${suggestedTime}. Heavy demand expected for NGOs nearby.`
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error calculating AI prediction' });
    }
};
exports.predictLeftovers = predictLeftovers;
// 2. AI Image Spoilage Verification
const verifyImage = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'No image provided for analysis' });
        }
        // Mocking 3-second delay or processing time inside client if needed,
        // here we return immediately with a premium structured response
        const confidence = Math.round(92 + Math.random() * 7);
        const quantityEstimate = Math.round(30 + Math.random() * 20);
        return res.json({
            category: 'Prepared Hot Meal (Curry & Rice)',
            quantityEstimate,
            spoilageIndicators: 'None Detected',
            qualityVerified: true,
            confidence,
            freshnessScore: 96,
            safeConsumptionWindow: '5 Hours'
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'AI Image Verification error' });
    }
};
exports.verifyImage = verifyImage;
// 3. Smart NGO Matching
const getSmartMatch = async (req, res) => {
    try {
        const { quantity, category } = req.query;
        const qty = parseInt(quantity) || 30;
        // Fetch active NGOs
        const ngos = await db_1.default.ngo.findMany({
            include: {
                user: true
            }
        });
        // Mock ranking details based on distance from Ramanuja Circle
        const matchedNgos = ngos.map((ngo) => {
            let score = 90;
            let distance = 1.2; // km
            let capacity = 100; // default capacity
            if (ngo.name.includes('Hope')) {
                distance = 1.8;
                capacity = 80;
                score = qty <= capacity ? 98 : 82;
            }
            else {
                distance = 3.5;
                capacity = 150;
                score = 88;
            }
            return {
                id: ngo.id,
                name: ngo.name,
                contactPerson: ngo.contactPerson,
                mobile: ngo.mobile,
                address: ngo.address,
                distance,
                capacity,
                matchScore: score,
                urgencyLevel: qty > 40 ? 'HIGH' : 'MEDIUM'
            };
        }).sort((a, b) => b.matchScore - a.matchScore);
        return res.json({ matches: matchedNgos });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching smart NGO matches' });
    }
};
exports.getSmartMatch = getSmartMatch;
// 4. Waste Analytics for Hotels
const getWasteAnalytics = async (req, res) => {
    try {
        // Return mock historical waste data for analytics graphs
        const costLoss = 12500;
        const peakDays = ['Friday', 'Saturday'];
        const items = [
            { name: 'Basmati Rice', value: 40 },
            { name: 'Veg Curry', value: 30 },
            { name: 'Roti / Naan', value: 20 },
            { name: 'Desserts', value: 10 }
        ];
        const weeklyTrends = [
            { day: 'Mon', qty: 12 },
            { day: 'Tue', qty: 15 },
            { day: 'Wed', qty: 18 },
            { day: 'Thu', qty: 14 },
            { day: 'Fri', qty: 35 },
            { day: 'Sat', qty: 42 },
            { day: 'Sun', qty: 28 }
        ];
        return res.json({
            costLoss,
            peakDays,
            items,
            weeklyTrends,
            recommendations: [
                'Reduce raw rice buffering by 15% on Friday banquets.',
                'Repurpose pastry buffer stocks for afternoon corporate deliveries.'
            ]
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error loading waste analytics' });
    }
};
exports.getWasteAnalytics = getWasteAnalytics;
// 5. Donor Leaderboard and Gamification
const getLeaderboard = async (req, res) => {
    try {
        // Fetch organization donors and volunteers
        const orgs = await db_1.default.organization.findMany({
            include: {
                donations: {
                    select: { quantity: true, status: true }
                }
            }
        });
        const volunteers = await db_1.default.volunteer.findMany({
            include: {
                assignments: {
                    select: { status: true }
                }
            }
        });
        // Score Orgs: 10 points per meal successfully verified
        const donorRankings = orgs.map((o) => {
            const totalMeals = o.donations
                .filter((d) => d.status === 'VERIFIED' || d.status === 'DELIVERED')
                .reduce((sum, d) => sum + d.quantity, 0);
            const points = totalMeals * 10;
            let badge = 'Gold Donor 🏆';
            if (points < 200)
                badge = 'Gold Donor 🏆';
            if (points >= 500)
                badge = 'Gold Donor 🏆';
            return {
                id: o.id,
                name: o.name,
                meals: totalMeals || 20, // default dummy fallback if database is fresh
                points: points || 200,
                badge
            };
        }).sort((a, b) => b.points - a.points);
        // Score Volunteers: 50 points per delivery completed
        const volunteerRankings = volunteers.map((v) => {
            const completed = v.assignments.filter((a) => a.status === 'DELIVERED' || a.status === 'VERIFIED').length;
            const points = completed * 50;
            let badge = 'Food Hero 🚴';
            if (completed >= 5)
                badge = 'Hunger Fighter 🌟';
            return {
                id: v.id,
                name: v.fullName,
                deliveries: completed || 3, // fallback
                points: points || 150,
                badge
            };
        }).sort((a, b) => b.points - a.points);
        return res.json({
            donors: donorRankings,
            volunteers: volunteerRankings
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching leaderboard stats' });
    }
};
exports.getLeaderboard = getLeaderboard;
// 6. Emergency NGO Requests
const createEmergencyRequest = async (req, res) => {
    try {
        const { mealsRequired, location, foodType, deadline, priorityLevel } = req.body;
        const reqUser = req.user;
        const ngo = await db_1.default.ngo.findUnique({ where: { userId: reqUser.id } });
        if (!ngo) {
            return res.status(403).json({ message: 'Only NGO accounts can submit emergency food requests' });
        }
        const emergency = await db_1.default.emergencyRequest.create({
            data: {
                ngoId: ngo.id,
                mealsRequired: parseInt(mealsRequired),
                location,
                foodType,
                deadline,
                status: 'PENDING',
                priorityLevel: priorityLevel || 'MEDIUM'
            }
        });
        // Notify all nearby donors in Tirupati (mock in-app notification)
        const donors = await db_1.default.user.findMany({
            where: {
                role: { in: ['ORGANIZATION_DONOR', 'INDIVIDUAL_DONOR'] }
            }
        });
        for (const donor of donors) {
            await db_1.default.notification.create({
                data: {
                    userId: donor.id,
                    title: '🚨 URGENT EMERGENCY FOOD REQUEST 🚨',
                    message: `${ngo.name} urgently requires ${mealsRequired} ${foodType} meals at ${location} by ${deadline}!`,
                    type: 'DONATION_REQUEST'
                }
            });
        }
        return res.status(201).json({ message: 'Emergency request posted successfully', emergency });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to create emergency request' });
    }
};
exports.createEmergencyRequest = createEmergencyRequest;
const getEmergencyRequests = async (req, res) => {
    try {
        const requests = await db_1.default.emergencyRequest.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // Map NGO names to requests
        const ngos = await db_1.default.ngo.findMany();
        const mapped = requests.map((r) => {
            const ngo = ngos.find((n) => n.id === r.ngoId);
            return {
                ...r,
                ngoName: ngo ? ngo.name : 'Unknown NGO',
                ngoMobile: ngo ? ngo.mobile : ''
            };
        });
        return res.json({ requests: mapped });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error retrieving emergency requests' });
    }
};
exports.getEmergencyRequests = getEmergencyRequests;
// 7. Hunger Heatmap coordinates in Tirupati
const getHungerHeatmap = async (req, res) => {
    try {
        // Static coordinate density mapping for hotspots in Tirupati
        // Format: [lat, lng, intensity (0.0 to 1.0)]
        const heatData = [
            // Hunger Hotspots (Demand)
            [13.6280, 79.4160, 0.9], // Tirupati Railway Station (High density)
            [13.6180, 79.4440, 0.7], // Renigunta Road Slum Area
            [13.6330, 79.4320, 0.85], // Korlagunta
            [13.6373, 79.4032, 0.4], // RUIA hospital shelter area
            // Donation Hotspots (Supply)
            [13.6231, 79.4292, 0.95], // Ramanuja Circle (Busiest hotel district)
            [13.6278, 79.4029, 0.6], // SV University Canteen/Mess
            [13.6490, 79.4100, 0.5], // Leela Mahal Center
            [13.6500, 79.4010, 0.7] // Alipiri Checkpost Gate
        ];
        return res.json({ heatmap: heatData });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error loading hunger heatmap' });
    }
};
exports.getHungerHeatmap = getHungerHeatmap;
// Global state for Disaster Relief Mode (simulated in-memory)
let disasterMode = false;
// Toggle Disaster Mode
const toggleDisasterMode = async (req, res) => {
    try {
        const { active } = req.body;
        disasterMode = !!active;
        return res.json({ success: true, disasterMode });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error toggling disaster mode' });
    }
};
exports.toggleDisasterMode = toggleDisasterMode;
const getDisasterStatus = async (req, res) => {
    return res.json({ disasterMode });
};
exports.getDisasterStatus = getDisasterStatus;
// 1. Smart Donation Scheduler
const createSchedule = async (req, res) => {
    try {
        const { frequency, dayOfWeek, pickupTime, foodName, category, quantity } = req.body;
        const reqUser = req.user;
        const schedule = await db_1.default.donationSchedule.create({
            data: {
                donorId: reqUser.id,
                frequency,
                dayOfWeek,
                pickupTime,
                foodName,
                category,
                quantity: parseInt(quantity) || 10,
                active: true
            }
        });
        return res.status(201).json({ schedule });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating schedule' });
    }
};
exports.createSchedule = createSchedule;
const getSchedules = async (req, res) => {
    try {
        const reqUser = req.user;
        const schedules = await db_1.default.donationSchedule.findMany({
            where: { donorId: reqUser.id }
        });
        return res.json({ schedules });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error loading schedules' });
    }
};
exports.getSchedules = getSchedules;
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.default.donationSchedule.delete({ where: { id } });
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error deleting schedule' });
    }
};
exports.deleteSchedule = deleteSchedule;
// 4. Community Fridge Network
const getFridges = async (req, res) => {
    try {
        const fridges = await db_1.default.communityFridge.findMany();
        return res.json({ fridges });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error loading community fridges' });
    }
};
exports.getFridges = getFridges;
const refillFridge = async (req, res) => {
    try {
        const { id } = req.params;
        const { mealsToAdd } = req.body;
        const fridge = await db_1.default.communityFridge.findUnique({ where: { id } });
        if (!fridge)
            return res.status(404).json({ message: 'Community fridge not found' });
        const updated = await db_1.default.communityFridge.update({
            where: { id },
            data: {
                currentMeals: Math.min(fridge.capacity, fridge.currentMeals + parseInt(mealsToAdd)),
                lastRefillTime: new Date()
            }
        });
        return res.json({ fridge: updated });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error refilling fridge' });
    }
};
exports.refillFridge = refillFridge;
// 5. Nutrition Analysis System
const analyzeNutrition = async (req, res) => {
    try {
        const { foodItems } = req.body;
        let calories = 300;
        let protein = 12;
        let carbs = 40;
        let fat = 8;
        let score = 80;
        const lower = (foodItems || '').toLowerCase();
        if (lower.includes('biryani') || lower.includes('meat') || lower.includes('chicken')) {
            calories = 650;
            protein = 28;
            carbs = 70;
            fat = 22;
            score = 75;
        }
        else if (lower.includes('salad') || lower.includes('fruit') || lower.includes('veg')) {
            calories = 120;
            protein = 4;
            carbs = 20;
            fat = 2;
            score = 95;
        }
        else if (lower.includes('roti') || lower.includes('naan') || lower.includes('bread')) {
            calories = 240;
            protein = 7;
            carbs = 45;
            fat = 3;
            score = 82;
        }
        return res.json({ calories, protein, carbs, fat, nutritionScore: score });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error running nutrition calculations' });
    }
};
exports.analyzeNutrition = analyzeNutrition;
// 7. AI Chatbot Assistant
const askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        const query = (message || '').toLowerCase();
        let reply = "I am the FoodBridge Smart AI. How can I help you support our zero-hunger initiatives today?";
        if (query.includes('how') && (query.includes('work') || query.includes('donate'))) {
            reply = "It's simple! 1. Donors post surplus food listings with photo uploads. 2. Our smart algorithms match food with nearby approved NGOs. 3. Volunteers get assigned optimized paths to deliver meals to shelters and hospitals.";
        }
        else if (query.includes('impact') || query.includes('stat') || query.includes('meals')) {
            reply = "FoodBridge partners have rescued over 15,000 meals in Tirupati, saving an estimated 850kg of raw ingredient waste and reducing carbon footprints by over 320kg of CO₂ equivalents!";
        }
        else if (query.includes('volunteer') || query.includes('badge') || query.includes('rider')) {
            reply = "Volunteers earn achievement points for completing deliveries! You can achieve rankings from 'Food Hero' up to 'Platinum Volunteer' which unlock community leader badges!";
        }
        else if (query.includes('tirupati') || query.includes('location') || query.includes('hotel')) {
            reply = "Our main operational hub is Tirupati, AP. Predefined hotels seed from Ramanuja Circle, and we coordinate distributions at RUIA Hospital, SVIMS, and Korlagunta shelters daily.";
        }
        return res.json({ reply });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error loading chatbot response' });
    }
};
exports.askChatbot = askChatbot;
// 10. Volunteer Achievement metrics
const getVolunteerAchievements = async (req, res) => {
    try {
        const reqUser = req.user;
        const volunteer = await db_1.default.volunteer.findUnique({ where: { userId: reqUser.id } });
        if (!volunteer)
            return res.status(404).json({ message: 'Volunteer profile not found' });
        let achievement = await db_1.default.volunteerAchievement.findUnique({
            where: { volunteerId: volunteer.id }
        });
        if (!achievement) {
            achievement = await db_1.default.volunteerAchievement.create({
                data: {
                    volunteerId: volunteer.id,
                    deliveries: 4,
                    distance: 14.5,
                    hours: 9.0,
                    points: 200,
                    badges: JSON.stringify(['Food Hero', 'Hunger Fighter'])
                }
            });
        }
        return res.json({
            achievement: {
                ...achievement,
                badges: JSON.parse(achievement.badges)
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error retrieving volunteer stats' });
    }
};
exports.getVolunteerAchievements = getVolunteerAchievements;
// 11. Referrals Program
const createReferral = async (req, res) => {
    try {
        const { referredEmail, role } = req.body;
        const reqUser = req.user;
        const referral = await db_1.default.referral.create({
            data: {
                referrerId: reqUser.id,
                referredEmail,
                role,
                status: 'PENDING',
                rewardPoints: 50
            }
        });
        return res.status(201).json({ referral });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating referral' });
    }
};
exports.createReferral = createReferral;
const getReferrals = async (req, res) => {
    try {
        const reqUser = req.user;
        const referrals = await db_1.default.referral.findMany({
            where: { referrerId: reqUser.id }
        });
        return res.json({ referrals });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error loading referrals' });
    }
};
exports.getReferrals = getReferrals;
// 20. Cold Chain Storage
const getColdStorages = async (req, res) => {
    try {
        const storages = await db_1.default.coldStorage.findMany();
        return res.json({ storages });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error retrieving storage logs' });
    }
};
exports.getColdStorages = getColdStorages;
// 14. CSR Report
const exportCsrReport = async (req, res) => {
    try {
        const reqUser = req.user;
        const org = await db_1.default.organization.findUnique({ where: { userId: reqUser.id } });
        if (!org)
            return res.status(403).json({ message: 'Only hotels/organizations can request CSR reports' });
        const donations = await db_1.default.donation.findMany({
            where: { orgDonorId: org.id, status: 'VERIFIED' }
        });
        const totalMeals = donations.reduce((sum, d) => sum + d.quantity, 0);
        const wastePreventedKg = totalMeals * 0.45;
        const co2ReducedKg = totalMeals * 1.8;
        return res.json({
            orgName: org.name,
            address: org.address,
            reportingPeriod: 'Year to Date (2026)',
            metrics: {
                totalDonations: donations.length || 6,
                mealsRescued: totalMeals || 240,
                wastePreventedKg: wastePreventedKg || 108.0,
                co2SavedKg: co2ReducedKg || 432.0,
                sustainabilityScore: 'A+ Gold Champion'
            },
            stamp: 'FoodBridge CSR Verified A+ Audit Token'
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'CSR Generation failed' });
    }
};
exports.exportCsrReport = exportCsrReport;
