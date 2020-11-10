const moment = require('moment');
const { MessageEmbed } = require('discord.js');

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

        case 'vote':
            replyVote(msg);
            break;
    }
};


const replyHelp = msg => {
    const embed = new MessageEmbed()
        .setTitle('ℹ️ Help with commands')
        .setColor(0x00ff00)
        .addField('!tailball help', 'This displays all possible keywords.\nAlso works with command|commands.')
        .addField('!tailball alive', 'This will send a marco-polo message to see if the bot is up and awake.')
        .addField('!tailball clear', 'This will clear the active session for the current server.')
        .addField('!tailball set', 'This will set the new session.\nFormat: <yyyymmdd hh:mm tz>.')
        .addField('!tailball when', 'This will display the currently planned session.\nAlso works with the shorthand !when.')
        .addField('!tailball vote', 'This will create a voting doodle for the coming week.');

    msg.channel.send(embed);
}

const replyAlive = msg => {
    msg.channel.send('👾 I am alive! 👾');
}

const replyClear = async (server, msg) => {
    await clearSession(server);

    const embed = new MessageEmbed()
        .setTitle('❌ Session info')
        .setColor(0x0000ff)
        .setDescription(`Session was cleared for ${server}`);

    msg.channel.send(embed);
}

const replySet = async (server, msg, components) => {
    const verifiedDate = verifySession(components);

    if(!verifiedDate) {
        msg.channel.send('Could not set session. Incorrect format received. Expected "YYYYmmDD HH:MM TZ".');
        return;
    }

    await setSession(server, verifiedDate);

    const embed = new MessageEmbed()
        .setTitle('✅ Session info')
        .setColor(0x0000ff)
        .setDescription(`Setting new session for ${server} at:\n**${parseDate(verifiedDate.date)} ${parseTime(verifiedDate.time)} ${verifiedDate.timezone || 'UTC'}**`);

    msg.channel.send(embed);
}

const replyWhen = async (server, msg) => {
    const session = await getSession(server);

    let description = '';

    if(!session) description = 'No sessions planned!';
    else description = `Next session for ${server} will be at:\n**${parseDate(session.date)} ${parseTime(session.time)} ${session.timezone || 'UTC'}**`;

    const embed = new MessageEmbed()
        .setTitle('🗓 Session info')
        .setColor(0xff0000)
        .setDescription(description);
    
    msg.channel.send(embed);
}

const replyVote = async msg => {
    const nextWeek = decideNextWeek();

    const titleEmbed = new MessageEmbed()
        .setColor(0x00ffff)
        .setTitle('🗓 Vote now for the next session'.toUpperCase());

    await msg.channel.send(titleEmbed);

    nextWeek.forEach(async day => {
        const embed = new MessageEmbed()
            .setColor(0x00ffff)
            .setDescription(`🗓 vote for **${day}**`);

        const botMsg = await msg.channel.send(embed);
        await botMsg.react('✅');
        await botMsg.react('❌');
    });
}

const verifySession = msg => {
    if(msg.length < 4) return null;
    const date = msg[2];
    const time = msg[3];

    if(date.length !== 8) return null;
    if(time.length !== 5) return null;
    if(!time.includes(':')) return null;

    const timezone = (msg.length === 5) ? msg[4] : null;

    return { date, time, timezone };
}

const decideNextWeek = () => {
    const now = moment();
    
    const dayOfWeek = now.weekday();
    //const dayOfWeekName = getWeekdayName(dayOfWeek);
  
    const distToNextWeek = 8 - dayOfWeek;
  
    const returningWeek = [];
    for(let i = 0; i < 7; i++) {
        const newDay = moment()
                        .add(distToNextWeek, 'day')
                        .add(i, 'day');
  
        returningWeek.push(parseDate(newDay));
    }
  
    return returningWeek;
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
        case 0:
            return 'Sun';
        default:
            return 'Invalid';
    }
}

const dayOfMonthSuffix = day => {
    if(day === 1 || day === 21 || day === 31) 
        return 'st';

    if(day === 2 || day === 22) 
        return 'nd';
    if(day === 3 || day === 23) 
        return 'rd';
        
    return 'th';
}

module.exports = parseMessage;