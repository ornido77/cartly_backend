# Cartly — Design Notes

## Architecture & Request Flow

Cartly is split into a Flutter client and a NestJS backend. The Flutter app never accesses Firestore directly. All data access goes through the backend API, which enforces user ownership before reading or modifying data.

```text
┌─────────────────┐
│   Flutter App   │
│                 │
│ Widget          │
│   ↓             │
│ BLoC            │
│   ↓             │
│ Use Case        │
│   ↓             │
│ Repository      │
│   ↓             │
│ Data Source     │
│   ↓             │
│ API Client      │
└────────┬────────┘
         │ HTTP
         │ x-user-id
         ▼
┌─────────────────┐
│   NestJS API    │
│                 │
│ Controller      │
│   ↓             │
│ User ID Guard   │
│   ↓             │
│ Service         │
│   ↓             │
│ Repository      │
└────────┬────────┘
         │ Firebase Admin SDK
         ▼
┌─────────────────┐
│    Firestore    │
│ shopping_items  │
└─────────────────┘
         │
         │ Query result
         ▼
   NestJS → Flutter
```

For list retrieval, Firestore performs the required ordering before the response is returned. The Flutter client therefore does not sort the items itself.

## Firestore Data Model

The application uses a single `shopping_items` collection.

```text
shopping_items/{itemId}

{
  userId: string,
  name: string,
  quantity: number,
  bought: boolean,
  createdAt: Timestamp
}
```

### Field rationale

| Field       | Purpose                                                                               |
| ----------- | ------------------------------------------------------------------------------------- |
| `userId`    | Associates the item with its owner and allows every query to be scoped to the caller. |
| `name`      | The shopping item name.                                                               |
| `quantity`  | Number of units required. The backend validates that it is at least 1.                |
| `bought`    | Determines whether the item belongs to the unbought or bought group.                  |
| `createdAt` | Preserves creation order and allows newest items to appear first.                     |

A flat collection was chosen because the application only needs to query items belonging to one user. It also makes the required Firestore query straightforward:

```text
where userId == currentUser
order by bought ascending
order by createdAt descending
```

This produces unbought items first and newest items first within each group.

Firestore may require a composite index for this query.

## API

| Method | Endpoint        | User Story | Purpose                                                      |
| ------ | --------------- | ---------- | ------------------------------------------------------------ |
| GET    | `/items`        | US-1, US-6 | Get the caller's shopping items using database ordering.     |
| POST   | `/items`        | US-2, US-6 | Validate and create an unbought item.                        |
| PATCH  | `/items/:id`    | US-3, US-6 | Toggle an item's bought status.                              |
| DELETE | `/items/:id`    | US-4, US-6 | Delete one owned item.                                       |
| DELETE | `/items/bought` | US-5, US-6 | Delete all bought items using one Firestore batch operation. |

All endpoints require the `x-user-id` request header. The backend validates ownership rather than trusting the client to restrict access.

The authentication system itself is intentionally outside the scope of the exercise. In a production system, the user identity would normally come from a verified authentication token rather than a caller-supplied header.

## Trade-offs

### 1. Reload after mutations

After add, toggle, delete, and clear-bought operations, the Flutter app reloads the list from the backend instead of optimistically updating its local state.

This adds an extra request, but keeps the client state simple and makes Firestore the authoritative source for ordering and data. This also avoids duplicating the database sorting rules in Flutter.

### 2. Separate repositories

The backend and Flutter application are maintained as separate repositories.

This keeps each project independently buildable and deployable, with its own dependency management and commit history. The trade-off is that the two repositories need to be coordinated when API contracts change.
