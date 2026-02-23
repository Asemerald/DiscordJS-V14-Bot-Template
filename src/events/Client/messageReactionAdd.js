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
            const REVERSE_DELAY = 2 * 60 * 1000; // 2 minutes en millisecondes

            // Check if reaction is in the target guild
            if (reaction.message.guildId !== TARGET_GUILD_ID) return;

            // Check if the emoji is the X emoji
            if (reaction.emoji.name !== X_EMOJI && reaction.emoji.toString() !== X_EMOJI) return;

            // Fetch full reaction data (in case message is cached)
            if (!reaction.message.author) {
                await reaction.message.fetch();
            }

            // Get the X emoji reaction count
            const xReactionCount = reaction.count;

            // Only act when X reactions reach 5
            if (xReactionCount === 5) {
                const messageId = reaction.message.id;

                // Use YAML database attached to the client
                const db = __client__.database;
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
                    console.log(`[Role Removal] Removed role ${roleToRemove.name} from ${member.user.tag}`);
                } else if (!roleToRemove) {
                    console.warn(`[Role Removal] Role ID not found: ${ROLE_TO_REMOVE_ID}`);
                }

                // Then add the new role
                const roleToAdd = reaction.message.guild.roles.cache.get(ROLE_TO_ADD_ID);
                if (roleToAdd) {
                    await member.roles.add(roleToAdd);
                    console.log(`[Role Addition] Added role ${roleToAdd.name} to ${member.user.tag}`);
                } else {
                    console.warn(`[Role Addition] Role ID not found: ${ROLE_TO_ADD_ID}`);
                }

                // Increment mute count for the punished user in the database
                const muteKey = 'mute_counts';
                const muteCounts = db.get(muteKey) || {};
                muteCounts[member.id] = (muteCounts[member.id] || 0) + 1;
                db.set(muteKey, muteCounts);

                // Send a message in the channel saying the user has been punished and by who 
                const channel = reaction.message.channel;
                await channel.send(`${member.user.tag} a été puni par ${user.tag} pour avoir reçu 5 réactions ${X_EMOJI} sur son message.`);

                // After 2 minutes, reverse the roles
                setTimeout(async () => {
                    try {
                        // Re-fetch member to ensure data is up-to-date
                        const updatedMember = await reaction.message.guild.members.fetch(reaction.message.author.id);
                        
                        // Remove the temporary role
                        if (roleToAdd && updatedMember.roles.cache.has(ROLE_TO_ADD_ID)) {
                            await updatedMember.roles.remove(roleToAdd);
                            console.log(`[Role Reversal] Removed role ${roleToAdd.name} from ${updatedMember.user.tag}`);
                        }

                        // Re-add the original role
                        if (roleToRemove && !updatedMember.roles.cache.has(ROLE_TO_REMOVE_ID)) {
                            await updatedMember.roles.add(roleToRemove);
                            console.log(`[Role Reversal] Re-added role ${roleToRemove.name} to ${updatedMember.user.tag}`);
                        }
                    } catch (err) {
                        console.error('[Role Reversal Error]:', err);
                    }
                }, REVERSE_DELAY);
            }
        } catch (err) {
            console.error('[messageReactionAdd Event Error]:', err);
        }
    }
}).toJSON();