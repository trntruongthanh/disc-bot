const path = require("path");

const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
  /*
  __dirname
  __dirname: Thư mục chứa tệp hiện tại
  Đây là một biến toàn cục trong Node.js.
  Nội dung: Trả về đường dẫn tuyệt đối (absolute path) tới thư mục chứa tệp hiện tại (tệp đang thực thi mã này).

  ".."
  "..": Đi lên thư mục cha
  trỏ tới thư mục cha.
  path.join(__dirname, ".."): E:\ThanhTran\Workspace\Discord Bot Project\src
  Dấu ".." là ký hiệu đường dẫn để chỉ thư mục cha (parent directory).
  Khi sử dụng trong path.join(__dirname, ".."), nó sẽ chuyển từ thư mục hiện tại (thư mục chứa tệp) lên một cấp.

  "events": Thêm thư mục con events

  Quy trình:
  Bắt đầu từ thư mục chứa tệp hiện tại (__dirname).
  Đi lên một cấp (..).
  Thêm tên thư mục events.
  
  */

  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true); //  sử dụng trong hàm path.join() để xây dựng một đường dẫn đầy đủ (absolute path) tới thư mục events

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);

    eventFiles.sort((a, b) => a > b);

    /*
      Thay thế tất cả dấu \ (backslash) thành / (slash).
      Lý do: Trên Windows, đường dẫn file sử dụng dấu \. Để xử lý đồng nhất (đa nền tảng), dấu \ được chuyển thành /.
    */
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop(); // .split("/"):Tách chuỗi đường dẫn thành mảng các phần tử (theo dấu /).

    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);   // Ý nghĩa:Tải nội dung của từng tệp sự kiện. Kỳ vọng: Mỗi tệp sự kiện xuất ra (export) một hàm xử lý.

        await eventFunction(client, arg);
      }
    });
  }
};
