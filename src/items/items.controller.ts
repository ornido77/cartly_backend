import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UserIdGuard } from '../common/guards/user-id.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('items')
@UseGuards(UserIdGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(@CurrentUser() userId: string) {
    return this.itemsService.findAll(userId);
  }

  @Post()
  async create(@CurrentUser() userId: string, @Body() dto: CreateItemDto) {
    return this.itemsService.create(userId, dto.name, dto.quantity);
  }
}
