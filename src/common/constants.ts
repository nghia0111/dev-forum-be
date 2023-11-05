export enum CommentParentTypes {
  ANSWER = 'Answer',
  POST = 'Post',
}

export enum VoteParentTypes {
  ANSWER = 'Answer',
  POST = 'Post',
  COMMENT = 'Comment',
}

export enum TopicTypes {
  DISCUSS = 'discuss',
  NEWS = 'news',
  BUG = 'bug',
}

export enum VoteTypes {
  UP_VOTE = 1,
  DOWN_VOTE = -1,
}

export enum ValidationErrorMessages {
  DISPLAY_NAME_LENGTH = 'Tên hiển thị phải từ 3 - 30 ký tự',
  DISPLAY_NAME_REQUIRE = 'Vui lòng điền tên hiển thị',

  PASSWORD_PATTERN = 'Mật khẩu phải từ 8 - 32 ký tự và không chứa ký tự đặc biệt',
  PASSWORD_REQUIRE = 'Vui lòng điền mật khẩu',
  PASSWORD_INVALID = 'Mật khẩu không chính xác',
  CONFIRMPASSWORD_INVALID = 'Mật khẩu xác nhận không trùng khớp',

  EMAIL_INVALID = 'Địa chỉ email không hợp lệ',
  EMAIL_REQUIRE = 'Vui lòng nhập địa chỉ email',
  EMAIL_CONFLICT = 'Địa chỉ email đã tồn tại',

  USER_NOT_FOUND = 'Email chưa được đăng ký',

  FILE_INVALID = 'Ảnh không hợp lệ, vui lòng kiểm tra lại',
  FILE_SIZE = 'Dung lượng ảnh không thể vượt quá 10MB',

  TAGNAME_CONFLICT = 'Tên thẻ đã tồn tại',
  TAGNAME_REQUIRE = 'Vui lòng điền tên thẻ',
  TAG_REQUIRE = 'Vui lòng thêm chủ đề cho bài viết',
  TAG_NOTFOUND = 'Không tìm thấy thẻ',

  TITLE_REQUIRE = 'Vui lòng điền tiêu đề bài viết',
  DESCRIPTION_REQUIRE = 'Vui lòng điền mô tả bài viết',
  POST_NOTFOUND = 'Không tìm thấy bài viết',
  POST_DELETE_CONFLICT = 'Không thể xoá bài viết đã tạo ra giao dịch',
  UPDATE_UNAUTHORIZATION = 'Chỉ có tác giả mới có thể cập nhật bài viết',

  BOUNTY_INVALID = 'Số tiền không hợp lệ',
  BOUNTY_MIN = 'Mức thưởng tối thiểu là 10000VND',
  BOUNTY_NOT_ACCEPTABLE = 'Tiền thưởng chỉ áp dụng với bài viết sửa lỗi'
}
