require("dotenv").config();
const { Client, GatewayIntentBits, IntentsBitField } = require("discord.js");

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

*/

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
});

client.on('interactionCreate', (interaction) => {

  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (interaction.commandName === 'hey') {
    interaction.reply('hey!')
  } 

  if (interaction.commandName === 'ping') {
    interaction.reply('pong!')
  } 
})

// client.on("messageCreate", (message) => {
//   if (message.author.bot) {
//     return;
//   }

//   if (message.content === "hello") { 
//     message.reply("hello!");
//   }
// });

client.login(process.env.TOKEN);
