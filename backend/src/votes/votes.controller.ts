import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createVoteDto: CreateVoteDto, @Request() req) {
    return this.votesService.create(createVoteDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req,
    @Query('username') username?: string,
    @Query('subreddit') subreddit?: string,
  ) {
    if (username) {
      return this.votesService.findByUsername(username);
    }
    if (subreddit) {
      return this.votesService.findBySubreddit(subreddit, req.user.id);
    }
    return this.votesService.findAll(req.user.id);
  }

  @Get('stats')
  getStats() {
    return this.votesService.getVoteStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-stats')
  getMyStats(@Request() req) {
    return this.votesService.getVoteStats(req.user.id);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.votesService.findByPostId(postId);
  }
}
