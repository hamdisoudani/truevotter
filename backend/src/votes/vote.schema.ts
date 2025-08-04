import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type VoteDocument = Vote & Document;

@Schema({ timestamps: true })
export class Vote {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  postTitle: string;

  @Prop({ required: true })
  postUrl: string;

  @Prop({ required: true })
  subreddit: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, enum: ['upvote', 'downvote', 'none'] })
  voteType: 'upvote' | 'downvote' | 'none';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  userAgent?: string;

  @Prop()
  ipAddress?: string;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
