export enum VoteParentTypes {
  POST = 'Post',
  COMMENT = 'Comment',
}

export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
}

export enum UserStatus {
  BANNED = 'banned',
  ACTIVE = 'active',
}

export enum WithdrawStatus {
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  SUCCEEDED = 'succeeded'
}

export enum TransactionTypes {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  PAY = 'pay',
  RECEIVE = 'receive'
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

export enum NotificationTypes {
  CALL = 'call',
  COMMENT = 'comment',
  REPLY = 'reply',
  DELETE_COMMENT = 'delete_comment'
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
  TAG_NOT_FOUND = 'Không tìm thấy thẻ',

  TOPIC_INVALID = 'Tên chủ đề không hợp lệ',

  TITLE_REQUIRE = 'Vui lòng điền tiêu đề bài viết',
  DESCRIPTION_REQUIRE = 'Vui lòng điền mô tả bài viết',
  POST_NOT_FOUND = 'Không tìm thấy bài viết',
  POST_DELETE_CONFLICT = 'Không thể xoá bài viết đã tạo ra giao dịch',
  UPDATE_UNAUTHORIZATION = 'Chỉ có tác giả mới có thể cập nhật bài viết',

  BOUNTY_INVALID = 'Số tiền không hợp lệ',
  BOUNTY_MIN = 'Mức thưởng tối thiểu là 10000VND',
  BOUNTY_NOT_ACCEPTABLE = 'Tiền thưởng chỉ áp dụng với bài viết sửa lỗi',

  AMOUNT_MIN = 'Số tiền nạp tối thiểu là 1 USD',
  AMOUNT_INVALID = 'Số tiền rút không thể vượt quá số dư',

  COMMENT_NOT_EMPTY = 'Bình luận không được để trống',
  COMMENT_NOT_FOUND = 'Không tìm thấy bình luận',

  UNAUTHENTICATED = 'Vui lòng đăng nhập để sử dụng tính năng',
  UNAUTHORIZED = 'Chỉ có tác giả mới có thể thực hiện thao tác',

  ADMIN_REQUIRED = 'Chỉ có quản trị viên mới được phép truy cập',
  ADMIN_UNBANNABLE = 'Không thể thay đổi trạng thái của quản trị viên',

  REPORT_NOT_FOUND = 'Không tìm thấy báo cáo',

  WITHDRAW_NOT_FOUND = 'Không tìm thấy yêu cầu rút tiền',

  USER_BANNED = 'Tài khoản của bạn đã bị khoá, vui lòng liên hệ đội ngũ phát triển để biết thêm chi tiết',
}

export const defaultAvatar =
  'https://res.cloudinary.com/duxsgk7dr/image/upload/v1701434597/dev-forum/g81yowpmtsrxvhviao6a.jpg';
