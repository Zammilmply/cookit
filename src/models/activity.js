const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    action: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', activitySchema);
