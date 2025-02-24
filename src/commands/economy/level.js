const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require("discord.js");

const calculateLevelXp = require("../../utils/calculateLevelXp");

const { Font, RankCardBuilder } = require("canvacord");

const Level = require("../../models/Level");

// console.log(RankCardBuilder);
// console.log(Object.getOwnPropertyNames(RankCardBuilder.prototype));   // các phương thức có sẵn trong RankCardBuilder:
/*
  Trả về ID của người dùng đã thực hiện lệnh trong server.
  interaction.member là một đối tượng GuildMember, đại diện cho người gọi lệnh trong server hiện tại.
  interaction.member.id là một chuỗi chứa ID của người gọi lệnh.

  Tìm kiếm và lấy thông tin chi tiết về một thành viên trong server dựa trên ID.
  fetch(targetUserId) sẽ truy vấn dữ liệu từ Discord API nếu thông tin chưa có sẵn trong bộ nhớ cache của bot.
  Trả về một Promise, do đó cần await để đợi kết quả.
  Kết quả là một đối tượng GuildMember, có nhiều thông tin hơn chỉ ID.
*/

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

    /*
      Tóm tắt:
      deferReply(): Hoãn trả lời để bot có thể xử lý lâu dài, tránh việc phản hồi ngay lập tức.
      mentionedUserId: Kiểm tra nếu người gọi lệnh có mention một người dùng, và lấy ID của người dùng đó.
      targetUserId: Nếu không mention người dùng, sử dụng ID của người gọi lệnh.
      targetUserObj: Truy xuất đối tượng GuildMember của người dùng mục tiêu từ server.
    */

    // deferReply() là một phương thức trong Discord.js được sử dụng khi bot cần thời gian để xử lý lệnh nhưng vẫn muốn báo cho người dùng biết rằng bot đang làm việc và chưa trả lời ngay lập tức.
    await interaction.deferReply();

    const mentionedUserId = interaction.options.get("target-user")?.value;

    /*
      const targetUserId = mentionedUserId || interaction.member.id;
      mentionedUserId || interaction.member.id: Dòng này sẽ xác định ID của người dùng mục tiêu (người dùng mà lệnh sẽ kiểm tra cấp độ).
      Nếu người gọi lệnh đã mention một người dùng (có mentionedUserId), thì sẽ sử dụng ID của người đó.
      Nếu không, sẽ sử dụng ID của chính người gọi lệnh (interaction.member.id), tức là ID của người đã thực hiện lệnh trong server (guild).
      Đây là cách để xác định người dùng mà bot sẽ kiểm tra cấp độ, tùy thuộc vào việc người gọi có mention ai hay không.
    */
    const targetUserId = mentionedUserId || interaction.member.id;

    /*
      interaction.guild.members.fetch(targetUserId): Đây là một hành động bất đồng bộ dùng để lấy đối tượng GuildMember cho người dùng có ID targetUserId trong server (guild) hiện tại.
      guild.members.fetch() trả về một Promise và do đó cần phải dùng await để đợi kết quả.
      Kết quả trả về là một đối tượng GuildMember, chứa nhiều thông tin chi tiết về người dùng trong server, ví dụ như tên người dùng, trạng thái, vai trò, và các thuộc tính khác.
      targetUserObj: Đây là đối tượng GuildMember của người dùng mà bạn đang muốn lấy thông tin (có thể là người gọi lệnh hoặc người được mention).
    */
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    /*
      Level.findOne({...}): Truy vấn MongoDB để tìm một tài liệu (document) trong bảng Level khớp với điều kiện được cung cấp.
      Điều kiện tìm kiếm:
      userId: targetUserId: Tìm cấp độ của người dùng có ID targetUserId (ID của người được đề cập hoặc người gọi lệnh).
      guildId: interaction.guild.id: Đảm bảo chỉ lấy dữ liệu trong server mà lệnh được chạy.
      await: Vì truy vấn là một thao tác bất đồng bộ, await đảm bảo bot chờ lấy dữ liệu trước khi tiếp tục.
      👉 Nếu người dùng đã từng tích lũy XP và cấp độ trong server, biến fetchedLevel sẽ chứa thông tin của họ.
    */
    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
          : "You don't have any levels yet. Chat a little more and try again."
      );
      return;
    }

    /*
      Tìm tất cả bản ghi (document) trong MongoDB thuộc về server (guildId).
      guildId: interaction.guild.id lọc kết quả sao cho chỉ lấy dữ liệu của server (guild) hiện tại.  
      .select("userId level xp")	✅	Chỉ lấy userId, level, xp
      .select("-_id -xp")	✅	Loại _id và xp, giữ tất cả trường khác
      .select("-_id userId level xp")	✅	Loại _id, giữ userId, level, xp
      .select("-_id userId -xp")	❌	Không thể vừa chọn userId vừa loại xp
    */
    let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
      "-_id userId level xp"
    );

    /*
      Hàm .sort() trong JavaScript dùng để sắp xếp một mảng. Nó nhận vào một hàm so sánh compareFunction(a, b), trong đó:
      Nếu trả về số âm (< 0) → a đứng trước b.
      Nếu trả về số dương (> 0) → b đứng trước a.
      Nếu trả về 0 → Giữ nguyên thứ tự.
      if-else với return 1 / -1
      a - b (tăng dần), b - a (giảm dần)
    */
    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    /*
      findIndex((lvl) => lvl.userId === targetUserId):
      Tìm vị trí của targetUserId trong danh sách allLevels.
      Chỉ số (index) bắt đầu từ 0, nên cần +1 để có thứ hạng thực tế.
    */
    let currentRank =
      allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    Font.loadDefault();

    const card = new RankCardBuilder()
      .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStatus(targetUserObj.presence?.status ?? "offline")
      .setUsername(targetUserObj.user.username)
      .setTextStyles({
        level: "LEVEL",
        xp: "EXP",
        rank: "RANK",
      })
      .setStyles({
        progressbar: {
          thumb: {
            style: {
              backgroundColor: "#FFD700",
            },
          },
        },
      });

    const image = await card.build({ format: "png" });
    const attachment = new AttachmentBuilder(image);
    interaction.editReply({ files: [attachment] });

    // console.log(card);
  },

  name: "level",
  description: "Shows your/someone's level.",
  options: [
    {
      name: "target-user",
      description: "The user whose level you want to see.",
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
