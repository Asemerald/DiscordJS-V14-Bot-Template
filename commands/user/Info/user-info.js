const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: "User Info",
    type: 2,
    run: async (client, interaction, config, db) => {

        const user = interaction.guild.members.cache.get(interaction.targetId);

        // Joined server/discord handler:
        const joinedAgoCalculator = {
            fetch: {
                user(userInput, type) {
                    if (!userInput) throw new ReferenceError('Selectionne un utilisateur boloss');

                    if (type === "discord") {
                        const joinedDiscordTimestampInNumber = new Date().getTime() - userInput.createdTimestamp;
                        const joinedDiscordTimestampInString = moment(userInput.user.createdAt).fromNow();

                        return joinedDiscordTimestampInString.toString(); // Just making sure it's string.
                    } else if (type === "server") {
                        const joinedServerTimestampInNumber = new Date().getTime() - userInput.joinedTimestamp;
                        const joinedServerTimestampInString = moment(userInput.joinedAt).fromNow();

                        return joinedServerTimestampInString.toString(); // Just making sure it's string.
                    } else throw new ReferenceError('Invalid type. Use "discord" or "server" only.');
                }
            }
        };

        // Bot type handler:
        const bot = {
            true: "Oui",
            false: "Non"
        };

        // Acknowledgements handler:
        // L for Dyno developers
        const acknowledgements = {
            fetch: {
                user(userInput) {
                    let result;

                    try {
                        if (userInput.permissions.has(PermissionsBitField.ViewChannel)) result = "Server Member";
                        if (userInput.permissions.has(PermissionsBitField.KickMembers)) result = "Server Moderator";
                        if (userInput.permissions.has(PermissionsBitField.ManageServer)) result = "Server Manager";
                        if (userInput.permissions.has(PermissionsBitField.Administrator)) result = "Server Administrator";
                        if (userInput.id === interaction.guild.ownerId) result = "Server Owner";

                    } catch (e) {
                        result = "Server Member";
                    };

                    return result;
                }
            }
        };

        // Finals:
        return interaction.reply(
            {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Voici les infos de ' + `${user.nickname ? user.nickname : user.user.username}`)
                        .setThumbnail(user.displayAvatarURL(
                            {
                                dynamic: true
                            }
                        ))
                        .addFields(
                            {
                                name: "Nom complet",
                                value: `${user.user.tag}`,
                                inline: true
                            },
                            {
                                name: "Id Discord",
                                value: `\`${user.id}\``,
                                inline: true
                            },
                            {
                                name: `Roles [${user.roles.cache.size - 1}]`, // Use "-1" because we removed the "@everyone" role 
                                value: `${user.roles.cache.map((ROLE) => ROLE).join(' ').replace('@everyone', '') || "[Sans roles miskine]"}`,
                                inline: true
                            },
                            {
                                name: "A rejoins le serv le",
                                value: `${new Date(user.joinedTimestamp).toLocaleString()}\n(${joinedAgoCalculator.fetch.user(user, "server")})`,
                                inline: true
                            },
                            {
                                name: "A rejoins Discord le",
                                value: `${new Date(user.user.createdTimestamp).toLocaleString()}\n(${joinedAgoCalculator.fetch.user(user, "discord")})`,
                                inline: true
                            },
                            {
                                name: "C'est un bot ?",
                                value: `${bot[user.user.bot]}`,
                                inline: true
                            },
                            {
                                name: "Role dans le serv",
                                value: `${acknowledgements.fetch.user(user)}`
                            }
                        )
                        .setColor('Blue')
                ],
                ephemeral: true
            }
        );

    },
};
