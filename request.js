const mongoose = require('mongoose');

/**
 * Request schema
 * Represents a single healthcare support request submitted through the
 * CareConnect form. Intentionally avoids collecting detailed medical
 * history — only what is needed to route the request.
 */
const requestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    supportType: {
      type: String,
      required: true,
      enum: [
        'Medical Assistance',
        'Medicine Support',
        'Mental Health Support',
        'Emergency Assistance',
        'Other'
      ]
    },
    description: { type: String, required: true, trim: true, minlength: 10 },
    contactMethod: {
      type: String,
      required: true,
      enum: ['Phone Call', 'Email', 'SMS / Text', 'WhatsApp']
    },
    priority: {
      type: String,
      required: true,
      enum: ['High', 'Medium', 'Low']
    },
    status: {
      type: String,
      default: 'Received',
      enum: ['Received', 'In Progress', 'Resolved']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);