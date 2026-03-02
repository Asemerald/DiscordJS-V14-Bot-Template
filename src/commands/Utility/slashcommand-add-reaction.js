const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'add-reaction',
        description: 'Ajoute une réaction à un message.',
        type: 1,
        options: [
            {
                name: 'message-id',
                description: 'L\'ID du message à réagir.',
                type: 3,
                required: true
            },
            {
                name: 'emoji',
                description: 'L\'emoji à ajouter.',
                type: 3,
                required: true
            }
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
        const messageId = interaction.options.getString('message-id', true);
        const emoji = interaction.options.getString('emoji', true);

        try {
            const message = await interaction.channel.messages.fetch(messageId);
            await message.react(emoji);
            await interaction.reply({
                content: `Emoji \`${emoji}\` ajouté au message ${messageId}`,
                flags: 64 // Ephemeral flag
            });
        } catch (error) {
            await interaction.reply({
                content: `Erreur lors de l'ajout de l'emoji : ${error.message}`,
                flags: 64 // Ephemeral flag
            });
        }
    }
}).toJSON();