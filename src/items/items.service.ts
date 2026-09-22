import { Injectable } from '@nestjs/common';
import { ItemsRepository } from './items.repository';

@Injectable()
export class ItemsService {
  constructor(
    private itemsRepository: ItemsRepository,
  ) {}

  async createTest() {
    return this.itemsRepository.createTest();
  }
}