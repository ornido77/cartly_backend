export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  bought: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}
