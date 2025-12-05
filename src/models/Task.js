import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxlength: 2000
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'review', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['lawn-mowing', 'tree-trimming', 'landscaping', 'irrigation', 'pest-control', 'other'],
    default: 'other'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 2
  },
  actualDuration: {
    type: Number, // in hours
    default: 0
  },
  // GPS Tracking
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  startLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timestamp: Date
  },
  endLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timestamp: Date
  },
  // Images (up to 50 images each)
  images: {
    before: [{
      url: String,
      thumbnail: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isVisibleToClient: {
        type: Boolean,
        default: false
      }
    }],
    after: [{
      url: String,
      thumbnail: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isVisibleToClient: {
        type: Boolean,
        default: false
      }
    }],
    reference: [{
      url: String,
      thumbnail: String,
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Plants used in this task
  plants: [{
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant'
    },
    quantity: {
      type: Number,
      default: 1
    },
    notes: String
  }],
  // Materials
  materials: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    name: String,
    quantity: Number,
    unit: String,
    confirmed: {
      type: Boolean,
      default: false
    },
    confirmedAt: Date,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Cost
  cost: {
    labor: {
      type: Number,
      default: 0
    },
    materials: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  // Timeline
  startedAt: Date,
  completedAt: Date,
  // Admin Review
  adminReview: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  // Client Feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  client: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Client',
  required: true
},

site: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Site',
  required: true
},

section: {
  type: mongoose.Schema.Types.ObjectId,
  default: null
},

  // Invoice
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ client: 1, status: 1 });
taskSchema.index({ worker: 1, status: 1 });
taskSchema.index({ branch: 1, status: 1 });
taskSchema.index({ scheduledDate: 1 });
taskSchema.index({ status: 1, priority: 1 });

// Calculate actual duration when task is completed
taskSchema.pre('save', function(next) {
  if (this.startedAt && this.completedAt) {
    const duration = (this.completedAt - this.startedAt) / (1000 * 60 * 60); // hours
    this.actualDuration = Math.round(duration * 100) / 100;
  }
  
  // Calculate total cost
  this.cost.total = this.cost.labor + this.cost.materials;
  
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task;

