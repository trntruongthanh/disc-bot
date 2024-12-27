/**
  choices
  Mô tả: Cung cấp danh sách các giá trị có sẵn để người dùng lựa chọn khi sử dụng lệnh.

  Loại: Mảng các đối tượng, mỗi đối tượng chứa:

  name: Tên hiển thị cho lựa chọn (chuỗi).
  value: Giá trị thực tế được gửi về máy chủ (chuỗi, số, hoặc boolean).
  Công dụng:

  Hạn chế giá trị đầu vào mà người dùng có thể cung cấp cho tùy chọn.
  Hiển thị danh sách thả xuống (dropdown) trong giao diện Discord khi người dùng gọi lệnh.

  required: Quy định tùy chọn bắt buộc hay không.
  choices: Cung cấp danh sách giá trị cố định mà người dùng có thể chọn.
  options: Tạo cấu trúc lệnh với các tùy chọn hoặc nhóm lệnh con.
*/

module.exports = {
  name: "ping",
  description: "Replies with the bot ping!",
  testOnly: true,
  // devOnly: Boolean,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {

    /*
      await interaction.deferReply();
      Mục đích: Hoãn lại phản hồi của bot để xử lý (thay vì trả lời ngay lập tức).
      Tác dụng: Gửi thông báo "đang xử lý" cho người dùng, giúp tránh việc lệnh bị hết thời gian chờ (timeout).
    
      const reply = await interaction.fetchReply();
      Mục đích: Lấy tin nhắn phản hồi gần nhất từ bot sau khi gọi deferReply.
      Tác dụng: Tin nhắn này sẽ được sử dụng để tính toán thời gian trễ (ping) giữa lúc lệnh được tạo và lúc bot gửi phản hồi.

      const ping = reply.createdTimestamp - interaction.createdTimestamp;
      Mục đích: Tính toán độ trễ giữa thời gian lệnh được tạo (interaction.createdTimestamp) và thời gian phản hồi của bot (reply.createdTimestamp).
      Tác dụng: Đo thời gian thực mà bot mất để xử lý lệnh và phản hồi người dùng

      interaction.editReply(...)
      Mục đích: Chỉnh sửa phản hồi đã hoãn lại (deferReply) để gửi kết quả cuối cùng cho người dùng.
      Nội dung phản hồi:
      Client ${ping}ms: Thời gian trễ giữa lúc lệnh được tạo và bot phản hồi.
      WebSocket: ${client.ws.ping}ms: Thời gian trễ kết nối WebSocket của bot với Discord.
      ========================================================================================
      Hoạt động tổng quát
      Khi người dùng nhập lệnh /ping, bot sẽ:
      Hoãn phản hồi (deferReply).
      Lấy tin nhắn phản hồi gần nhất từ bot (fetchReply).
      Tính toán độ trễ (ping) giữa thời gian người dùng gửi lệnh và thời gian bot phản hồi.
      Chỉnh sửa phản hồi để gửi kết quả cuối cùng.

      Tại sao cần deferReply?
      deferReply thông báo cho Discord rằng bot đã nhận được lệnh và đang xử lý, nhưng cần thêm thời gian để gửi phản hồi
      Discord yêu cầu bot phải phản hồi trong vòng 3 giây sau khi nhận lệnh. Nếu bot cần nhiều thời gian hơn để xử lý lệnh (ví dụ, gọi API hoặc thực hiện tính toán phức tạp), deferReply sẽ:
      Hoãn lại phản hồi: Gửi một trạng thái "đang xử lý" cho người dùng.
      Tránh timeout: Discord không đóng yêu cầu nếu bot đã gọi deferReply.
      
      Khi nào dùng deferReply?
      Khi lệnh yêu cầu thực thi lâu hơn 3 giây.
      Khi bạn muốn chỉnh sửa phản hồi sau đó bằng editReply.
    */
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;
    
    interaction.editReply(`Pong! Client ${ping}ms | WebSocket: ${client.ws.ping}ms`)
  },
};
