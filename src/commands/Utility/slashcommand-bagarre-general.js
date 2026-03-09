// Bagarre General Command
// Whenever this command is called, it will fetch all online users and randomly create a leaderboard of who would win in a fight against each other, and return the result in an embed
const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'bagarre-general',
        description: 'Affiche un classement aléatoire des utilisateurs en fonction de leurs chances de gagner une bagarre.',
        type: 1
    },
    options: {
        cooldown: 60000
    },
    /**
     * @param {DiscordBot} client
     * @param {ChatInputCommandInteraction} interaction
     * @return {Promise<void>}
     **/
    run: async (client, interaction) => {
        const onlineMembers = interaction.guild.members.cache.filter(member => member.presence?.status === 'online' && !member.user.bot);
        const membersArray = Array.from(onlineMembers.values());
        const shuffledMembers = membersArray.sort(() => 0.5 - Math.random());
        const leaderboard = shuffledMembers.slice(0, 10).map((member, index) => `${index + 1}. ${member.user.tag}`).join('\n');
        const embed = new EmbedBuilder()
            .setTitle('Bagarre Général - Classement')
            .setDescription(leaderboard)
            .setColor('Random')
            .setFooter({ text: 'Ce classement est généré aléatoirement à chaque exécution de la commande.' });
        await interaction.reply({ embeds: [embed] });
    }
}).toJSON();