/*
  ApplicationCommandOptionType: Dùng để định nghĩa kiểu dữ liệu của tùy chọn trong lệnh (ở đây là một role).
  Client: Đại diện cho bot Discord.js.
  Interaction: Đại diện cho một lần tương tác của người dùng với bot.
  PermissionFlagsBits: Xác định quyền hạn yêu cầu để sử dụng lệnh (ở đây là Administrator và ManageRoles).
  AutoRole: Một model Mongoose để lưu thông tin auto-role trong database.
*/

const {
  ApplicationCommandOptionType,
  Client,
  Interaction,
  PermissionFlagsBits,
} = require("discord.js");

const AutoRole = require("../../models/AutoRole");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("You can only run this command inside a server.");
      return;
    }

    // Khi người dùng nhập /autorole-configure role:@Member, bot sẽ lấy ID của role này
    const targetRoleId = interaction.options.get("role").value;
    console.log(targetRoleId);
    
    try {
      await interaction.deferReply();
      
      // Tìm trong database xem server này đã có auto-role hay chưa.
      let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

      if (autoRole) {
        if (autoRole.roleId === targetRoleId) {
          interaction.editReply(
            "Auto role has been already been configured for that role. To disable run `/autorole-disable.`"
          );
          return;
        }

        autoRole.roleId = targetRoleId;
      } else {
        autoRole = new AutoRole({
          guildId: interaction.guild.id,
          roleId: targetRoleId,
        });
      }

      await autoRole.save();

      interaction.editReply(
        "Autorole has now been configured for that role. To disable run `/autorole-disable"
      );
    } catch (error) {
      console.log(error);
    }
  },

  name: "autorole-configure",
  description: "Configure your auto-role for this server.",
  options: [
    {
      name: "role",
      description: "The role you want users to get on join.",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageRoles],
};
