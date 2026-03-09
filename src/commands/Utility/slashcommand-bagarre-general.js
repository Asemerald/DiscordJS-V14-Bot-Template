// Bagarre General Command
// Whenever this command is called, it will fetch all online users and randomly create a leaderboard of who would win in a fight against each other, and return the result in an embed
const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const eventsConfig = require("../../data/hunger-games-events.json");

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function pickWeighted(events) {
    const totalWeight = events.reduce((sum, e) => sum + (e.weight || 1), 0);
    let roll = Math.random() * totalWeight;
    for (const event of events) {
        roll -= (event.weight || 1);
        if (roll <= 0) return event;
    }
    return events[events.length - 1];
}

function pickTarget(aliveMembers, actor) {
    const candidates = aliveMembers.filter(m => m.id !== actor.id);
    return candidates.length ? pickRandom(candidates) : null;
}

function canUseEvent(event, aliveCount) {
    if (event.effect === "kill_target" || event.effect === "kill_actor") return aliveCount > 1;
    return true;
}

function hasRequiredItems(inventory, memberId, requiredItems) {
    if (!requiredItems || !requiredItems.length) return true;
    const bag = inventory.get(memberId);
    if (!bag) return false;
    return requiredItems.every(item => bag.has(item));
}

function addItem(inventory, memberId, item) {
    if (!item) return;
    if (!inventory.has(memberId)) inventory.set(memberId, new Set());
    inventory.get(memberId).add(item);
}

function removeItem(inventory, memberId, item) {
    if (!item) return;
    const bag = inventory.get(memberId);
    if (bag) bag.delete(item);
}

function renderEvent(template, actor, target) {
    return template
        .replaceAll("{actor}", actor.displayName)
        .replaceAll("{target}", target?.displayName || "quelqu'un");
}

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
        const eventsPool = Array.isArray(eventsConfig.events) ? eventsConfig.events : [];
        const channelMembers = interaction.channel?.members;

        if (!channelMembers) {
            await interaction.reply({
                content: "Impossible de recuperer les membres de ce channel.",
                ephemeral: true
            });
            return;
        }

        const participants = channelMembers.filter(
            member => member?.id != "969299808575696936" && !member.user.bot
        );
        const alive = Array.from(participants.values());

        if (alive.length < 2) {
            await interaction.reply({
                content: "Il faut au moins 2 utilisateurs en ligne, non-bots, dans ce channel pour lancer une bagarre generale.",
                ephemeral: true
            });
            return;
        }

        if (!eventsPool.length) {
            await interaction.reply({
                content: "Aucun evenement configure. Ajoute des lignes dans src/data/hunger-games-events.json",
                ephemeral: true
            });
            return;
        }

        const events = [];
        const killCounts = new Map();
        const inventory = new Map();
        let lastTemplate = null;
        let turnsWithoutDeath = 0;
        let soloDeaths = 0;
        const maxSoloDeaths = Math.max(1, Math.floor(alive.length / 4));
        let safety = 0;

        while (alive.length > 1 && safety < 500) {
            safety++;
            const actor = pickRandom(alive);

            let available = eventsPool.filter(event => {
                if (!canUseEvent(event, alive.length)) return false;
                if (!hasRequiredItems(inventory, actor.id, event.requiresItems)) return false;
                if (event.template === lastTemplate) return false;
                if (event.effect === "kill_actor" && soloDeaths >= maxSoloDeaths) return false;
                return true;
            });

            const lethalPvP = available.filter(e => e.effect === "kill_target");
            const lethalAny = available.filter(e => e.effect === "kill_target" || e.effect === "kill_actor");

            let possibleEvents;
            if (turnsWithoutDeath >= 2 && lethalPvP.length) {
                possibleEvents = lethalPvP;
            } else if (turnsWithoutDeath >= 3 && lethalAny.length) {
                possibleEvents = lethalAny;
            } else {
                possibleEvents = available;
            }

            if (!possibleEvents.length) continue;

            const event = pickWeighted(possibleEvents);
            const target = event.requiresTarget ? pickTarget(alive, actor) : null;

            if (event.requiresTarget && !target) continue;

            events.push(renderEvent(event.template, actor, target));
            lastTemplate = event.template;

            addItem(inventory, actor.id, event.givesItem);
            if (event.consumesItem) removeItem(inventory, actor.id, event.consumesItem);

            if (event.effect === "kill_target" && target) {
                killCounts.set(actor.id, (killCounts.get(actor.id) || 0) + 1);
                const i = alive.findIndex(m => m.id === target.id);
                if (i !== -1) alive.splice(i, 1);
                turnsWithoutDeath = 0;
                continue;
            }

            if (event.effect === "kill_actor") {
                soloDeaths++;
                const i = alive.findIndex(m => m.id === actor.id);
                if (i !== -1) alive.splice(i, 1);
                turnsWithoutDeath = 0;
                continue;
            }

            turnsWithoutDeath++;
        }

        if (alive.length > 1) {
            while (alive.length > 1) {
                const actor = pickRandom(alive);
                const target = pickTarget(alive, actor);
                if (!target) break;
                events.push(`${actor.displayName} acheve ${target.displayName} a mains nues`);
                killCounts.set(actor.id, (killCounts.get(actor.id) || 0) + 1);
                const i = alive.findIndex(m => m.id === target.id);
                if (i !== -1) alive.splice(i, 1);
            }
        }

        const winner = alive[0];
        events.push(`${winner.displayName} est le vainqueur`);

        const groupedKills = new Map();
        for (const [memberId, kills] of killCounts.entries()) {
            if (!groupedKills.has(kills)) groupedKills.set(kills, []);
            const member = interaction.guild.members.cache.get(memberId);
            groupedKills.get(kills).push(member?.displayName || "Inconnu");
        }

        const topKills = Array.from(groupedKills.entries())
            .sort((a, b) => b[0] - a[0])
            .slice(0, 5)
            .map(([kills, names]) => `${names.join(" / ")} : ${kills}`)
            .join("\n");

        const storyText = events.join("\n");
        const safeStoryText = storyText.length > 3800
            ? `${storyText.slice(0, 3750)}\n...`
            : storyText;

        const embed = new EmbedBuilder()
            .setTitle('Hunger Games - Bagarre Générale')
            .setDescription(safeStoryText)
            .addFields({
                name: 'Top kills',
                value: topKills || 'Aucun kill enregistré'
            })
            .setColor('Random')
            .setFooter({ text: 'Vous devez le respecter maintenant' });

        await interaction.reply({ embeds: [embed] });
    }
}).toJSON();