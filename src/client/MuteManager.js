const { warn, error, info } = require("../utils/Console");

const DB_KEY = 'reaction_mutes';
const BASE_MUTE_DURATION = 2 * 60 * 1000; // 2 minutes

class MuteManager {
    /**
     * @param {import("./DiscordBot")} client
     */
    constructor(client) {
        this.client = client;
        this.timeouts = new Map(); // messageId -> Timeout
    }

    get db() {
        return this.client.database;
    }

    _loadState() {
        return this.db.get(DB_KEY) || {};
    }

    _saveState(state) {
        this.db.set(DB_KEY, state);
    }

    /**
     * Restore all pending unmutes from the database and reschedule them.
     */
    async init() {
        const state = this._loadState();
        const now = Date.now();

        for (const [messageId, entry] of Object.entries(state)) {
            const remaining = entry.unmuteAt - now;

            if (remaining <= 0) {
                // Timer already passed while bot was offline, unmute immediately
                try {
                    await this._unmute(entry);
                    info(`[MuteManager] Restored and unmuted user ${entry.userId} from message ${messageId}.`);
                    delete state[messageId];
                } catch (err) {
                    error('[MuteManager] Failed to restore unmute for message ' + messageId);
                    error(err);
                }
            } else {
                this._schedule(messageId, remaining, entry);
            }
        }

        this._saveState(state);
    }

    _schedule(messageId, delay, entry) {
        const timeout = setTimeout(async () => {
            const state = this._loadState();
            try {
                await this._unmute(entry);
                info(`[MuteManager] Automatically unmuted user ${entry.userId} from message ${messageId}.`);
            } catch (err) {
                error('[MuteManager] Failed to automatically unmute user ' + entry.userId);
                error(err);
            }

            delete state[messageId];
            this._saveState(state);
            this.timeouts.delete(messageId);
        }, delay);

        this.timeouts.set(messageId, timeout);
    }

    async _unmute(entry) {
        const guild = await this.client.guilds.fetch(entry.guildId).catch(() => null);
        if (!guild) return;

        const member = await guild.members.fetch(entry.userId).catch(() => null);
        if (!member) return;

        const tempRole = guild.roles.cache.get(entry.tempRoleId);
        const originalRole = guild.roles.cache.get(entry.originalRoleId);

        if (tempRole && member.roles.cache.has(tempRole.id)) {
            await member.roles.remove(tempRole);
        }

        if (originalRole && !member.roles.cache.has(originalRole.id)) {
            await member.roles.add(originalRole);
        }
    }

    /**
     * Apply a new mute based on reactions.
     */
    applyReactionMute({ guildId, userId, originalRoleId, tempRoleId, messageId }) {
        const state = this._loadState();
        const now = Date.now();
        const duration = BASE_MUTE_DURATION;
        const unmuteAt = now + duration;

        const entry = {
            guildId,
            userId,
            originalRoleId,
            tempRoleId,
            messageId,
            unmuteAt,
            extended: false
        };

        state[messageId] = entry;
        this._saveState(state);

        this._schedule(messageId, duration, entry);

        info(`[MuteManager] Applied mute to user ${userId} (message ${messageId}) for ${duration}ms.`);
    }

    /**
     * Extend an existing mute timer (e.g. when reaching 9 reactions).
     */
    extendMute(messageId, factor = 2) {
        const state = this._loadState();
        const entry = state[messageId];
        if (!entry) return;
        if (entry.extended) return;

        const now = Date.now();
        const remaining = entry.unmuteAt - now;
        const newRemaining = (remaining > 0 ? remaining : BASE_MUTE_DURATION) * factor;

        entry.unmuteAt = now + newRemaining;
        entry.extended = true;
        this._saveState(state);

        const current = this.timeouts.get(messageId);
        if (current) clearTimeout(current);

        this._schedule(messageId, newRemaining, entry);

        info(`[MuteManager] Extended mute for user ${entry.userId} (message ${messageId}) by factor ${factor}.`);
    }
}

module.exports = MuteManager;

