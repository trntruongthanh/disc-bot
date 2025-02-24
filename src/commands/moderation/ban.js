/*
  choices
  Mô tả: Cung cấp danh sách các giá trị có sẵn để người dùng lựa chọn khi sử dụng lệnh.
  Loại: Mảng các đối tượng, mỗi đối tượng chứa:
  name: Tên hiển thị cho lựa chọn (chuỗi).
  value: Giá trị thực tế được gửi về máy chủ (chuỗi, số, hoặc boolean).
  Công dụng:
  Hạn chế giá trị đầu vào mà người dùng có thể cung cấp cho tùy chọn.
  Hiển thị danh sách thả xuống (dropdown) trong giao diện Discord khi người dùng gọi lệnh.


  options
  Mô tả: Một danh sách các tùy chọn con (sub-options) cho lệnh hoặc một nhóm lệnh (subcommands).

  Loại: Mảng các đối tượng tùy chọn.

  Công dụng:

  Định nghĩa các tùy chọn phụ mà người dùng có thể cung cấp khi gọi lệnh.
  Cho phép lệnh có cấu trúc phức tạp hơn với nhiều tham số hoặc nhóm lệnh con.


  required: Quy định tùy chọn bắt buộc hay không.
  choices: Cung cấp danh sách giá trị cố định mà người dùng có thể chọn.
  options: Tạo cấu trúc lệnh với các tùy chọn hoặc nhóm lệnh con.

  Mentionable là bất kỳ đối tượng nào mà bạn có thể "mention" (đề cập) trong Discord, bao gồm:
  Người dùng (User)
  Vai trò (Role)
  Kênh (Channel), nhưng chỉ trong một số ngữ cảnh nhất định.
*/

const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  /**
   * This function is the callback for the "ban" command. It takes two parameters: client and interaction.
   *
   * @param {Client} client - The Discord client instance.
   * @param {Interaction} interaction - The interaction that triggered this command.
   */

  callback: async (client, interaction) => {
    // Retrieve the target user's ID from the interaction options.
    const targetUserId = interaction.options.get("target-user").value;

    // Retrieve the reason for the ban from the interaction options. If not provided, default to "No reason provided".
    const reason =
      interaction.options.get("reason")?.value || "No reason provided";

    // Defer the reply to the interaction to let the user know that the bot is processing their request.
    await interaction.deferReply();

    // Fetch the target user from the guild using their ID.
    const targetUser = await interaction.guild.members.fetch(targetUserId);

    // If the target user doesn't exist in the guild, inform the user and exit.
    if (!targetUser) {
      await interaction.editReply("That user doesn't exist in this server.");
      return;
    }

    // If the target user is the server owner, inform the user that they can't be banned and exit
    if (targetUserId === interaction.guild.ownerId) {
      await interaction.editReply(
        "You can't ban that user because they're the server owner."
      );
      return;
    }

    // Determine the highest role position of the target user, the user running the command, and the bot.
    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    // If the target user has the same or higher role than the user running the command, inform the user and exit.
    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "You can't ban that user because they have the same/higher role than you."
      );
      return;
    }

    // If the target user has the same or higher role than the bot, inform the user and exit.
    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I can't ban that user because they have the same role/higher role than me."
      );
      return;
    }

    // Attempt to ban the target user with the provided reason.
    try {
      await targetUser.ban({ reason });
      // Inform the user that the ban was successful.
      await interaction.editReply(
        `User ${targetUser} was banned\nReason: ${reason}`
      );
    } catch (error) {
      // Log any errors that occur during the ban process.
      console.log(`There was an error when banning: ${error}`);
    }
  },

  name: "ban",
  description: "Bans a members from this server.",
  //   devOnly: Boolean,
  //   testOnly: Boolean,
  options: [
    {
      name: "target-user",
      description: "The user you want to ban.",
      type: ApplicationCommandOptionType.Mentionable, //  Dữ liệu được nhập vào phải là một đối tượng có thể đề cập (mentionable), như người dùng hoặc vai trò.
      required: true, // Người dùng bắt buộc phải cung cấp.
    },
    {
      name: "reason",
      description: "The reason you want to ban.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
