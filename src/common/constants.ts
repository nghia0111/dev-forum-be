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
  ACCEPT_REQUEST = 'accept_request'
}

export enum ValidationErrorMessages {
  DISPLAY_NAME_LENGTH = 'Display name must be between 3 and 30 characters',
  DISPLAY_NAME_REQUIRE = 'Please enter a display name',

  PASSWORD_PATTERN = 'Password must be between 8 and 32 characters and not contain special characters',
  PASSWORD_REQUIRE = 'Please enter a password',
  PASSWORD_INVALID = 'Incorrect password',
  CONFIRMPASSWORD_INVALID = 'Confirm password does not match',

  EMAIL_INVALID = 'Invalid email address',
  EMAIL_REQUIRE = 'Please enter an email address',
  EMAIL_CONFLICT = 'Email address already exists',

  USER_NOT_FOUND = 'Email is not registered',

  FILE_INVALID = 'Invalid image, please check again',
  FILE_SIZE = 'Image size cannot exceed 10MB',

  TAGNAME_CONFLICT = 'Tag name already exists',
  TAGNAME_REQUIRE = 'Please enter a tag name',
  TAG_REQUIRE = 'Please add topic to the post',
  TAG_NOT_FOUND = 'Tag not found',

  TOPIC_INVALID = 'Invalid topic name',

  TITLE_REQUIRE = 'Please enter the post title',
  DESCRIPTION_REQUIRE = 'Please enter the post description',
  POST_NOT_FOUND = 'Post not found',
  POST_DELETE_CONFLICT = 'Cannot delete a post that has generated transactions',
  POST_UPDATE_CONFLICT = 'Cannot update a post that has generated transactions',
  UPDATE_UNAUTHORIZATION = 'Only the author can update the post',

  BOUNTY_INVALID = 'Invalid amount',
  BOUNTY_MIN = 'Minimum bounty is 10000VND',
  BOUNTY_NOT_ACCEPTABLE = 'Bounty applies only to bug-fixing posts',
  BOUNTY_REQUIRED = 'Bounty can only be requested for bounty-hanging posts',
  BOUNTY_MAX = 'Insufficient balance in the account',

  AMOUNT_MIN = 'Minimum deposit amount is 1 USD',
  AMOUNT_INVALID = 'Withdrawal amount cannot exceed the balance',

  COMMENT_NOT_EMPTY = 'Comment cannot be empty',
  COMMENT_NOT_FOUND = 'Comment not found',

  UNAUTHENTICATED = 'Please log in to use this feature',
  UNAUTHORIZED = 'Only the author can perform this action',

  ADMIN_REQUIRED = 'Only administrators are allowed access',
  ADMIN_UNBANNABLE = 'Cannot change the status of administrators',

  REPORT_NOT_FOUND = 'Report not found',

  NOTI_NOT_FOUND = 'Notification not found',

  TRANSACTION_NOT_FOUND = 'Transaction not found',
  TRANSACTION_STATUS_INVALID = 'Invalid transaction status',

  WITHDRAW_NOT_FOUND = 'Withdrawal request not found',

  REQUEST_STATUS_INVALID = 'Invalid request status',
  REQUEST_CONFLICT = 'There are still pending requests',
  REQUEST_CLOSED = 'Cannot send a connection request as the issue has been resolved',

  USER_BANNED = 'Your account has been suspended, please contact the development team for more details',

  ID_INVALID = 'Invalid ID',

  SCORE_INVALID = 'Rating must be between 1 star and 5 stars',
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
    case NotificationTypes.ACCEPT_REQUEST:
      return `${partnerName} đã chấp nhận yêu cầu kết nối của bạn`;
    default:
      return '';
  }
};
