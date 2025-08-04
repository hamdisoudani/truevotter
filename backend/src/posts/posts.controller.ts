import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get()
  findMyPosts(@Request() req) {
    return this.postsService.findByOwner(req.user.id);
  }

  @Get(':postId/is-owner')
  checkOwnership(@Param('postId') postId: string, @Request() req) {
    return this.postsService.isOwner(postId, req.user.id);
  }

  @Patch(':postId/toggle-tracking')
  toggleTracking(@Param('postId') postId: string, @Request() req) {
    return this.postsService.toggleTracking(postId, req.user.id);
  }

  @Delete(':postId')
  remove(@Param('postId') postId: string, @Request() req) {
    return this.postsService.remove(postId, req.user.id);
  }
}
