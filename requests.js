const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

/**
 * Simple rule-based priority categorization (concept only, not medical advice).
 * Mirrors the frontend logic in script.js so priority is consistent whether
 * a request is saved via localStorage (frontend-only mode) or via this API.
 */
function determinePriority(supportType, description) {
  const text = (description || '').toLowerCase();
  const urgentKeywords = [
    'severe', 'urgent', 'emergency', 'unconscious', 'bleeding',
    "can't breathe", 'cannot breathe', 'chest pain'
  ];

  if (supportType === 'Emergency Assistance') return 'High';
  if (urgentKeywords.some((k) => text.includes(k))) return 'High';

  if (['Medical Assistance', 'Medicine Support', 'Mental Health Support'].includes(supportType)) {
    return 'Medium';
  }

  return 'Low';
}

function generateRequestId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CC-${random}`;
}

/**
 * POST /api/requests
 * Create a new healthcare support request.
 */
router.post('/', async (req, res) => {
  try {
    const {
      fullName, age, email, phone, location,
      supportType, description, contactMethod
    } = req.body;

    // Basic server-side validation (never trust client-side validation alone)
    const missing = [];
    if (!fullName) missing.push('fullName');
    if (age === undefined || age === null || age === '') missing.push('age');
    if (!email) missing.push('email');
    if (!phone) missing.push('phone');
    if (!location) missing.push('location');
    if (!supportType) missing.push('supportType');
    if (!description || description.trim().length < 10) missing.push('description');
    if (!contactMethod) missing.push('contactMethod');

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        missingFields: missing
      });
    }

    const priority = determinePriority(supportType, description);

    // Retry on the (extremely unlikely) chance of a requestId collision
    let saved = null;
    for (let attempt = 0; attempt < 5 && !saved; attempt++) {
      try {
        saved = await Request.create({
          requestId: generateRequestId(),
          fullName,
          age,
          email,
          phone,
          location,
          supportType,
          description,
          contactMethod,
          priority,
          status: 'Received'
        });
      } catch (err) {
        if (err.code === 11000 && attempt < 4) continue; // duplicate requestId, retry
        throw err;
      }
    }

    return res.status(201).json({
      message: 'Request received successfully',
      data: saved
    });
  } catch (err) {
    console.error('Error creating request:', err.message);
    return res.status(500).json({ error: 'Something went wrong while saving your request.' });
  }
});

/**
 * GET /api/requests
 * List all healthcare support requests (most recent first).
 * In a real deployment this would be protected by NGO admin authentication.
 */
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ count: requests.length, data: requests });
  } catch (err) {
    console.error('Error fetching requests:', err.message);
    return res.status(500).json({ error: 'Something went wrong while fetching requests.' });
  }
});

/**
 * GET /api/requests/:requestId
 * Fetch a single request by its generated Request ID (e.g. CC-123456).
 */
router.get('/:requestId', async (req, res) => {
  try {
    const request = await Request.findOne({ requestId: req.params.requestId });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    return res.json({ data: request });
  } catch (err) {
    console.error('Error fetching request:', err.message);
    return res.status(500).json({ error: 'Something went wrong while fetching the request.' });
  }
});

module.exports = router;