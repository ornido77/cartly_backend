import { Body, Controller, Get, Post } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}
  @Get()
  getItems() {
    return {
      message: 'Items endpoint works',
    };
  }

  @Post()
  createItem(@Body() body: any) {
    return {
      message: 'Item created',
      item: body,
    };
  }

  @Get('test')
  async testFirestore() {
    return this.itemsService.createTest();
  }
}
