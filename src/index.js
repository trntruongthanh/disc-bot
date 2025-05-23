require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  IntentsBitField,
  EmbedBuilder,
  Embed,
  ActivityType,
} = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

const eventHandler = require("./handlers/eventHandler");

const mongoose = require("mongoose");

/*
Client: Kết nối bot của bạn với Discord API.
GatewayIntentBits: Định nghĩa intent mà bot cần sử dụng.
IntentsBitField: Một cách nâng cao để quản lý intent trong bot của bạn.

Sự khác biệt giữa GatewayIntentBits và IntentsBitField:
GatewayIntentBits: Dùng để khai báo intent dưới dạng các hằng số đơn giản.
IntentsBitField: Cung cấp thêm các phương thức và tiện ích để xử lý các intent phức tạp (khi cần kiểm tra, thêm/bớt intent).

=======================================================================================================================================

1. GatewayIntentBits:
GatewayIntentBits là một enum (tập hợp các hằng số) trong Discord.js, dùng để xác định Intent mà bot của bạn cần để hoạt động.

Intent là cách Discord quản lý dữ liệu mà bot có thể truy cập. Ví dụ:

GatewayIntentBits.Guilds: Cho phép bot nhận dữ liệu về các server (guild) mà nó tham gia.
GatewayIntentBits.GuildMessages: Cho phép bot nhận tin nhắn từ các server.
GatewayIntentBits.MessageContent: Cho phép bot đọc nội dung tin nhắn (yêu cầu quyền hạn cao hơn).

2. IntentsBitField:
IntentsBitField là một công cụ khác để quản lý và kiểm tra các intent.
Nó cung cấp các phương thức để tạo hoặc kiểm tra các intent phức tạp. 


setActivity:
Chỉ dùng để thiết lập hoạt động (Activity) của bot, như "Playing", "Listening", "Watching", hoặc "Streaming".
Không thay đổi trạng thái (online, idle, dnd, invisible).

setPresence:
Toàn diện hơn, vì nó cho phép thay đổi cả hoạt động và trạng thái của bot cùng lúc.

*/

//==========================================================================================

(async () => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to DB.");

    eventHandler(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

let activities = [
  {
    name: "Live Coding",
    type: ActivityType.Streaming,
  },
  {
    name: "Spotify",
    type: ActivityType.Listening,
  },
  {
    name: "YouTube Music",
    type: ActivityType.Listening,
  },
  {
    name: "/help",
    type: ActivityType.Listening,
  },
  {
    name: "YouTube Videos",
    type: ActivityType.Watching,
  },
  {
    name: "Coding with Discord.js",
    type: ActivityType.Playing,
  },
];

client.on("ready", (c) => {
  // const tenMinutes = 1 * 60 * 1000; // 10 phút = 10 * 60 * 1000 miligiây

  // setInterval(() => {
  //   let random = Math.floor(Math.random() * activities.length);

  //   client.user.setPresence({
  //     activities: [activities[random]],     // Thiết lập hoạt động
  //     status: "dnd",                        // Các giá trị: "online", "idle", "dnd", "invisible"
  //   });
  // }, 15000);

  client.user.setPresence({
    activities: [activities[3]], // Hoạt động ban đầu
    status: "idle", // Trạng thái mặc định
  });
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (interaction.commandName === "add") {
    const num1 = interaction.options.get("first-number")?.value;
    const num2 = interaction.options.get("second-number")?.value;

    interaction.reply(`The sum is ${num1 + num2}`);
  }

  // ======================== EMBED LINK ==========================================

  if (interaction.commandName === "embed") {
    const embed = new EmbedBuilder()
      .setTitle("Embed title")
      .setDescription("This is an embed description")
      .setColor("Random")
      .addFields(
        { name: "Regular field title", value: "Some value here" },
        { name: "\u200B", value: "\u200B" },
        { name: "Inline field title", value: "Some value here", inline: true },
        { name: "Inline field title", value: "Some value here", inline: true }
      )
      .addFields({
        name: "Inline field title",
        value: "Some value here",
        inline: true,
      })
      .setTimestamp()
      .setFooter({ text: "This is an embed footer" });

    interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "hey") {
    interaction.reply("hey!");
  }
});

//=====================================================================================

client.on("messageCreate", (message) => {
  if (message.content === "embed") {
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("Embed title")
      .setDescription("This is an embed description")
      .addFields(
        {
          name: "Field title,",
          value: "Some random value",
          inline: true,
        },
        {
          name: "2nd Field title,",
          value: "Some random value",
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({ text: "This is an embed footer" });
    message.channel.send({ embeds: [embed] });
  }
});

//==========================Send-message=======================================================

client.on("interactionCreate", async (interaction) => {
  try {

    // Kiểm tra xem sự kiện có phải là nút bấm (Button) không. Nếu không thì bỏ qua.
    if (!interaction.isButton()) return; 

    /*
      Trì hoãn phản hồi lại cho người dùng (tránh bị lỗi timeout).
      ephemeral: true nghĩa là chỉ người bấm mới thấy thông báo, người khác không thấy.
    */
    await interaction.deferReply({ ephemeral: true });

    // Dựa vào customId của nút (trùng với role.id trong file cũ), tìm vai trò tương ứng trong server.
    const role = interaction.guild.roles.cache.get(interaction.customId);

    // Nếu không tìm thấy role → trả lời báo lỗi và kết thúc.
    if (!role) {
      interaction.editReply({
        content: "I couldn't find a role",
      });

      return;
    }

    const hasRole = interaction.member.roles.cache.has(role.id); // Kiểm tra xem người dùng đã có role đó chưa.

    /*
      nếu đã có: 
      Gỡ role đó khỏi người dùng.
      Trả lời xác nhận đã gỡ.
    */
    if (hasRole) {
      await interaction.member.roles.remove(role);
      await interaction.editReply(`The role ${role} has been removed`);
      return;
    }

    /*
      Nếu chưa có 
      Thêm role vào cho người dùng.
      Trả lời xác nhận đã thêm.
    */
    await interaction.member.roles.add(role);
    await interaction.editReply(`The role ${role} has been added`);
  } catch (error) {
    console.log(error);
  }
});

//==============================================================================================================
client.on("messageCreate", (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content === "hello") {
    message.reply("hello!");
  }
});
