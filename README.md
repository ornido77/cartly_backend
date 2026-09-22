# Cartly Backend

NestJS backend for the Cartly shopping-list application.

## Tech Stack

* NestJS
* TypeScript
* Firebase Admin SDK
* Cloud Firestore
* class-validator / class-transformer

## Architecture

```text
Controller
    ↓
Guard / Request Validation
    ↓
Service
    ↓
Repository
    ↓
Firebase Admin SDK
    ↓
Cloud Firestore
```

The backend owns validation, user isolation, business rules, and Firestore access.

## Requirements

* Node.js 20+
* npm
* A Firebase project with Cloud Firestore enabled

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a Firebase project and enable **Cloud Firestore**.

Create a Firebase service account:

1. Open the Firebase Console.
2. Open **Project Settings**.
3. Go to **Service Accounts**.
4. Generate a new private key.
5. Keep the downloaded JSON file secure.

Copy `.env.example` to `.env`:

#### Windows

```cmd
copy .env.example .env
```

#### macOS / Linux

```bash
cp .env.example .env
```

Fill in the Firebase credentials in `.env`.

**Do not commit `.env` or real Firebase credentials.**

### 3. Start the backend

Development:

```bash
npm run start:dev
```

The API runs on:

```text
http://localhost:3000
```

## Environment Variables

The required Firebase configuration is documented in `.env.example`.

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

The private key must preserve its newline characters. The application converts escaped `\n` characters before initializing the Firebase Admin SDK.

## API

All endpoints require the following header:

```http
x-user-id: user-123
```

### Get Items

```http
GET /items
```

Returns the current user's shopping items ordered by:

1. Unbought items first
2. Newest items first within each group

### Add Item

```http
POST /items
Content-Type: application/json
```

Request:

```json
{
  "name": "Milk",
  "quantity": 2
}
```

The backend rejects:

* Empty item names
* Quantity values below `1`
* Unknown request fields

New items are created as unbought.

### Toggle Item

```http
PATCH /items/:id
Content-Type: application/json
```

Request:

```json
{
  "bought": true
}
```

The backend verifies that the item belongs to the requesting user before updating it.

### Delete Item

```http
DELETE /items/:id
```

The backend verifies ownership before deleting the item.

### Clear Bought Items

```http
DELETE /items/bought
```

Deletes all bought items belonging to the current user.

The operation uses a Firestore `WriteBatch` and commits the deletes as one batch operation rather than looping through individual delete requests.

If the user has no bought items, the operation completes without an error.

## User Isolation

The caller's user ID is provided through the `x-user-id` header.

The backend:

* Rejects requests without `x-user-id`.
* Scopes list queries to the current user.
* Verifies ownership before modifying an item.
* Verifies ownership before deleting an item.
* Returns `Item not found` when an item does not exist or belongs to another user.

This prevents one user from accessing or modifying another user's shopping items.

## Firestore Schema

The application uses a single `shopping_items` collection.

```text
shopping_items/{itemId}
```

Example document:

```json
{
  "userId": "user-123",
  "name": "Milk",
  "quantity": 2,
  "bought": false,
  "createdAt": "Firestore Timestamp"
}
```

### Fields

| Field       | Type      | Description                            |
| ----------- | --------- | -------------------------------------- |
| `userId`    | string    | Identifies the owner of the item.      |
| `name`      | string    | Shopping item name.                    |
| `quantity`  | number    | Number of units. Must be at least `1`. |
| `bought`    | boolean   | Whether the item has been purchased.   |
| `createdAt` | Timestamp | Used to order items by creation time.  |

The list query is performed directly by Firestore:

```text
where userId == currentUser
orderBy bought ascending
orderBy createdAt descending
```

This keeps the required sorting responsibility in the database rather than in the Flutter client.

Firestore may require a composite index for this query. If Firestore reports a missing index, the Firebase error provides a link to create the required index.

## Validation

Request validation is handled globally using NestJS `ValidationPipe`.

The backend rejects invalid requests before writing to Firestore.

Examples:

```text
name = ""
quantity = 0
quantity = -1
```

are rejected by the API.

Unknown request fields are also rejected.

## Testing

Backend automated tests are not included in the current submission.

The API was manually verified against the main required flows:

* Creating valid items
* Rejecting empty item names
* Rejecting quantities below `1`
* Rejecting requests without `x-user-id`
* Retrieving only the current user's items
* Preventing access to another user's items
* Toggling bought/unbought status
* Deleting an item
* Handling nonexistent items
* Clearing all bought items
* Keeping unbought items when clearing bought items
* Handling clear-bought when there are no bought items
* Database-side ordering of items

## Project Structure

```text
src/
├── common/
│   ├── decorators/
│   └── guards/
├── firebase/
├── items/
│   ├── dto/
│   ├── items.controller.ts
│   ├── items.service.ts
│   └── items.repository.ts
├── app.module.ts
└── main.ts

.env.example
.gitignore
README.md
```

## Production Authentication

Authentication is intentionally outside the scope of this exercise.

The current implementation uses `x-user-id` to represent the caller's identity, as required by the specification.

In a production application, this would be replaced with a verified authentication mechanism, such as a Firebase Authentication ID token. The backend would derive the user ID from the verified token rather than trusting a caller-provided ID.

## Related Application

The Flutter client is maintained in a separate repository.

The Flutter application communicates with this backend through HTTP and never accesses Firestore directly.
