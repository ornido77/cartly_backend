import { Injectable, NotFoundException } from '@nestjs/common';
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

  async updateBought(
    userId: string,
    itemId: string,
    bought: boolean,
  ): Promise<ShoppingItem> {
    const item = await this.itemsRepository.updateBought(
      userId,
      itemId,
      bought,
    );

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async delete(userId: string, itemId: string): Promise<void> {
    const deleted = await this.itemsRepository.delete(userId, itemId);

    if (!deleted) {
      throw new NotFoundException('Item not found');
    }
  }

  async deleteAllBought(userId: string): Promise<number> {
    return this.itemsRepository.deleteAllBought(userId);
  }
}
