import { RequestHandler } from "express";
import { Router, Response } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import AgentProfile from '../models/AgentProfile';

const router = Router();

router.use(authenticate as any);

const reverseGeocodeWithNominatim = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'jsonv2',
        lat,
        lon: lng,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'CleanMate/1.0 (support@cleanmate.local)',
      },
      timeout: 8000,
    });

    const displayName = response.data?.display_name;
    if (typeof displayName === 'string' && displayName.trim()) {
      return displayName;
    }
    return null;
  } catch {
    return null;
  }
};

// POST /api/maps/geocode
router.post('/geocode', async (req: any, res: any) => {
  try {
    const { address } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'your_google_maps_api_key') {
      // Fallback: return mock coordinates for development
      const mockCoords: Record<string, [number, number]> = {
        default: [12.9716, 77.5946], // Bangalore
      };
      res.json({
        lat: mockCoords.default[0],
        lng: mockCoords.default[1],
        formatted_address: address,
        source: 'mock',
      });
      return;
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (response.data.results.length === 0) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    const formatted_address = response.data.results[0].formatted_address;

    // Update user's location
    await User.findByIdAndUpdate(req.user!._id, {
      location: { type: 'Point', coordinates: [lng, lat] },
    });

    res.json({ lat, lng, formatted_address, source: 'google' });
  } catch (error: any) {
    res.status(500).json({ message: 'Geocoding failed', error: error.message });
  }
});

// GET /api/maps/reverse-geocode
router.get('/reverse-geocode', async (req: any, res: any) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ message: 'Invalid coordinates' });
      return;
    }

    const fallbackCoordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    if (!apiKey || apiKey === 'your_google_maps_api_key') {
      const nominatimAddress = await reverseGeocodeWithNominatim(lat, lng);
      if (nominatimAddress) {
        res.json({ formatted_address: nominatimAddress, source: 'nominatim' });
        return;
      }

      res.json({ formatted_address: fallbackCoordinates, source: 'fallback' });
      return;
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    const status = response.data?.status;
    const results = response.data?.results || [];

    if (status !== 'OK' || results.length === 0) {
      // Graceful fallback so booking flow still works when provider quota/key fails.
      const nominatimAddress = await reverseGeocodeWithNominatim(lat, lng);
      if (nominatimAddress) {
        res.json({ formatted_address: nominatimAddress, source: 'nominatim' });
        return;
      }

      res.json({ formatted_address: fallbackCoordinates, source: 'fallback' });
      return;
    }

    const formatted_address = results[0].formatted_address;
    res.json({ formatted_address, source: 'google' });
  } catch (error: any) {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    if (!isNaN(lat) && !isNaN(lng)) {
      const nominatimAddress = await reverseGeocodeWithNominatim(lat, lng);
      if (nominatimAddress) {
        res.json({ formatted_address: nominatimAddress, source: 'nominatim' });
        return;
      }

      res.json({ formatted_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, source: 'fallback' });
      return;
    }

    res.status(500).json({ message: 'Reverse geocoding failed', error: error.message });
  }
});

// GET /api/maps/nearby-agents
router.get('/nearby-agents', async (req: any, res: any) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const maxDistance = parseInt(req.query.distance as string) || 10000; // 10km default

    let agents;

    if (!isNaN(lat) && !isNaN(lng)) {
      // Find users near the coordinates
      const nearbyUsers = await User.find({
        role: 'agent',
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistance,
          },
        },
      });

      const userIds = nearbyUsers.map((u) => u._id);
      agents = await AgentProfile.find({ userId: { $in: userIds }, available: true })
        .populate('userId', 'fullName avatar address location');
    } else {
      // Return all available agents if no coordinates
      agents = await AgentProfile.find({ available: true })
        .populate('userId', 'fullName avatar address location');
    }

    const result = agents.map((a) => {
      const user = a.userId as any;
      return {
        id: a._id,
        name: user.fullName,
        avatar: user.avatar,
        rating: a.rating,
        available: a.available,
        specialization: a.specialization,
        completedJobs: a.completedJobs,
        location: user.location,
        address: user.address,
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to find nearby agents', error: error.message });
  }
});

export default router;
