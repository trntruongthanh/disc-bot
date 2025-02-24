const { devs, testServer } = require("../../../config.json");

const getLocalCommands = require("../../utils/getLocalCommands");

//Code này là một trình xử lý lệnh (command handler) cho bot Discord, được sử dụng để kiểm tra và thực thi các lệnh được gọi bởi người dùng.
module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) {
      return;
    }

    /*
      Kiểm tra điều kiện thực thi Chỉ dành cho nhà phát triển (Developer-only)
      
      Ý nghĩa:
      Nếu lệnh được đánh dấu là chỉ dành cho developer (devOnly: true), kiểm tra xem ID của người gọi lệnh có nằm trong danh sách developer (devs) không.
      Nếu không, trả lời rằng họ không được phép sử dụng lệnh này.
    */
    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        interaction.reply({
          content: "Only developers are allowed to run this command.",
          ephemeral: true,
        });
        return;
      }
    }
    
    /*
      Chỉ dùng trong máy chủ thử nghiệm (Test-only)
      Ý nghĩa:
      Nếu lệnh được đánh dấu là chỉ dành cho máy chủ thử nghiệm (testOnly: true), kiểm tra xem máy chủ hiện tại có phải là máy chủ thử nghiệm không (testServer).
      Nếu không, trả lời rằng lệnh không thể được thực thi ở đây.
    */
    if (commandObject.testOnly) {
      if (!(interaction.guild.id === testServer)) {
        interaction.reply({
          content: "This command cannot be run here.",
          ephemeral: true,
        });
        return;
      }
    }

    /*
      Kiểm tra quyền của người dùng
      Ý nghĩa:
      Nếu lệnh yêu cầu các quyền cụ thể từ người dùng (permissionsRequired):
      Lặp qua danh sách quyền và kiểm tra xem người gọi lệnh có đủ quyền không.
      Nếu thiếu quyền, trả lời rằng người dùng không đủ quyền.

      commandObject.permissionsRequired:
      Đây là thuộc tính của đối tượng commandObject. Nó thường là một mảng chứa danh sách các quyền cần thiết để thực thi lệnh.
      Ví dụ: commandObject.permissionsRequired = [PermissionFlagsBits.Administrator].
      
      Dấu ?. (Optional Chaining):
      Dùng để đảm bảo rằng permissionsRequired tồn tại trước khi truy cập thuộc tính length.
      Nếu permissionsRequired là undefined hoặc null, việc kiểm tra permissionsRequired?.length sẽ không gây lỗi mà trả về undefined.
      
      length:
      Trả về số lượng phần tử trong mảng permissionsRequired.
      
      Kết hợp:
      Điều kiện if chỉ trả về true khi:
      permissionsRequired tồn tại và
      permissionsRequired có ít nhất một phần tử (tức là length > 0).

      interaction.member
      Đại diện cho thành viên trong server Discord đã kích hoạt lệnh.
      Là một đối tượng chứa thông tin về thành viên, như vai trò, quyền hạn, tên, v.v.

      2. .permissions
      Thuộc tính của interaction.member chứa các quyền hiện tại mà thành viên đó có trong server.
      Dạng dữ liệu: Một đối tượng PermissionsBitField, cho phép kiểm tra từng quyền cụ thể.

      3. .has(permission)
      Là một phương thức của PermissionsBitField.
      Mục đích: Kiểm tra xem thành viên có quyền cụ thể hay không.
      Tham số: permission, là một giá trị từ PermissionFlagsBits (ví dụ: PermissionFlagsBits.Administrator, PermissionFlagsBits.ManageMessages).
      Trả về:
      true: Nếu thành viên có quyền.
      false: Nếu thành viên không có quyền.

      4. if (!interaction.member.permissions.has(permission))
      Sử dụng toán tử phủ định (!) để kiểm tra xem thành viên không có quyền cần thiết.
      Nếu thành viên không có quyền, điều kiện sẽ được thực thi.

      ephemeral:
      Nếu true, tin nhắn chỉ hiển thị với người dùng đã kích hoạt lệnh và ẩn với những người khác.
    */
    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: "Not enough permissions to run this command.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    /*
      Kiểm tra quyền của bot
      Ý nghĩa:
      Nếu lệnh yêu cầu các quyền cụ thể từ bot (botPermissions):
      Lặp qua danh sách quyền và kiểm tra xem bot có đủ quyền không.
      Nếu thiếu quyền, trả lời rằng bot không có đủ quyền.
    */
    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;

        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: "I don't have enough permissions.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
};
