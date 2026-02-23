const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'add-status',
        description: 'Ajoute un nouveau statut au bot.',
        type: 1,
        options: [
            {
                name: 'message',
                description: 'Le texte du statut à ajouter.',
                type: 3,
                required: true
            }
        ]
    },
    options: {
        cooldown: 5000,
        ownerOnly: false,
        devOnly: false
    },
    /**
     * @param {DiscordBot} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const statusText = interaction.options.getString('message', true).trim();

        if (!statusText.length) {
            return interaction.reply({
                content: 'Le statut ne peut pas être vide.',
                ephemeral: true
            });
        }

        const db = client.database;
        const key = 'status_messages';

        // Load existing statuses (array of strings or objects)
        const existing = db.get(key) || [];

        // Store as plain strings for simplicity
        existing.push(statusText);
        db.set(key, existing);

        // Also update the in-memory rotation list immediately
        client.statusMessages.push({
            name: statusText,
            type: 4
        });

        return interaction.reply({
            content: `Nouveau statut ajouté : \`${statusText}\``,
            ephemeral: true
        });
    }
}).toJSON();

