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

  async findById(userId: string, itemId: string): Promise<ShoppingItem | null> {
    const doc = await this.collection.doc(itemId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    if (data?.userId !== userId) {
      return null;
    }

    return {
      id: doc.id,
      ...data,
    } as ShoppingItem;
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

  async updateBought(
    userId: string,
    itemId: string,
    bought: boolean,
  ): Promise<ShoppingItem | null> {
    const item = await this.findById(userId, itemId);

    if (!item) {
      return null;
    }

    await this.collection.doc(itemId).update({
      bought,
    });

    return {
      ...item,
      bought,
    };
  }

  async delete(userId: string, itemId: string): Promise<boolean> {
    const item = await this.findById(userId, itemId);

    if (!item) {
      return false;
    }

    await this.collection.doc(itemId).delete();

    return true;
  }

  async deleteAllBought(userId: string): Promise<number> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .where('bought', '==', true)
      .get();

    if (snapshot.empty) {
      return 0;
    }

    const batch = this.firebaseService.getFirestore().batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return snapshot.size;
  }
}
