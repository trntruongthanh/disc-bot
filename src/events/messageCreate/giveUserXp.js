const { Client, Message } = require("discord.js");

const Level = require("../../models/Level");
const calculateLevelXp = require("../../utils/calculateLevelXp");
const cooldowns = new Set();

/*
  Mục đích của file này
  Khi người dùng gửi tin nhắn, bot sẽ cấp XP cho họ.
  Nếu đạt đủ XP để lên cấp, bot sẽ thông báo họ đã lên cấp.
  Hạn chế spam bằng cooldown (mỗi người chỉ có thể nhận XP mỗi 60 giây).
  Lưu XP và cấp độ vào MongoDB bằng Mongoose.
*/

function getRandomXp(min, max) {
  min = Math.ceil(min); // Làm tròn lên để tránh số lẻ
  max = Math.floor(max); // Làm tròn xuống để tránh số lẻ
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *
 * @param {Client} client
 * @param {Message} message
 */

module.exports = async (client, message) => {
  /*
  !message.inGuild() → Nếu tin nhắn không trong server (VD: tin nhắn riêng tư), thì không làm gì.
  message.author.bot → Nếu tin nhắn đến từ bot khác, không cấp XP.
  cooldowns.has(message.author.id) → Nếu user đang bị cooldown, bỏ qua để ngăn spam XP. */
  if (
    !message.inGuild() ||
    message.author.bot ||
    cooldowns.has(message.author.id)
  )
    return;

  cooldowns.add(message.author.id);

  setTimeout(() => {
    cooldowns.delete(message.author.id); // Xóa cooldown sau 60 giây
  }, 60000);

  //  Tạo query để tìm user trong database
  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  };

  /*Tạo một số ngẫu nhiên từ 5 đến 15
    Mục đích: Không phải tin nhắn nào cũng nhận cùng một lượng XP, giúp hệ thống thú vị hơn.
  */
  const xpToGive = getRandomXp(5, 15);

  try {
    // Tìm user trong database
    const level = await Level.findOne(query); // MongoDB sẽ tìm trong database một bản ghi có cùng userId và guildId.

    // Nếu user đã có dữ liệu, cộng XP và kiểm tra lên cấp
    if (level) {
      // Cộng XP: Nếu user đã có dữ liệu, bot sẽ cộng thêm xpToGive.
      level.xp += xpToGive;

      /*
        Gọi calculateLevelXp(level.level) để lấy số XP cần cho cấp độ hiện tại.
        Nếu level.xp vượt quá số này, user lên cấp → tăng level lên 1, đặt lại xp = 0.
        Gửi tin nhắn chúc mừng trong kênh.
      */
      if (level.xp > calculateLevelXp(level.level)) {
        level.xp = 0;
        level.level += 1;

        message.channel.send(
          `${message.member} you have leveled up to level ${level.level}`
        );
      }

      await level.save().catch((err) => {
        console.log(`Error saving level: ${err}`);
        return;
      });
    }

    // if (!level)
    else {
      const newLevel = new Level({
        userId: message.author.id,
        guildId: message.guild.id,
        xp: xpToGive,
        level: 0,
      });

      await newLevel.save();

      cooldowns.add(message.author.id);

      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }
  } catch (error) {
    console.log(`Error giving xp: ${error}`);
  }
};
