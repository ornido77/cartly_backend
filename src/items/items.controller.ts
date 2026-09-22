import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UserIdGuard } from '../common/guards/user-id.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateItemDto } from './dto/update-item.dto';

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

  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.updateBought(userId, itemId, dto.bought);
  }
  
  @Delete('bought')
  async deleteBought(@CurrentUser() userId: string) {
    const count = await this.itemsService.deleteAllBought(userId);

    return {
      deletedCount: count,
    };
  }

  @Delete(':id')
  async delete(@CurrentUser() userId: string, @Param('id') itemId: string) {
    await this.itemsService.delete(userId, itemId);

    return {
      message: 'Item deleted successfully',
    };
  }
}
