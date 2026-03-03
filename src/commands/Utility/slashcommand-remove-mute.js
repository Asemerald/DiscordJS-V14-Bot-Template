const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'remove-mute',
        description: 'Retire le mute d\'un utilisateur.',
        type: 1,
        options: [
            {
                name: 'user',
                description: 'L\'utilisateur à démute.',
                type: 6, // USER type
                required: true
            },
        ]
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user', true);

        const SERVER_MUTE_ROLE_ID = '1375122608026030120'; // Nom du rôle de mute
        const SERVER_NORMAL_ROLE_ID = '1367120379365031947'; // Nom du rôle normal à redonner
        const SERVER_ID = '1108842654067855361'; // ID du serveur

        const guild = client.guilds.cache.get(SERVER_ID);
        if (!guild) {
            return interaction.reply({
                content: 'Serveur introuvable.',
                ephemeral: true
            });
        }
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({
                content: 'Membre introuvable.',
                ephemeral: true
            });
        }
        const muteRole = guild.roles.cache.get(SERVER_MUTE_ROLE_ID);
        const normalRole = guild.roles.cache.get(SERVER_NORMAL_ROLE_ID);
        if (!muteRole || !normalRole) {
            return interaction.reply({
                content: 'Rôles introuvables.',
                ephemeral: true
            });
        }
        if (!member.roles.cache.has(muteRole.id)) {
            return interaction.reply({
                content: 'Cet utilisateur n\'est pas muté.',
                ephemeral: true
            });
        }
        try {
            await member.roles.remove(muteRole);
            await member.roles.add(normalRole);
            await interaction.reply({
                content: `Le mute de ${user.tag} a été retiré.`,
                ephemeral: true
            });
        }
        catch (error) {
            await interaction.reply({
                content: `Erreur lors du retrait du mute : ${error.message}`,
                ephemeral: true
            });
        }
    }
}).toJSON();