import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ShoppingItem } from './interfaces/shopping-item.interface';

@Injectable()
export class ItemsRepository {
  private readonly collectionName = 'shopping_items';

  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection(this.collectionName);
  }

  async findByUserId(userId: string): Promise<ShoppingItem[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('bought', 'asc')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ShoppingItem[];
  }

  async create(
    userId: string,
    name: string,
    quantity: number,
  ): Promise<ShoppingItem> {
    const docRef = this.collection.doc();

    const createdAt = Timestamp.now();

    const item: ShoppingItem = {
      id: docRef.id,
      userId,
      name,
      quantity,
      bought: false,
      createdAt,
    };

    await docRef.set(item);

    return item;
  }
}
