const mongoose = require('mongoose');

const BotStatSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  servers: {
    type: Number,
    required: true
  },
  users: {
    type: Number,
    required: true
  },
  uptime: {
    type: Number, // In seconds
    required: true
  },
  version: {
    type: String,
    required: true
  },
  commands_used: {
    type: Number,
    default: 0
  },
  top_commands: [{
    name: String,
    uses: Number
  }],
  messages_processed: {
    type: Number,
    default: 0
  },
  memory_usage: {
    type: String
  },
  cpu_usage: {
    type: String
  },
  ping: {
    type: Number
  }
}, {
  timestamps: true
});

// Create indexes for faster querying
BotStatSchema.index({ timestamp: -1 });

// Method to get statistics for a time period
BotStatSchema.statics.getStatsPeriod = async function(startDate, endDate) {
  const stats = await this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: 1 });
  
  return stats;
};

// Method to calculate server growth
BotStatSchema.statics.calculateGrowth = async function() {
  const now = new Date();
  
  // Calculate time periods
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  
  // Get current servers count
  const currentStats = await this.findOne().sort({ timestamp: -1 });
  if (!currentStats) return { daily: 0, weekly: 0, monthly: 0 };
  
  // Get historical server counts
  const dayStats = await this.findOne({
    timestamp: { $lte: oneDayAgo }
  }).sort({ timestamp: -1 });
  
  const weekStats = await this.findOne({
    timestamp: { $lte: oneWeekAgo }
  }).sort({ timestamp: -1 });
  
  const monthStats = await this.findOne({
    timestamp: { $lte: oneMonthAgo }
  }).sort({ timestamp: -1 });
  
  // Calculate growth
  return {
    daily: dayStats ? currentStats.servers - dayStats.servers : 0,
    weekly: weekStats ? currentStats.servers - weekStats.servers : 0,
    monthly: monthStats ? currentStats.servers - monthStats.servers : 0
  };
};

// Method to get average commands per day
BotStatSchema.statics.getAverageCommands = async function(days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const stats = await this.find({
    timestamp: { $gte: startDate }
  });
  
  if (stats.length === 0) return 0;
  
  const totalCommands = stats.reduce((sum, stat) => sum + stat.commands_used, 0);
  return Math.round(totalCommands / days);
};

// Method to get most used commands all-time
BotStatSchema.statics.getMostUsedCommands = async function(limit = 10) {
  // This is a simple implementation that just takes the most recent snapshot's top commands
  // A more sophisticated implementation would aggregate across all snapshots
  const latestStat = await this.findOne().sort({ timestamp: -1 });
  if (!latestStat || !latestStat.top_commands) return [];
  
  return latestStat.top_commands.slice(0, limit);
};

const BotStat = mongoose.model('BotStat', BotStatSchema);

module.exports = BotStat;