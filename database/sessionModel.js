const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    server: {
        type: String,
        required: true
    },
    dateTime: {
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    }
});

const sessionModel = mongoose.model('session', sessionSchema);

module.exports = sessionModel;