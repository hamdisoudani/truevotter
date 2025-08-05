import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  id?: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  redditUsername?: string;

  @Prop()
  redditId?: string;

  @Prop()
  redditAvatarUrl?: string;

  @Prop()
  redditKarma?: number;

  @Prop()
  redditAccountCreated?: Date;

  @Prop()
  redditVerified?: boolean;

  @Prop()
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
