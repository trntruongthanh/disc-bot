/*
  Import các lớp cần thiết từ thư viện discord.js:
  Client: Tạo một client bot.
  IntentsBitField: Chỉ định quyền truy cập dữ liệu.
  ActionRowBuilder, ButtonBuilder, ButtonStyle: Dùng để tạo các nút trong tin nhắn.
*/

require("dotenv").config();
const {
  Client,
  IntentsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");


/*
  Các intents giúp bot có quyền:
  Xem các guild (server).
  Truy cập thông tin thành viên.
  Đọc tin nhắn trong kênh.
  Truy cập nội dung tin nhắn.
*/
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const roles = [
  {
    id: "1318467424802050080",
    label: "Green",
  },
  {
    id: "1318467524257513492",
    label: "Pink",
  },
  {
    id: "1318467961069113398",
    label: "Yellow",
  },
];

client.on("ready", async (c) => {
  try {
    const channel = await client.channels.cache.get("1316983665984536638");

    if (!channel) return;

    const row = new ActionRowBuilder();

    roles.forEach((role) => {
      row.components.push(
        new ButtonBuilder()
          .setCustomId(role.id)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Primary)
      );
    });

    await channel.send({
      content: "Claim or remove a role below.",
      components: [row],
    });

    process.exit();
  } catch (error) {
    console.log(error);
  }
});

client.login(process.env.TOKEN);
