const sessionModel = require('./sessionModel');
const accountModel = require('./accountModel');


const getSession = async server => {
    const foundSession = await sessionModel.findOne({ server });

    if(foundSession) {
        const accountsForSession = await accountModel.find({ server });

        return { 
            sessionTime: foundSession.dateTime,
            accounts: accountsForSession
        };
    }
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

const setAccount = async (server, id, name, timeZoneFromUTC) => {
    await clearAccount(server, id);
    
    const account = new accountModel({ server, id, name, timeZoneFromUTC });

    await account.save();
}

const clearAccount = async (server, id) => {
    await accountModel.deleteOne({ server, id });
}

module.exports = {
    getSession,
    setSession,
    setAccount,
    clearSession
};