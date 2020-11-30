const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    server: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    timeZoneFromUTC: {
        type: String,
        required: true
    }
});

const accountModel = mongoose.model('account', accountSchema);

module.exports = accountModel;