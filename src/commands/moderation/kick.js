const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("target-user").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("That user doesn't exist in this server.");
      return;
    }

    if (targetUserId === interaction.guild.ownerId) {
      await interaction.editReply(
        "You can't kick that user because they're the server owner."
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "You can't kick that user because they have the same/higher role than you."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I can't kick that user because they have the same role/higher role than me."
      );
      return;
    }

    // Ban the targetUser
    try {
      await targetUser.kick({ reason });
      await interaction.editReply(
        `User ${targetUser} was kicked\nReason: ${reason}`
      );
    } catch (error) {
      console.log(`There was an error when banning: ${error}`);
    }
  },

  name: "kick",
  description: "Kick a members from this server.",
  //   devOnly: Boolean,
  //   testOnly: Boolean,
  options: [
    {
      name: "target-user",
      description: "The user you want to kick.",
      type: ApplicationCommandOptionType.Mentionable, //  Dữ liệu được nhập vào phải là một đối tượng có thể đề cập (mentionable), như người dùng hoặc vai trò.
      required: true, // Người dùng bắt buộc phải cung cấp.
    },
    {
      name: "reason",
      description: "The reason you want to kick.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};
