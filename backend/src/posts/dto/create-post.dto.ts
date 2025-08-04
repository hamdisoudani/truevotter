import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  postId: string;

  @IsString()
  title: string;

  @IsString()
  url: string;

  @IsString()
  subreddit: string;
}
