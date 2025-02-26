const { Client, GuildMember } = require("discord.js");
const AutoRole = require("../../models/AutoRole");

/**
 *
 * @param {Client} client
 * @param {GuildMember} member
 */

module.exports = async (client, member) => {
  try {
    /*
      Lấy thông tin server (guild) của thành viên mới.
      Nếu guild không tồn tại, thoát hàm ngay (return).
    */
    let guild = member.guild;
    if (!guild) return;

    const autoRole = await AutoRole.findOne({ guildId: guild.id });
    if (!autoRole) return;

    await member.roles.add(autoRole.roleId);
  } catch (error) {
    console.log(`Error giving role automatically: ${error}`);
  }
};
