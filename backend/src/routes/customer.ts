import { RequestHandler } from "express";
import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import Booking from '../models/Booking';
import User from '../models/User';
import AgentProfile from '../models/AgentProfile';
import Review from '../models/Review';
import Complaint from '../models/Complaint';

const router = Router();

// All customer routes require authentication
router.use(authenticate as any, requireRole('customer') as any);

// GET /api/customer/dashboard
router.get('/dashboard', async (req: any, res: any) => {
  try {
    const userId = req.user!._id;
    const bookings = await Booking.find({ customerId: userId });

    const active = bookings.filter((b) => b.status === 'in-progress' || b.status === 'approved').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const totalSpent = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.amount, 0);

    const recentBookings = await Booking.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('agentId', 'fullName');

    res.json({
      stats: { active, completed, pending, totalSpent },
      recentBookings,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load dashboard', error: error.message });
  }
});

// GET /api/customer/bookings
router.get('/bookings', async (req: any, res: any) => {
  try {
    const bookings = await Booking.find({ customerId: req.user!._id })
      .sort({ createdAt: -1 })
      .populate('agentId', 'fullName');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load bookings', error: error.message });
  }
});

// POST /api/customer/bookings
router.post('/bookings', async (req: any, res: any) => {
  try {
    const { serviceType, variant, date, isEmergency, address, estimateAmount } = req.body;

    // Use the frontend estimate if provided (this is what the user was shown),
    // otherwise fall back to a basic rate calculation.
    let amount: number;
    if (typeof estimateAmount === 'number' && estimateAmount > 0) {
      amount = Math.round(estimateAmount);
    } else {
      let baseAmount = 150;
      if (variant === 'Deep Cleaning') baseAmount = 250;
      if (variant === 'Emergency') baseAmount = 450;
      if (serviceType === 'Office Cleaning') baseAmount *= 1.2;
      if (serviceType === 'Commercial Cleaning') baseAmount *= 1.8;
      if (isEmergency) baseAmount *= 1.5;
      amount = Math.round(baseAmount);
    }

    const booking = await Booking.create({
      serviceType,
      variant,
      date: new Date(date),
      amount,
      customerId: req.user!._id,
      isEmergency: isEmergency || false,
      address: address || req.user!.address,
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
});

// GET /api/customer/bookings/:id/tracking
router.get('/bookings/:id/tracking', async (req: any, res: any) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user!._id,
    }).populate('agentId', 'fullName');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const statusOrder = ['pending', 'approved', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(booking.status);

    const steps = statusOrder.map((status, i) => ({
      label: status === 'in-progress' ? 'In Progress' :
             status.charAt(0).toUpperCase() + status.slice(1),
      status: i < currentIndex ? 'done' as const :
              i === currentIndex ? 'current' as const :
              'upcoming' as const,
    }));

    res.json({ booking, steps });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load tracking', error: error.message });
  }
});

// GET /api/customer/agents/nearby
router.get('/agents/nearby', async (req: any, res: any) => {
  try {
    const queryLat = parseFloat(req.query.lat as string);
    const queryLng = parseFloat(req.query.lng as string);
    const maxDistanceMeters = parseInt(req.query.distance as string, 10) || 10000;
    const minRating = Math.max(0, Math.min(5, parseFloat(req.query.minRating as string) || 0));

    const customer = await User.findById(req.user!._id).select('location');
    const storedCoords = customer?.location?.coordinates || [0, 0];
    const hasStoredCoords = Array.isArray(storedCoords) && (storedCoords[0] !== 0 || storedCoords[1] !== 0);

    const lat = !isNaN(queryLat) ? queryLat : hasStoredCoords ? storedCoords[1] : NaN;
    const lng = !isNaN(queryLng) ? queryLng : hasStoredCoords ? storedCoords[0] : NaN;
    const hasSearchCoords = !isNaN(lat) && !isNaN(lng);

    const toRadians = (value: number) => (value * Math.PI) / 180;
    const distanceKmBetween = (
      fromLat: number,
      fromLng: number,
      toLat: number,
      toLng: number
    ) => {
      const earthRadiusKm = 6371;
      const dLat = toRadians(toLat - fromLat);
      const dLng = toRadians(toLng - fromLng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return earthRadiusKm * c;
    };

    const userQuery: any = { role: 'agent' };
    if (hasSearchCoords) {
      userQuery.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistanceMeters,
        },
      };
    }

    const nearbyUsers = await User.find(userQuery).select('fullName avatar address location');
    const userIds = nearbyUsers.map((u) => u._id);

    const profiles = await AgentProfile.find({
      userId: { $in: userIds },
      available: true,
      rating: { $gte: minRating },
    });

    const userMap = new Map(nearbyUsers.map((u) => [u._id.toString(), u]));

    const formattedAgents = profiles
      .map((profile) => {
        const user = userMap.get(profile.userId.toString()) as any;
        if (!user) return null;

        const userCoords = user.location?.coordinates || [0, 0];
        const hasUserCoords = Array.isArray(userCoords) && (userCoords[0] !== 0 || userCoords[1] !== 0);

        const distanceKm = hasSearchCoords && hasUserCoords
          ? distanceKmBetween(lat, lng, userCoords[1], userCoords[0])
          : null;

        return {
          id: profile._id,
          userId: user._id,
          name: user.fullName,
          avatar: user.avatar,
          rating: profile.rating,
          available: profile.available,
          specialization: profile.specialization,
          completedJobs: profile.completedJobs,
          location: user.location,
          address: user.address,
          distanceKm,
        };
      })
      .filter(Boolean) as any[];

    formattedAgents.sort((a, b) => {
      if (hasSearchCoords) {
        const aDist = typeof a.distanceKm === 'number' ? a.distanceKm : Number.MAX_SAFE_INTEGER;
        const bDist = typeof b.distanceKm === 'number' ? b.distanceKm : Number.MAX_SAFE_INTEGER;

        if (Math.abs(aDist - bDist) > 0.75) {
          return aDist - bDist;
        }
      }

      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }

      return b.completedJobs - a.completedJobs;
    });

    res.json({
      agents: formattedAgents,
      searchCenter: hasSearchCoords ? { lat, lng } : null,
      distanceMeters: maxDistanceMeters,
      minRating,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load agents', error: error.message });
  }
});

// POST /api/customer/reviews
router.post('/reviews', async (req: any, res: any) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId) {
      res.status(400).json({ message: 'Booking ID is required' });
      return;
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5' });
      return;
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user!._id,
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.status !== 'completed') {
      res.status(400).json({ message: 'You can only review completed bookings' });
      return;
    }

    if (!booking.agentId) {
      res.status(400).json({ message: 'Booking has no assigned agent to review' });
      return;
    }

    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) {
      res.status(409).json({ message: 'Review already submitted for this booking' });
      return;
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId: req.user!._id,
      agentId: booking.agentId,
      rating: numericRating,
      comment: typeof comment === 'string' ? comment.trim() : '',
    });

    // Update agent average rating from all submitted reviews.
    const reviews = await Review.find({ agentId: booking.agentId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await AgentProfile.findOneAndUpdate(
      { userId: booking.agentId },
      { rating: Math.round(avgRating * 10) / 10 }
    );

    res.status(201).json({ message: 'Review submitted', review });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
});

// GET /api/customer/complaints
router.get('/complaints', async (req: any, res: any) => {
  try {
    const complaints = await Complaint.find({ userId: req.user!._id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load complaints', error: error.message });
  }
});

// POST /api/customer/complaints
router.post('/complaints', async (req: any, res: any) => {
  try {
    const { subject, description } = req.body;
    const complaint = await Complaint.create({
      subject,
      description,
      userId: req.user!._id,
    });
    res.status(201).json({ message: 'Complaint submitted', complaint });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to submit complaint', error: error.message });
  }
});

// GET /api/customer/estimate
router.get('/estimate', async (req: any, res: any) => {
  try {
    const area = parseFloat(req.query.area as string) || 0;
    const serviceType = (req.query.serviceType as string) || 'House Cleaning';
    const variant = (req.query.variant as string) || 'Standard';

    let rate = 18; // Base rate per sq ft
    if (variant === 'Deep Cleaning') rate = 25;
    if (variant === 'Emergency') rate = 35;
    if (serviceType === 'Office Cleaning') rate *= 1.2;
    if (serviceType === 'Commercial Cleaning') rate *= 1.5;

    const estimate = Math.round(area * rate);
    res.json({ area, rate, estimate, serviceType, variant });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to calculate estimate', error: error.message });
  }
});

// GET /api/customer/agents/:id/profile - Get agent profile with portfolio and reviews
router.get('/agents/:id/profile', async (req: any, res: any) => {
  try {
    const requestedId = req.params.id;
    let agentProfile = await AgentProfile.findById(requestedId);

    // Allow lookup by agent user ID as well as profile ID.
    if (!agentProfile) {
      agentProfile = await AgentProfile.findOne({ userId: requestedId });
    }

    if (!agentProfile) {
      res.status(404).json({ message: 'Agent profile not found' });
      return;
    }

    const user = await User.findById(agentProfile.userId).select('fullName avatar address phone');
    if (!user) {
      res.status(404).json({ message: 'Agent user not found' });
      return;
    }

    // Get reviews for this agent
    const reviews = await Review.find({ agentId: agentProfile.userId })
      .populate('customerId', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      profile: {
        id: agentProfile._id,
        userId: agentProfile.userId,
        name: user.fullName,
        avatar: user.avatar,
        address: user.address,
        phone: user.phone,
        specialization: agentProfile.specialization,
        rating: agentProfile.rating,
        completedJobs: agentProfile.completedJobs,
        available: agentProfile.available,
        portfolioImages: agentProfile.portfolioImages,
      },
      reviews: reviews.map((r: any) => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        customerName: r.customerId?.fullName || 'Anonymous',
        customerAvatar: r.customerId?.avatar,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load agent profile', error: error.message });
  }
});

// GET /api/customer/bookings/:id/review-status - Check if booking has been reviewed
router.get('/bookings/:id/review-status', async (req: any, res: any) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user!._id,
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const existingReview = await Review.findOne({ bookingId: req.params.id });

    res.json({
      bookingId: req.params.id,
      hasReview: !!existingReview,
      canReview: booking.status === 'completed' && !existingReview,
      agentId: booking.agentId,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to check review status', error: error.message });
  }
});

export default router;
