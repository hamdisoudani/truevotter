import { IsString } from 'class-validator';

export class LinkRedditDto {
  @IsString()
  redditUsername: string;

  @IsString()
  redditId: string;
}
