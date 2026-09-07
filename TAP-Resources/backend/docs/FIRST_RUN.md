# First Local Run

## 1. Install dependencies

```bash
npm install
```

## 2. Create environment file

Copy:

`.env.example`

to:

`.env`

Then update `DATABASE_URL` with your local PostgreSQL username/password.

## 3. Create PostgreSQL database

Create a database named:

`tap`

Example in psql:

```sql
CREATE DATABASE tap;
```

## 4. Run migrations

```bash
npm run db:migrate
```

## 5. Add development seed data

```bash
npm run db:seed
```

## 6. Start backend

```bash
npm run dev
```

## 7. Test

Open:

`http://localhost:3000/api/health`

Expected:

```json
{
  "success": true,
  "message": "T.A.P. backend is running"
}
```

The development seed includes:

- Instructor user ID: `1`
- Student user ID: `2`
- Course ID: `1`
- Active session ID: `1`

Mock face recognition defaults to student ID `2`.
