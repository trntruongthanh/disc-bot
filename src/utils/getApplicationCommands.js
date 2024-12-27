/*
  GuildManager.fetch
  GuildApplicationCommandManager
  ApplicationCommandManager
  Client
  Guild
  ApplicationCommandManager

  Tài liệu bổ sung
  Lớp Client: Client
  Quản lý Guilds: GuildManager
  Quản lý lệnh: ApplicationCommandManager

*/
module.exports = async (client, guildId) => {
  let applicationCommands;

  if (guildId) {
    const guild = await client.guilds.fetch(guildId); // Lấy thông tin server (guild) dựa trên ID

    applicationCommands = guild.commands; // Lấy danh sách các lệnh chỉ áp dụng cho server này (lệnh cục bộ - guild commands).
  } else {
    applicationCommands = await client.application.commands; // Lấy danh sách các lệnh toàn cục (global commands), áp dụng cho mọi server mà bot tham gia.
  }

  applicationCommands.fetch(); // thực hiện truy vấn API Discord để lấy danh sách lệnh đầy đủ, đảm bảo dữ liệu được cập nhật và chính xác.

  return applicationCommands;
};
