const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['INITIATED', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'INITIATED'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['khalti', 'esewa', 'cash', 'bank_transfer', 'other']
  },
  transactionId: {
    type: String,
    sparse: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  reservationType: {
    type: String,
    enum: ['tour', 'hotel', 'vehicle', 'activity', 'other'],
    default: 'other'
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reservationType',
    required: false
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Create indexes for faster queries
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentMethod: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ 'metadata.pidx': 1 });
PaymentSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Payment', PaymentSchema); 