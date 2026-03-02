const { warn, error, info } = require("../../utils/Console");
const Event = require("../../structure/Event");

module.exports = new Event({
    event: 'messageReactionAdd',
    once: false,
    run: async (__client__, reaction, user) => {
        try {
            // Ignore bot reactions
            if (user.bot) return;

            // Set your server ID here
            const TARGET_GUILD_ID = '1108842654067855361'; 
            const ROLE_TO_REMOVE_ID = '1367120379365031947'; 
            const ROLE_TO_ADD_ID = '1375122608026030120'; 
            const X_EMOJI = '❌'; 
            const CHECK_EMOJI = '✅';

            // Check if reaction is in the target guild
            if (reaction.message.guildId !== TARGET_GUILD_ID) return;

            // Fetch full reaction data (in case message is cached)
            if (!reaction.message.author) {
                await reaction.message.fetch();
            }

            // Use YAML database attached to the client
            const db = __client__.database;

            const messageId = reaction.message.id;

            // Handle pin when message reaches 5 ✅ reactions
            if (reaction.emoji.name === CHECK_EMOJI || reaction.emoji.toString() === CHECK_EMOJI) {
                const checkReactionCount = reaction.count;

                if (checkReactionCount === 5 && !reaction.message.pinned) {
                    await reaction.message.pin();
                    
                    // Also add it to the status messages rotation in the database
                    const statusKey = 'status_messages';
                    const currentStatuses = db.get(statusKey) || [];
                    const newStatus = reaction.message.content.slice(0, 100);
                    db.set(statusKey, [...currentStatuses, newStatus]);
                }
            }

            // Handle punish logic when message gets ❌ reactions
            if (reaction.emoji.name === X_EMOJI || reaction.emoji.toString() === X_EMOJI) {
                // Get the X emoji reaction count
                const xReactionCount = reaction.count;

                // Only act when X reactions reach 5
                if (xReactionCount === 5) {
                const storedMessagesKey = 'x_reaction_processed_messages';

                // Get already processed message IDs (fallback to empty array)
                let processedMessages = db.get(storedMessagesKey) || [];

                // If this message was already processed, do nothing
                if (processedMessages.includes(messageId)) return;

                // Mark this message as processed so it never triggers again
                processedMessages.push(messageId);
                db.set(storedMessagesKey, processedMessages);

                const member = await reaction.message.guild.members.fetch(reaction.message.author.id);
                const roleToRemove = reaction.message.guild.roles.cache.get(ROLE_TO_REMOVE_ID);

                if (roleToRemove && member.roles.cache.has(ROLE_TO_REMOVE_ID)) {
                    await member.roles.remove(roleToRemove);
                    info(`[Role Removal] Removed role ${roleToRemove.name} from ${member.user.tag}`);
                } else if (!roleToRemove) {
                    warn(`[Role Removal] Role ID not found: ${ROLE_TO_REMOVE_ID}`);
                }

                // Then add the new role
                const roleToAdd = reaction.message.guild.roles.cache.get(ROLE_TO_ADD_ID);
                if (roleToAdd) {
                    await member.roles.add(roleToAdd);
                    info(`[Role Addition] Added role ${roleToAdd.name} to ${member.user.tag}`);
                } else {
                    warn(`[Role Addition] Role ID not found: ${ROLE_TO_ADD_ID}`);
                }

                // Increment mute count for the punished user in the database
                const muteKey = 'mute_counts';
                const muteCounts = db.get(muteKey) || {};
                muteCounts[member.id] = (muteCounts[member.id] || 0) + 1;
                db.set(muteKey, muteCounts);

                // Send a message in the channel saying the user has been punished and by who 
                const channel = reaction.message.channel;
                await channel.send(`<@${member.user.id}> a été puni par ${user.tag}`);

                // Register this mute with the MuteManager so it can be reversed and restored after restart
                __client__.mute_manager.applyReactionMute({
                    guildId: reaction.message.guildId,
                    userId: member.id,
                    originalRoleId: ROLE_TO_REMOVE_ID,
                    tempRoleId: ROLE_TO_ADD_ID,
                    messageId
                });
                }

                // If the same message reaches 9 reactions, double the remaining mute time once
                if (xReactionCount === 9) {
                    __client__.mute_manager.extendMute(messageId, 2);
                    await reaction.message.channel.send(`<@${reaction.message.author.id}> a reçu 9 réactions ${X_EMOJI}. Il est vraiment très vilain`);
                }
            }
        } catch (err) {
            error(err);
        }
    }
}).toJSON();