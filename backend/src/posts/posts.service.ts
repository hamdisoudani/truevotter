import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto, ownerId: string): Promise<Post> {
    const post = new this.postModel({
      ...createPostDto,
      ownerId: new Types.ObjectId(ownerId),
    });
    return await post.save();
  }

  async findByOwner(ownerId: string): Promise<Post[]> {
    return await this.postModel
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPostId(postId: string): Promise<Post | null> {
    return await this.postModel.findOne({ postId }).exec();
  }

  async toggleTracking(postId: string, ownerId: string): Promise<Post | null> {
    const post = await this.postModel
      .findOne({ postId, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (!post) return null;

    post.isTracking = !post.isTracking;
    return await post.save();
  }

  async remove(postId: string, ownerId: string): Promise<boolean> {
    const result = await this.postModel
      .deleteOne({ postId, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    return result.deletedCount > 0;
  }

  async isOwner(postId: string, ownerId: string): Promise<boolean> {
    const post = await this.postModel
      .findOne({ postId, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    return !!post;
  }

  async isTracked(postId: string): Promise<boolean> {
    const post = await this.postModel.findOne({ postId, isTracking: true });
    return !!post;
  }
}
