const moment = require('moment');

const { getSession, setSession, clearSession } = require('./database/store');


const parseMessage = msg => {
    const content = msg.content;
    const server = msg.channel.guild.name;

    if(content.startsWith('!when')) replyWhen(server, msg);
    if(!content.startsWith('!tailball')) return;

    const components =  content.split(' ');
    if(components.length <= 1) return;

    const command = components[1];
    
    switch(command) {
        case 'help':
        case 'command':
        case 'commands':
            replyHelp(msg);
            break;

        case 'alive':
            replyAlive(msg);
            break;

        case 'clear':
            replyClear(server, msg);
            break;

        case 'set': 
            replySet(server, msg, components);
            break;

        case 'when':
            replyWhen(server, msg);
            break;
    }
};


const replyHelp = msg => {
    msg.channel.send('Commands are: "help", "command", "commands", "alive", "clear", "set <yyyymmdd hhmm>", "when"');
}

const replyAlive = msg => {
    msg.channel.send('I am alive!');
}

const replyClear = async (server, msg) => {
    await clearSession(server);
    msg.channel.send(`Cleared session for ${server}`);
}

const replySet = async (server, msg, components) => {
    const verifiedDate = verifySession(components);

    if(!verifiedDate) {
        msg.channel.send('Could not set session. Incorrect format received. Expected "YYYYmmDD HH:MM".');
        return;
    }

    await setSession(server, verifiedDate);
    msg.channel.send(`Setting new session for ${server} at ${parseDate(verifiedDate.date)} ${parseTime(verifiedDate.time)} UTC`);
}

const replyWhen = async (server, msg) => {
    const session = await getSession(server);
    
    console.log(session);

    if(!session) {
        msg.channel.send('No sessions planned!');
        return;
    }

    msg.channel.send(`Next session for ${server} will be at ${parseDate(session.date)} ${parseTime(session.time)} UTC`);
}


const verifySession = msg => {
    if(msg.length < 4) return null;
    const date = msg[2];
    const time = msg[3];

    if(date.length !== 8) return null;
    if(time.length !== 5) return null;
    if(!time.includes(':')) return null;

    return { date, time };
}

const parseDate = date => {
    const parsed = moment(date);

    const day = parsed.date();
    const dayInWeek = parsed.day();
    const dayInWeekString = dayOfWeekToString(dayInWeek);
    const month = parsed.month() + 1;
    const monthString = monthToString(month);
    const year = parsed.year();
    
    return `${dayInWeekString}, ${monthString} ${day}${dayOfMonthSuffix(day)} ${year}`;
}

const parseTime = time => {
    const components = time.split(':');
    const hour = components[0];
    const min = components[1];

    const timeOfDay = hour < 13 ? 'AM' : 'PM';
    const hourParse = hour < 13 ? hour : hour - 12;

    return `${hourParse}:${min} ${timeOfDay} (${hour}:${min})`;
}

const monthToString = month => {
    switch(month) {
        case 1:
            return 'Jan';
        case 2:
            return 'Feb';
        case 3:
            return 'Mar';
        case 4:
            return 'Apr';
        case 5:
            return 'May';
        case 6:
            return 'Jun';
        case 7:
            return 'Jul';
        case 8:
            return 'Aug';
        case 9:
            return 'Sep';
        case 10:
            return 'Oct';
        case 11:
            return 'Nov';
        case 12:
            return 'Dec';
        default: 
            return 'Invalid';
    }
}

const dayOfWeekToString = day => {
    switch(day) {
        case 1:
            return 'Mon';
        case 2:
            return 'Tue';
        case 3:
            return 'Wed';
        case 4:
            return 'Thu';
        case 5:
            return 'Fri';
        case 6:
            return 'Sat';
        case 7:
            return 'Sun';
        default:
            return 'Invalid';
    }
}

const dayOfMonthSuffix = day => {
    if(day === 1) return 'st';
    if(day === 2) return 'nd';
    if(day === 3) return 'rd';
    return 'th';
}

module.exports = parseMessage;