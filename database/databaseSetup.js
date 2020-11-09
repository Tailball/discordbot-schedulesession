const mongoose = require('mongoose');
require('./sessionModel');

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const onDbConnected = err => {
    if(err) console.log(err);
    else console.log('Connected to MongoDB database');
};

mongoose.connect(
    process.env.DB_PATH, 
    mongooseOptions,
    onDbConnected    
);

module.exports = mongoose;