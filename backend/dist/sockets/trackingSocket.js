"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTrackingSocket = void 0;
const initTrackingSocket = (io) => {
    console.log('Socket.IO tracking system initialized.');
    io.on('connection', (socket) => {
        console.log(`Socket client connected: ${socket.id}`);
        // Join room for specific delivery tracking
        socket.on('join-delivery', (assignmentId) => {
            socket.join(assignmentId);
            console.log(`Client ${socket.id} joined tracking room: ${assignmentId}`);
        });
        // Leave tracking room
        socket.on('leave-delivery', (assignmentId) => {
            socket.leave(assignmentId);
            console.log(`Client ${socket.id} left tracking room: ${assignmentId}`);
        });
        // Join role-based room (NGO, ADMIN, VOLUNTEER, DONOR)
        socket.on('join-role', (role) => {
            socket.join(role.toUpperCase());
            console.log(`Client ${socket.id} joined role room: ${role.toUpperCase()}`);
        });
        // Volunteer sends live location update
        socket.on('volunteer-location-update', (data) => {
            const { assignmentId, latitude, longitude } = data;
            // Broadcast location to all clients tracking this delivery (NGO, Donor, Admin)
            io.to(assignmentId).emit('location-changed', {
                assignmentId,
                latitude,
                longitude,
                timestamp: new Date(),
            });
            // Also broadcast to admin and NGO rooms
            io.to('ADMIN').emit('admin-location-refresh', data);
            io.to('NGO').emit('ngo-location-refresh', data);
        });
        // Volunteer updates assignment status
        socket.on('delivery-status-changed', (data) => {
            const { assignmentId, status } = data;
            // Broadcast to specific delivery tracking room
            io.to(assignmentId).emit('status-refreshed', data);
            // Notify role rooms
            io.to('NGO').emit('notification-received', {
                title: 'Delivery Progress Update',
                message: data.message,
                type: 'STATUS_UPDATE',
                createdAt: new Date(),
            });
            io.to('ADMIN').emit('notification-received', {
                title: 'Delivery Progress Update',
                message: data.message,
                type: 'STATUS_UPDATE',
                createdAt: new Date(),
            });
        });
        // Donor creates new donation
        socket.on('new-donation-created', (data) => {
            // Notify all NGOs and Admins
            io.to('NGO').emit('notification-received', {
                title: 'New Food Donation Available!',
                message: `${data.quantity} meals of "${data.foodName}" ready at ${data.pickupAddress}.`,
                type: 'DONATION_REQUEST',
                donationId: data.donationId,
                createdAt: new Date(),
            });
            io.to('ADMIN').emit('notification-received', {
                title: 'New Donation Created',
                message: `New donation of ${data.quantity} meals of "${data.foodName}" created.`,
                type: 'DONATION_REQUEST',
                donationId: data.donationId,
                createdAt: new Date(),
            });
        });
        socket.on('disconnect', () => {
            console.log(`Socket client disconnected: ${socket.id}`);
        });
    });
};
exports.initTrackingSocket = initTrackingSocket;
