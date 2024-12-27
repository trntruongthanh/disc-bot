const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exceptions = []) => {
  let localCommands = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObject = require(commandFile);

      /*
        Mục đích: Bỏ qua các lệnh nằm trong danh sách ngoại lệ (exceptions).
        Khi đúng: Lệnh hiện tại bị bỏ qua, không được xử lý thêm.
        Khi sai: Lệnh được thêm vào danh sách để xử lý tiếp.
      */
      if (exceptions.includes(commandObject.name)) {
        continue;
      }

      localCommands.push(commandObject);
    }
  }

  return localCommands;
};
