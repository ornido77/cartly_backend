import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ItemsRepository } from './items.repository';

@Module({
  imports: [FirebaseModule],
  controllers: [ItemsController],
  providers: [
    ItemsService,
    ItemsRepository,
  ],
})
export class ItemsModule {}
