const sessionModel = require('./sessionModel');


const getSession = async server => {
    const foundSession = await sessionModel.findOne({ server });

    if(foundSession) return foundSession.dateTime;
    else return null;
};

const setSession = async (server, dateTime) => {
    await clearSession(server);
    
    const newSession = new sessionModel({ server, dateTime });
    await newSession.save();
};

const clearSession = async server => {
    await sessionModel.deleteOne({ server });
}

module.exports = {
    getSession,
    setSession,
    clearSession
};