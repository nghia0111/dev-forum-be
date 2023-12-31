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

export enum TransactionStatus {
  PENDING = 'pending',
  CANCELED = 'canceled',
  SUCCEEDED = 'succeeded',
}

export enum ConnectRequestStatus {
  PENDING = 'pending',
  CANCELED = 'canceled',
  PROCESSING = 'processing',
  BLOCKING = 'blocking',
  SUCCEEDED = 'succeeded',
}

export enum TransactionTypes {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  PAY = 'pay',
  RECEIVE = 'receive',
}

export enum TopicTypes {
  DISCUSS = 'discuss',
  NEWS = 'news',
  BUG = 'bug',
}

export enum ReportTypes {
  COMMENT = 'comment',
  USER = 'user',
}

export enum VoteTypes {
  UP_VOTE = 1,
  DOWN_VOTE = -1,
}

export enum NotificationTypes {
  CALL = 'call',
  COMMENT = 'comment',
  REPLY = 'reply',
  DELETE_COMMENT = 'delete_comment',
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
  POST_UPDATE_CONFLICT = 'Không thể cập nhật bài viết đã tạo ra giao dịch',
  UPDATE_UNAUTHORIZATION = 'Chỉ có tác giả mới có thể cập nhật bài viết',

  BOUNTY_INVALID = 'Số tiền không hợp lệ',
  BOUNTY_MIN = 'Mức thưởng tối thiểu là 10000VND',
  BOUNTY_NOT_ACCEPTABLE = 'Tiền thưởng chỉ áp dụng với bài viết sửa lỗi',
  BOUNTY_REQUIRED = 'Chỉ được gửi yêu cầu đối với bài viết được treo thưởng',
  BOUNTY_MAX = 'Không đủ số dư trong tài khoản',

  AMOUNT_MIN = 'Số tiền nạp tối thiểu là 1 USD',
  AMOUNT_INVALID = 'Số tiền rút không thể vượt quá số dư',

  COMMENT_NOT_EMPTY = 'Bình luận không được để trống',
  COMMENT_NOT_FOUND = 'Không tìm thấy bình luận',

  UNAUTHENTICATED = 'Vui lòng đăng nhập để sử dụng tính năng',
  UNAUTHORIZED = 'Chỉ có tác giả mới có thể thực hiện thao tác',

  ADMIN_REQUIRED = 'Chỉ có quản trị viên mới được phép truy cập',
  ADMIN_UNBANNABLE = 'Không thể thay đổi trạng thái của quản trị viên',

  REPORT_NOT_FOUND = 'Không tìm thấy báo cáo',

  NOTI_NOT_FOUND = 'Không tìm thấy thông báo',

  TRANSACTION_NOT_FOUND = 'Không tìm thấy giao dịch',
  TRANSACTION_STATUS_INVALID = 'Trạng thái giao dịch không hợp lệ',

  WITHDRAW_NOT_FOUND = 'Không tìm thấy yêu cầu rút tiền',

  REQUEST_STATUS_INVALID = 'Trạng thái yêu cầu không hợp lệ',
  REQUEST_CONFLICT = 'Vẫn còn yêu cầu đang được xử lý',
  REQUEST_CLOSED = 'Không thể gửi yêu cầu kết nối do vấn đề đã được giải quyết',

  USER_BANNED = 'Tài khoản của bạn đã bị khoá, vui lòng liên hệ đội ngũ phát triển để biết thêm chi tiết',

  ID_INVALID = 'Id không hợp lệ',

  SCORE_INVALID = 'Điểm đánh giá phải từ 1 sao đến 5 sao',
}

export const defaultAvatar =
  'https://res.cloudinary.com/duxsgk7dr/image/upload/v1701434597/dev-forum/g81yowpmtsrxvhviao6a.jpg';

export const generateMessage = (
  type: TransactionTypes,
  amount: number,
  paypalEmail?: string,
  partnerName?: string,
) => {
  const formatedAmount = amount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  switch (type) {
    case TransactionTypes.DEPOSIT:
      return `Bạn đã nạp ${formatedAmount} VND vào Dev Forum`;
    case TransactionTypes.WITHDRAW:
      return `Bạn đã yêu cầu rút ${formatedAmount} VND đến tài khoản Paypal ${paypalEmail}`;
    case TransactionTypes.PAY:
      return `Bạn đã gửi ${formatedAmount} VND cho ${partnerName}`;
    case TransactionTypes.RECEIVE:
      return `Bạn đã nhận ${formatedAmount} VND từ ${partnerName}`;
    default:
      return '';
  }
};

export const generateNotiMessage = (
  type: NotificationTypes,
  partnerName?: string,
) => {
  switch (type) {
    case NotificationTypes.CALL:
      return `${partnerName} đã mời bạn tham gia một cuộc họp`;
    case NotificationTypes.COMMENT:
      return `${partnerName} đã bình luận bài viết của bạn`;
    case NotificationTypes.REPLY:
      return `${partnerName} đã trả lời bình luận của bạn`;
    case NotificationTypes.DELETE_COMMENT:
      return `Bình luận của bạn đã bị xoá do vi phạm tiêu chuẩn cộng đồng`;
    default:
      return '';
  }
};
