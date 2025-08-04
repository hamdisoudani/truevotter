import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel({
      ...createUserDto,
      lastLogin: new Date(),
    });
    const savedUser = await user.save();
    return this.excludePassword(savedUser.toObject());
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => this.excludePassword(user.toObject()));
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.excludePassword(user.toObject()) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async updateLastLogin(id: string): Promise<User | null> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    ).exec();
    return user ? this.excludePassword(user.toObject()) : null;
  }

  async updateRedditInfo(id: string, redditUsername: string, redditId: string): Promise<User | null> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { redditUsername, redditId },
      { new: true }
    ).exec();
    return user ? this.excludePassword(user.toObject()) : null;
  }

  private excludePassword(user: any): User {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
