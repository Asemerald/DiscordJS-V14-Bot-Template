const { ChatInputCommandInteraction, ApplicationCommandOptionType, MessageFlags } = require("discord.js");
const fs = require("fs");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const config = require("../../config");
const { QuickYAML } = require("quick-yaml.db");

module.exports = new ApplicationCommand({
    command: {
        name: "upload-database",
        description: "Upload a new bot database.",
        type: 1,
        dm_permission: false,
        default_member_permissions: "8",
        options: [{
            name: "database",
            description: "The database file to upload.",
            type: ApplicationCommandOptionType.Attachment,
            required: true
        }]
    },

    options: {},

    /**
     * @param {DiscordBot} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        try {
            const attachment = interaction.options.getAttachment("database", true);

            console.log("=== DATABASE UPLOAD ===");
            console.log("Attachment URL:", attachment.url);
            console.log("Database path:", config.database.path);

            const response = await fetch(attachment.url);

            if (!response.ok) {
                return interaction.editReply({
                    content: `Download failed (${response.status})`
                });
            }

            const buffer = Buffer.from(await response.arrayBuffer());

            console.log("Downloaded bytes:", buffer.length);

            fs.writeFileSync(config.database.path, buffer);

            console.log(
                "Written bytes:",
                fs.statSync(config.database.path).size
            );

            console.log(
                "File content after write:\n",
                fs.readFileSync(config.database.path, "utf8")
            );

            client.database = new QuickYAML(config.database.path);

            console.log(
                "Database reloaded:",
                client.database.all()
            );

            await interaction.editReply({
                content: "Successfully uploaded the new database."
            });

        } catch (err) {
            console.error(err);

            await interaction.editReply({
                content: `Upload failed: ${err.message}`
            });
        }
    }
}).toJSON();