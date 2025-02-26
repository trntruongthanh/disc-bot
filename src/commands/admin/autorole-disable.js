const { Client, Interaction, PermissionFlagsBits } = require("discord.js");
const AutoRole = require("../../models/AutoRole");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      /*
        Dòng sau đây kiểm tra xem có dữ liệu AutoRole trong database hay không cho server hiện tại:
        Phương thức .exists() của Mongoose trả về:

        true nếu tồn tại ít nhất một tài liệu (document) trong MongoDB khớp với điều kiện.
        false nếu không có tài liệu nào khớp với điều kiện.

        .exists(query)	true hoặc false	Kiểm tra có tài liệu hay không (nhanh hơn)
        .findOne(query)	Object hoặc null	Lấy tài liệu đầu tiên (có thể chậm hơn)
      */
      if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply(
          "Auto role has not been configured for this server. Use `/autorole-configure` to set it up"
        );
        return;
      }

      await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply(
        "Auto role has been disabled for this server. Use `/autorole-configure` to set it up again."
      );
      
    } catch (error) {
      console.log(error);
    }
  },

  name: "autorole-disable",
  description: "Disable auto-role in this server.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
