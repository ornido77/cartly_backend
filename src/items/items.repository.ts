import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class ItemsRepository {
  private firestore;

  constructor(private firebaseService: FirebaseService) {
    this.firestore = firebaseService.getFirestore();
  }

  async createTest() {
    const result = await this.firestore
      .collection('shopping_items')
      .add({
        userId: 'demo-user',
        name: 'Milk',
        quantity: 2,
        bought: false,
        createdAt: FieldValue.serverTimestamp(),
      });

    return result.id;
  }
}