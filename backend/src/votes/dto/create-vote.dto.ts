import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class CreateVoteDto {
  @IsString()
  postId: string;

  @IsString()
  postTitle: string;

  @IsString()
  postUrl: string;

  @IsString()
  subreddit: string;

  @IsString()
  username: string;

  @IsEnum(['upvote', 'downvote', 'none'])
  voteType: 'upvote' | 'downvote' | 'none';

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
