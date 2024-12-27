/*
fs: Module tích hợp của Node.js dùng để thao tác với hệ thống tệp, như đọc, ghi hoặc liệt kê nội dung thư mục.
path: Module tích hợp giúp xử lý đường dẫn tệp/thư mục.
*/
const fs = require("fs");
const path = require("path");

module.exports = (directory, foldersOnly = false) => {
  let fileNames = [];

  const files = fs.readdirSync(directory, { withFileTypes: true });

  /*
  Dirent:
  file.isDirectory(); true nếu là thư mục
  file.isFile(): true nếu là tệp
  file.isSymbolicLink(); true nếu là symbolic link
  isBlockDevice(): Kiểm tra xem mục có phải là thiết bị khối (block device).
  isCharacterDevice(): Kiểm tra xem mục có phải là thiết bị ký tự.
  isFIFO(): Kiểm tra xem mục có phải là FIFO (hàng đợi).
  isSocket(): Kiểm tra xem mục có phải là socket.


  Sử dụng { withFileTypes: true }:
  Khi bật tùy chọn này, các hàm sẽ trả về một mảng các đối tượng Dirent. Những đối tượng này chứa thông tin bổ sung về từng mục trong thư mục, bao gồm:
  Tên của mục (name).
  Các phương thức như .isFile(), .isDirectory(), .isSymbolicLink(), v.v.
  
  */


  for (const file of files) {
    const filePath = path.join(directory, file.name);     // const filePath = path.join(directory, file.name); giúp tạo ra đường dẫn đầy đủ cho từng mục (tệp hoặc thư mục) trong thư mục gốc.

    if (foldersOnly) {

      // true nếu là thư mục
      if (file.isDirectory()) {

        // console.log(`${file.name} là thư mục`);

        fileNames.push(filePath);
      }
    } else {

      // true nếu là tệp
      if (file.isFile()) {

        // console.log(`${file.name} là tệp`);

        fileNames.push(filePath);
      }
    }

  }

  return fileNames;
};
