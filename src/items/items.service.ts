import { Injectable } from '@nestjs/common';
import { ItemsRepository } from './items.repository';
import { ShoppingItem } from './interfaces/shopping-item.interface';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  async findAll(userId: string): Promise<ShoppingItem[]> {
    return this.itemsRepository.findByUserId(userId);
  }

  async create(
    userId: string,
    name: string,
    quantity: number,
  ): Promise<ShoppingItem> {
    return this.itemsRepository.create(userId, name, quantity);
  }
}
