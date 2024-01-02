import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConnectRequestStatus,
  NotificationTypes,
  TransactionStatus,
  TransactionTypes,
  ValidationErrorMessages,
  generateMessage,
  generateNotiMessage
} from 'src/common/constants';
import { ConnectRequest } from 'src/schemas/connect-requests.schema';
import { Post } from 'src/schemas/posts.schema';
import { Transaction } from 'src/schemas/transactions.schema';
import { User } from 'src/schemas/users.schema';
import { SocketGateway } from '../socket/socket.gateway';
import { ConnectRequestDto } from './dto/connect-request.dto';

@Injectable()
export class ConnectRequestsService {
  constructor(
    @InjectModel(ConnectRequest.name)
    private connectRequestModel: Model<ConnectRequest>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(user: any, connectRequestDto: ConnectRequestDto) {
    const { postId, message } = connectRequestDto;
    const post = await this.postModel.findById(postId);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOT_FOUND);
    if (!post.bounty)
      throw new NotAcceptableException(ValidationErrorMessages.BOUNTY_REQUIRED);
    const existingTransaction = await this.transactionModel.findOne({
      post: postId,
      status: TransactionStatus.SUCCEEDED,
    });
    if (existingTransaction)
      throw new NotAcceptableException(ValidationErrorMessages.REQUEST_CLOSED);

    const existingRequest = await this.connectRequestModel.findOne({
      requester: user.userId,
      post: postId,
    });
    if (
      existingRequest &&
      existingRequest.status != ConnectRequestStatus.CANCELED
    )
      return;
    const processingRequest = await this.connectRequestModel.findOne({
      post: postId,
      status: ConnectRequestStatus.PROCESSING,
    });
    if (processingRequest) {
      await this.connectRequestModel.create({
        requester: user.userId,
        receiver: post.author,
        post: postId,
        status: ConnectRequestStatus.BLOCKING,
        message: message,
      });
    } else {
      await this.connectRequestModel.create({
        requester: user.userId,
        receiver: post.author,
        post: postId,
        message: message,
      });
    }
  }

  async acceptRequest(requestId: string, user: any) {
    const existingRequest = await this.connectRequestModel
      .findById(requestId)
      .populate('post', 'bounty')
      .populate('receiver', 'displayName avatar')
      .populate('requester', 'displayName');
    if (existingRequest.status != ConnectRequestStatus.PENDING)
      throw new NotAcceptableException(
        ValidationErrorMessages.REQUEST_STATUS_INVALID,
      );
    const processingRequest = await this.connectRequestModel.findOne({
      status: ConnectRequestStatus.PROCESSING,
    });
    if (processingRequest)
      throw new NotAcceptableException(
        ValidationErrorMessages.REQUEST_CONFLICT,
      );
    if (user.userId != existingRequest.receiver._id.toString())
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    existingRequest.status = ConnectRequestStatus.PROCESSING;
    await existingRequest.save();

    const amount = existingRequest.post.bounty;
    await Promise.all([
      this.transactionModel.create({
        user: user.userId,
        receiver: existingRequest.receiver._id.toString(),
        amount: amount,
        type: TransactionTypes.PAY,
        message: generateMessage(
          TransactionTypes.PAY,
          amount,
          undefined,
          existingRequest.requester.displayName,
        ),
        post: existingRequest.post,
      }),
      this.transactionModel.create({
        user: existingRequest.requester._id.toString(),
        amount: amount,
        type: TransactionTypes.RECEIVE,
        message: generateMessage(
          TransactionTypes.RECEIVE,
          amount,
          undefined,
          existingRequest.receiver.displayName,
        ),
        post: existingRequest.post,
      }),
      this.connectRequestModel.updateMany(
        { post: existingRequest.post, status: ConnectRequestStatus.PENDING },
        { status: ConnectRequestStatus.BLOCKING },
      ),
    ]);
    await this.socketGateway.createNotification(
      user.userId,
      existingRequest.requester._id.toString(),
      NotificationTypes.ACCEPT_REQUEST,
      generateNotiMessage(NotificationTypes.ACCEPT_REQUEST, existingRequest.receiver.displayName),
      existingRequest.receiver.avatar.secure_url
    );
  }

  async cancelRequest(requestId: string, user: any) {
    const existingRequest = await this.connectRequestModel.findById(requestId);
    if (existingRequest.status != ConnectRequestStatus.PROCESSING)
      throw new NotAcceptableException(
        ValidationErrorMessages.REQUEST_STATUS_INVALID,
      );
    if (user.userId != existingRequest.receiver.toString())
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    existingRequest.status = ConnectRequestStatus.CANCELED;
    await existingRequest.save();

    await Promise.all([
      this.transactionModel.updateMany(
        {
          post: existingRequest.post,
          status: TransactionStatus.PENDING,
        },
        { status: TransactionStatus.CANCELED },
      ),
      this.connectRequestModel.updateMany(
        { post: existingRequest.post, status: ConnectRequestStatus.BLOCKING },
        { status: ConnectRequestStatus.PENDING },
      ),
    ]);
  }

  async recognizeRequest(requestId: string, user: any) {
    const existingRequest = await this.connectRequestModel
      .findById(requestId)
      .populate('post', 'bounty');
    if (existingRequest.status != ConnectRequestStatus.PROCESSING)
      throw new NotAcceptableException(
        ValidationErrorMessages.REQUEST_STATUS_INVALID,
      );
    if (user.userId != existingRequest.receiver.toString())
      throw new UnauthorizedException(ValidationErrorMessages.UNAUTHORIZED);
    existingRequest.status = ConnectRequestStatus.SUCCEEDED;
    await existingRequest.save();

    await this.transactionModel.updateMany(
      { post: existingRequest.post, status: TransactionStatus.PENDING },
      { status: TransactionStatus.SUCCEEDED },
    );
    const receiver = await this.userModel.findById(existingRequest.requester);
    receiver.balance += existingRequest.post.bounty;
    await receiver.save();

    await this.postModel.findByIdAndUpdate(existingRequest.post, {
      isAnswered: true,
    });
  }

  async findAll(user: any) {
    return await this.connectRequestModel
      .find({ receiver: user.userId })
      .sort('-createdAt')
      .populate('requester', 'displayName avatar')
      .populate('post', 'title');
  }
}
