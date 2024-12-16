require("dotenv").config();

// REST: Là một lớp (class) trong thư viện discord.js, giúp thực hiện các yêu cầu REST API đến Discord.
// Routes: Một đối tượng cung cấp các hàm giúp xây dựng đường dẫn (URL) cho các endpoint REST API, chẳng hạn như đường dẫn để đăng ký lệnh.
const { REST, Routes } = require("discord.js");

// Tạo danh sách các lệnh (commands) cần đăng ký
const commands = [
  {
    name: "hey",
    description: "Replies with hey!",
  },
  {
    name: "ping",
    description: "pong!",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    /*
      Nó nhận 2 tham số chính:
      applicationId: ID ứng dụng của bot (được tìm thấy trong Discord Developer Portal).
      guildId (tùy chọn): ID của guild nơi các lệnh này sẽ được đăng ký. Nếu không có guildId, lệnh sẽ được đăng ký trên toàn cục.

      https://discord.com/api/v10/applications/{applicationId}/guilds/{guildId}/commands

      các endpoint:
      Đăng ký lệnh slash (application commands).
      Quản lý tin nhắn.
      Quản lý người dùng và vai trò.

    */

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
      body: commands,
    });

    console.log("Slash commands were registered successfully");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
