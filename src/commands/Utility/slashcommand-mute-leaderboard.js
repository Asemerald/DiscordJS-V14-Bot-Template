const { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'mute-leaderboard',
        description: 'Affiche le classement des personnes les plus mutées.',
        type: 1,
        options: []
    },
    options: {
        cooldown: 5000
    },
    /**
     * @param {DiscordBot} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const db = client.database;

        // We will store mute counts under a single key:
        // { "<userId>": number, ... }
        const key = 'mute_counts';
        const muteCounts = db.get(key) || {};

        // If nobody has been muted yet
        const entries = Object.entries(muteCounts);
        if (!entries.length) {
            return interaction.reply({
                content: 'Personne n’a encore été muté.'
            });
        }

        // Sort by number of mutes (desc)
        entries.sort(([, a], [, b]) => b - a);

        // Take top 10
        const top = entries.slice(0, 10);

        // Resolve usernames from IDs
        const lines = await Promise.all(
            top.map(async ([userId, count], index) => {
                const member = await interaction.guild.members
                    .fetch(userId)
                    .catch(() => null);

                const name =
                    member?.user?.tag ||
                    member?.displayName ||
                    `Inconnu (${userId})`;

                return `\`${index + 1}.\` **${name}** — \`${count}\` mute(s)`;
            })
        );

        const embed = new EmbedBuilder()
            .setTitle('🏆 Classement des personnes les plus mutées')
            .setDescription(lines.join('\n'))
            .setColor(0xffa500)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
}).toJSON();

