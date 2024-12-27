/*
  là một module được sử dụng để so sánh hai lệnh Discord (một lệnh đã tồn tại và một lệnh cục bộ) để xem liệu chúng có khác nhau hay không.
*/

module.exports = (existingCommand, localCommand) => {
  /*
    existingChoices: Lựa chọn đã tồn tại.
    localChoices: Lựa chọn cục bộ.
  */

  // Kết quả: Trả về true nếu có sự khác biệt, false nếu giống nhau.
  const areChoicesDifferent = (existingChoices, localChoices) => {
    for (const localChoice of localChoices) {
      const existingChoice = existingChoices?.find(
        (choice) => choice.name === localChoice.name
      );

      if (!existingChoice) {
        return true;
      }

      if (localChoice.value !== existingChoice.value) {
        return true;
      }
    }
    return false;
  };

  // Kết quả: Trả về true nếu có sự khác biệt, false nếu giống nhau.
  const areOptionsDifferent = (existingOptions, localOptions) => {
    for (const localOption of localOptions) {
      const existingOption = existingOptions?.find(
        (option) => option.name === localOption.name
      );

      if (!existingOption) {
        return true;
      }

      if (
        localOption.description !== existingOption.description ||
        localOption.type !== existingOption.type ||
        (localOption.required || false) !== existingOption.required ||
        (localOption.choices?.length || 0) !==
          (existingOption.choices?.length || 0) ||
        areChoicesDifferent(
          localOption.choices || [],
          existingOption.choices || []
        )
      ) {
        return true;
      }
    }
    return false;
  };

  /*
    So sánh mô tả (description):
    Kiểm tra xem mô tả (description) của lệnh hiện có (existingCommand) và lệnh cục bộ (localCommand) có giống nhau không.
    Nếu khác, trả về true, nghĩa là có sự khác biệt.
    So sánh độ dài của danh sách tùy chọn (options):

    Kiểm tra xem số lượng tùy chọn (options) của lệnh hiện có và lệnh cục bộ có khác nhau không.
    Nếu khác, trả về true.
    Kiểm tra sự khác biệt giữa các tùy chọn (areOptionsDifferent):

    Gọi hàm areOptionsDifferent để kiểm tra chi tiết các tùy chọn.
    Nếu có bất kỳ tùy chọn nào khác nhau, trả về true.
  */

  /*
    Nếu bất kỳ điều kiện nào trả về true, nghĩa là lệnh có sự khác biệt.
    Nếu tất cả giống nhau, trả về false.
  */
  if (
    existingCommand.description !== localCommand.description ||
    existingCommand.options?.length !== (localCommand.options?.length || 0) ||
    areOptionsDifferent(existingCommand.options, localCommand.options || [])
  ) {
    return true;
  }

  return false;
};
