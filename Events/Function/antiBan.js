const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const client = require('../../index')
const config = require('../../config.json')

client.on("guildBanAdd", async (member) => {
    const auditLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd }).catch((_) => { });
    const logs = auditLogs?.entries?.first();
    if(!logs) return;
    const { executor, target } = logs;

    await client.db.get(`${member.guild.id}_wl`).then(async (data) => {
        await client.db.get(`${member.guild.id}_owner`).then(async (data2) => {
            if(!data) return;
            const antinuke = await client.db.get(`${member.guild.id}_antiBan`);
            const trusted = data.whitelisted.includes(executor.id);
            const owner = data2.ExtraOwner.includes(executor.id);
    
            if (executor.id === member.guild.ownerId) return;
            if (executor.id === client.user.id) return;
            if (antinuke !== true) return; 
            if (owner === true) return;
            if (trusted === true) return;

            let enable = client.db.get(`${member.guild.id}_antinuke`)
    
            if (enable === `true`) return;
    
            let set = await client.db.get(`${member.guild.id}_punishment`);

            if (set == `timeout`) {
                let m = member.guild.members.cache.get(executor.id);
                m.roles.cache.forEach((x) => m.roles.remove(x).catch(e => null));
      
                let duration = await client.db.get(`${member.guild.id}_timeout`)
                let dura = duration.time
                let timeout = dura[0]
                let reason = `Unwhitelisted user`
                await m.timeout(timeout, reason).catch((_) => { });
                
                punish = `Timeout`
            } else if (set == `ban`) {
                await member.guild.members.ban(executor.id, { reason: `Unwhitelisted user` }).catch((_) => { });
                punish = `Banned`
            } else if (set == `kick`) {
                await member.guild.members.kick(executor.id, { reason: `Unwhitelisted user` }).catch((_) => { });
                punish = `Kicked`
            } else if (set == `removeroles`) {
                let m = member.guild.members.cache.get(executor.id);
                m.roles.cache.forEach((x) => m.roles.remove(x).catch(e => null))
                punish = `Removed Roles`
            }
            await member.guild.members.unban(target.id).catch((_) => { });
        });
    });
});