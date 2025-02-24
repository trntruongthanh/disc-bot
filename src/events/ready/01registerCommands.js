const { testServer } = require("../../../config.json");

const getLocalCommands = require("../../utils/getLocalCommands");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands(); // kh cần truyền đối số vì vì trong định nghĩa của hàm, tham số exceptions đã được gán một giá trị mặc định là [].
    const applicationCommands = await getApplicationCommands(
      client,
      testServer
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      /*
        Là bộ đệm (cache) chứa danh sách các lệnh đã được tải xuống từ Discord API.

        await:
        Mặc dù cache là một bộ đệm cục bộ (không phải truy vấn API), nhưng do applicationCommands có thể sử dụng các phương thức bất đồng bộ (nếu không có sẵn trong cache), 
        việc sử dụng await đảm bảo lệnh hoàn thành trước khi tiếp tục.


        Mục đích: Kiểm tra xem lệnh cục bộ (local command) có tên name đã tồn tại trong Discord hay chưa.
        Nếu tồn tại (existingCommand không phải undefined):
        Có thể chỉnh sửa lệnh nếu cần (so sánh và đồng bộ hóa).
        Nếu không tồn tại (existingCommand là undefined): Đăng ký lệnh mới.
      */

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      /*
        Đoạn mã này chịu trách nhiệm xử lý việc đồng bộ hóa giữa các lệnh cục bộ (local commands) và các lệnh hiện tại trên Discord (application commands).

        Ngữ cảnh
        Lệnh cục bộ (localCommand): Đây là lệnh được định nghĩa trong mã của bạn. Nếu lệnh này có thuộc tính deleted và giá trị của nó là true, điều đó có nghĩa là bạn không muốn lệnh này xuất hiện hoặc hoạt động trên Discord nữa.
        Lệnh trên Discord (existingCommand): Đây là lệnh hiện đang tồn tại trên Discord. Nếu lệnh này vẫn còn, nó sẽ hiển thị trong giao diện người dùng hoặc có thể được kích hoạt, gây nhầm lẫn.

        Mục đích của đoạn mã
        Xóa lệnh không còn cần thiết: Khi một lệnh được đánh dấu là deleted trong mã nguồn, điều đó thể hiện rằng bạn không còn cần lệnh này trên Discord nữa.
        Đảm bảo đồng bộ hóa: Đoạn mã này giúp đảm bảo rằng trạng thái của lệnh trên Discord luôn khớp với lệnh trong mã của bạn. Nếu một lệnh cục bộ được gỡ bỏ (deleted), nó cũng phải được gỡ bỏ trên Discord.
      
        */

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑️ Deleted command "${name}".`);
          continue;
        }

        /*
          existingCommand: Lệnh đã tồn tại trên Discord (đã đăng ký).
          localCommand: Lệnh cục bộ (lưu trữ trong code của bạn).
        */

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(`🔁 Edited command "${name}".`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(
            `⏩ Skipping registering command "${name}" as it's set to delete.`
          );
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`👍 Registered command "${name}."`);
      }
    }
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
};
