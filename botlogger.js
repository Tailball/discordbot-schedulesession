const log = msg => {
    const server = msg.channel.guild.name;
    const message = msg.content;

    console.log(`server ${server} message: ${message}`);
};

module.exports = log;