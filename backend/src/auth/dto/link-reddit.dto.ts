import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class LinkRedditDto {
  @IsString()
  redditUsername: string;

  @IsString()
  redditId: string;

  @IsOptional()
  @IsString()
  redditAvatarUrl?: string;

  @IsOptional()
  @IsNumber()
  redditKarma?: number;

  @IsOptional()
  @IsDateString()
  redditAccountCreated?: string;

  @IsOptional()
  @IsBoolean()
  redditVerified?: boolean;
}
