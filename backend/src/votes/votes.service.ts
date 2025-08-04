import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vote, VoteDocument } from './vote.schema';
import { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VotesService {
  constructor(@InjectModel(Vote.name) private voteModel: Model<VoteDocument>) {}

  async create(createVoteDto: CreateVoteDto, userId: string): Promise<Vote> {
    const vote = new this.voteModel({
      ...createVoteDto,
      userId: new Types.ObjectId(userId),
      timestamp: new Date(createVoteDto.timestamp),
    });
    return await vote.save();
  }

  async findAll(userId?: string): Promise<Vote[]> {
    const query = userId ? { userId: new Types.ObjectId(userId) } : {};
    return await this.voteModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findByPostId(postId: string, userId?: string): Promise<Vote[]> {
    const query = userId ? { postId, userId: new Types.ObjectId(userId) } : { postId };
    return await this.voteModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findByUsername(username: string): Promise<Vote[]> {
    return await this.voteModel.find({ username }).sort({ createdAt: -1 }).exec();
  }

  async findBySubreddit(subreddit: string, userId?: string): Promise<Vote[]> {
    const query = userId ? { subreddit, userId: new Types.ObjectId(userId) } : { subreddit };
    return await this.voteModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getVoteStats(userId?: string): Promise<any> {
    const matchStage = userId ? { $match: { userId: new Types.ObjectId(userId) } } : { $match: {} };
    
    const stats = await this.voteModel.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalVotes: { $sum: 1 },
          upvotes: { $sum: { $cond: [{ $eq: ['$voteType', 'upvote'] }, 1, 0] } },
          downvotes: { $sum: { $cond: [{ $eq: ['$voteType', 'downvote'] }, 1, 0] } },
        }
      }
    ]);

    const subredditStats = await this.voteModel.aggregate([
      matchStage,
      { $group: { _id: '$subreddit', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const userStats = await this.voteModel.aggregate([
      matchStage,
      { $group: { _id: '$username', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      totalVotes: stats[0]?.totalVotes || 0,
      upvotes: stats[0]?.upvotes || 0,
      downvotes: stats[0]?.downvotes || 0,
      topSubreddits: subredditStats,
      topUsers: userStats
    };
  }
}
