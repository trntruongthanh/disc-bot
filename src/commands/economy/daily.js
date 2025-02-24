const { Client, Interaction } = require("discord.js");
const User = require("../../models/User");

const dailyAmount = 1000;

module.exports = {

  name: "daily",
  description: "Collect your dailies!",

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    /*
      interaction.inGuild() kiểm tra xem lệnh có được thực hiện trong một server Discord hay không.
      Nếu không phải trong server (VD: tin nhắn riêng với bot), bot sẽ phản hồi với tin nhắn "You can only run this command inside a server." và ephemeral: true (chỉ người dùng gọi lệnh mới thấy tin nhắn này).
    */

    if (!interaction.inGuild()) {
      interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }

    try {
      //  Lệnh này trì hoãn phản hồi của bot, giúp tránh lỗi "The application did not respond" nếu truy vấn mất nhiều thời gian.
      await interaction.deferReply();

      /*  
        Tạo query để tìm người dùng trong cơ sở dữ liệu dựa trên userId (ID của người dùng) và guildId (ID của server).
        Tìm kiếm trong MongoDB bằng User.findOne(query). Nếu người dùng đã tồn tại trong database, user sẽ chứa thông tin tài khoản của họ. */
      const query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);

      if (user) {

        // const lastDailyDate = user.lastDaily.toDateString();       // Ngày nhận thưởng lần cuối.
        // const currentDate = new Date().toDateString();             // Ngày hiện tại.
        
        const lastDaily = user.lastDaily.getTime();                   // timestamp (số mili-giây từ 01/01/1970 UTC).
        const now = Date.now();                                       // lấy thời gian hiện tại dưới dạng timestamp (cũng là số mili-giây từ 01/01/1970).
        
        /*
          24 * 60 = 1440 (phút trong một ngày)
          1440 * 60 = 86400 (giây trong một ngày)
          86400 * 1000 = 86,400,000 mili-giây
          
          1000 - Số mili-giây trong một giây
          86,400,000 mili-giây (24 giờ)
        */

        // lastDailyDate === currentDate
        if (now - lastDaily < 24 * 60 * 60 * 1000) {

          // Nếu chưa đủ 24 giờ

          /*
            remainingTime % (60 * 60 * 1000): Phần này là phép chia lấy dư (modulo). Nó sẽ trả về số mili-giây còn lại sau khi đã tính hết số giờ.
            remainingTime % (60 * 60 * 1000) là số mili-giây còn lại trong phần chưa đủ một giờ.
            (60 * 1000): Sau khi lấy dư, chúng ta chia phần dư này cho số mili-giây trong một phút (60 giây * 1000 mili-giây) để có được số phút còn lại.

            Số mili-giây trong một giờ là 3,600,000 mili-giây.
            Số dư của remainingTime % (60 * 60 * 1000) là:

            85,391,414 % 3,600,000 = 391,414

            remainingTime = 85,391,414 mili-giây
            remainingTime % (60 * 60 * 1000) = 85,391,414 % 3,600,000 = 391,414 mili-giây
            391,414 / (60 * 1000) = 391,414 / 60,000 = 6.52 phút
            Math.floor(6.52) = 6 phút

          */
          const remainingTime = 24 * 60 * 60 * 1000 - (now - lastDaily);                            // Tính thời gian còn lại 
          const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));                      // Số giờ còn lại làm tròn xuống.   Chia tổng thời gian còn lại (remainingTime) cho số mili-giây trong một giờ (60 phút * 60 giây * 1000 mili-giây).
          const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));    // Số phút còn lại làm tròn xuống.

          interaction.editReply(
            `You must wait ${remainingHours} hours ${remainingMinutes} minutes to receive your reward!`
          );
          return;
        }

        user.lastDaily = new Date();                // Nếu chưa nhận thưởng, cập nhật user.lastDaily thành ngày hiện tại.
      } else {

        /*  
          Nếu user === null (nghĩa là chưa có trong database), tạo một tài khoản mới với 
          userId, guildId lấy từ query.
          lastDaily là ngày hiện tại.
        */
        user = new User({
          ...query,
          lastDaily: new Date(),
        });
      }

      user.balance += dailyAmount;

      await user.save();

      interaction.editReply(
        `${dailyAmount} was added to your balance. Your new balance is ${user.balance}`
      );
    } catch (error) {
      console.log(`Error with /daily: ${error}`);
    }
  },
};
