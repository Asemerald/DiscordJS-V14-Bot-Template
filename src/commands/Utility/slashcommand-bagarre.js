// a comamnd that allows users to start a fight with another user, and its a random 50% chance to win, then return a message with the result of the fight
const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'bagarre',
        description: 'Commence une bagarre avec un autre utilisateur.',
        type: 1,
        options: [
            { 
                name: 'user',
                description: 'L\'utilisateur avec qui vous voulez vous battre.',
                type: 6, // USER type
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
        const targetUser = interaction.options.getUser('user', true);
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: 'Vous ne pouvez pas vous battre contre vous-même!',
                ephemeral: true
            });
        }
        const outcome = Math.random() < 0.5 ? 'gagné' : 'perdu';
        return interaction.reply({
            content: `${interaction.user} a **${outcome}** la bagarre contre ${targetUser}!, ${outcome === 'gagné' ? 'Il a un plus gros chibre!' : 'SAh, c\'était une haagrah.'}`
        });
    }
}).toJSON();