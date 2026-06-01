# Taskmanager Server

Backend API for a role-based task manager built with Express.js, MongoDB, Mongoose, JWT authentication, and Docker.

The project supports three roles:

- `ADMIN`
- `MANAGER`
- `MEMBER`

Admins and managers can create projects and tasks. Members can view and update tasks assigned to them.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- Docker and Docker Compose

## Quick Start With Docker

This is the recommended reviewer setup.

Prerequisites:

- Docker Desktop installed and running

Run the API and MongoDB:

```bash
docker compose up --build
```

The API will run at:

```text
http://localhost:3000
```

Health check:

```text
GET http://localhost:3000/health
```

Expected response:

```json
{
  "status": 200,
  "message": "API is running"
}
```

Stop containers:

```bash
docker compose down
```

Stop containers and remove MongoDB volume data:

```bash
docker compose down -v
```

## Docker Services

`docker-compose.yml` starts:

- `api`: Express server on port `3000`
- `mongo`: MongoDB on port `27017`

Docker environment values:

```env
PORT=3000
DATABASE_URL=mongodb://mongo:27017/taskmanager
JWT_KEY=reviewer-local-secret
HASHING_KEY=10
```

## Local Setup Without Docker

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=mongodb://127.0.0.1:27017/taskmanager
JWT_KEY=your-secret-key
HASHING_KEY=10
```

Start in development mode:

```bash
npm run dev
```

Start in production mode:

```bash
npm start
```

## Authentication

Authentication uses a JWT stored in a cookie named `token`.

In Postman or a browser client:

1. Call `POST /signup` to create a user.
2. Call `POST /login`.
3. Use the returned cookie for protected routes.

## Roles And Permissions

| Action | ADMIN | MANAGER | MEMBER |
| --- | --- | --- | --- |
| Signup/Login | Yes | Yes | Yes |
| View users | Yes | No | No |
| Update user role | Yes | No | No |
| Deactivate user | Yes | No | No |
| Create project | Yes | Yes | No |
| View projects | Yes | Yes | No |
| Deactivate project | Yes | Yes | No |
| Create task | Yes | Yes | No |
| View all tasks | Yes | Yes | No |
| Delete task | Yes | Yes | No |
| View assigned tasks | Yes | Yes | Yes |
| Update assigned task status | Yes | Yes | Yes |

## API Endpoints

Base URL:

```text
http://localhost:3000
```

### Health

```http
GET /health
```

### Auth

#### Signup

```http
POST /signup
```

Body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "StrongPass@123",
  "role": "ADMIN"
}
```

Allowed roles:

```text
ADMIN, MANAGER, MEMBER
```

#### Login

```http
POST /login
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "StrongPass@123"
}
```

Successful login sets the `token` cookie.

#### Logout

```http
POST /logout
```

### Users

Requires `ADMIN`.

#### Get Users

```http
GET /users?page=1
```

#### Update User Role

```http
PATCH /users/:id
```

Body:

```json
{
  "role": "MANAGER"
}
```

#### Deactivate User

```http
PATCH /users/:id/deactivate
```

### Projects

Requires `ADMIN` or `MANAGER`.

#### Create Project

```http
POST /projects
```

Body:

```json
{
  "name": "Website Redesign",
  "description": "This project manages design development testing deployment and review tasks"
}
```

Project description should contain between 10 and 30 words.

#### Get All Projects

```http
GET /projectsDetails
```

#### Get Project By ID

```http
GET /projectsDetails/:id
```

#### Activate Or Deactivate Project

```http
PATCH /projectsDetails/deactivate/:id
```

Body:

```json
{
  "isactive": false
}
```

### Tasks

#### Create Task

Requires `ADMIN` or `MANAGER`.

```http
POST /task
```

Body:

```json
{
  "title": "Create API documentation",
  "description": "Prepare endpoint documentation for the reviewer",
  "priority": "HIGH",
  "assigneeId": "USER_OBJECT_ID",
  "projectId": "PROJECT_OBJECT_ID",
  "dueDate": "2026-06-10"
}
```

Allowed priorities:

```text
LOW, MEDIUM, HIGH
```

Date format:

```text
YYYY-MM-DD
```

#### Get All Tasks

Requires `ADMIN` or `MANAGER`.

```http
GET /task
```

Returns tasks with populated assignee, creator, project, and status history user details.

#### Get Task By ID

Requires `ADMIN` or `MANAGER`.

```http
GET /task/:id
```

#### Update Task Status

Requires `ADMIN` or `MANAGER`.

```http
PATCH /tasks/:id/status
```

Body:

```json
{
  "status": "IN_PROGRESS"
}
```

#### Delete Task

Requires `ADMIN` or `MANAGER`.

```http
DELETE /task/:id
```

### Member Assigned Tasks

These routes return only tasks where the logged-in user is the assignee.

#### Get My Assigned Tasks

Requires authenticated `ADMIN`, `MANAGER`, or `MEMBER`.

```http
GET /member/tasks
```

#### Get My Assigned Task By ID

Requires authenticated `ADMIN`, `MANAGER`, or `MEMBER`.

```http
GET /member/tasks/:id
```

#### Update My Assigned Task Status

Requires authenticated `ADMIN`, `MANAGER`, or `MEMBER`.

```http
PATCH /member/tasks/:id/status
```

Body:

```json
{
  "status": "IN_REVIEW"
}
```

## Task Status Flow

Allowed task statuses:

```text
TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED
```

Allowed transitions:

| Current Status | Can Move To |
| --- | --- |
| `TODO` | `IN_PROGRESS`, `BLOCKED` |
| `IN_PROGRESS` | `IN_REVIEW`, `BLOCKED` |
| `IN_REVIEW` | `DONE`, `BLOCKED` |
| `BLOCKED` | `IN_PROGRESS` |
| `DONE` | No further status |

Every status change is saved in `statusHistory` with:

- previous status
- new status
- changed by user
- changed at date

## Recommended Review Flow

1. Start the app:

```bash
docker compose up --build
```

2. Check the API:

```http
GET /health
```

3. Create users with `ADMIN`, `MANAGER`, and `MEMBER` roles using `POST /signup`.

4. Login as an admin or manager.

5. Create a project using `POST /projects`.

6. Create a task using `POST /task`, assigning it to the member user.

7. Login as the member.

8. View assigned tasks using `GET /member/tasks`.

9. Update assigned task status using `PATCH /member/tasks/:id/status`.

## API Testing

Import `Postman_collection.json` into Postman to test all endpoints.

## Project Structure

```text
BackendAssignment/
  app.js
  Dockerfile
  docker-compose.yml
  constants/
    taskTransitions.js
  config/
    DBconfig.js
    Variableconfig.js
  Middleware/
    JwtAuth.js
    RBAC.js
  Models/
    ProjectModel.js
    RegisterationModel.js
    TaskModel.js
  Routes/
    Authentication.js
    Projects.js
    Task.js
    Users.js
  Utiles/
    Validation.js
```

## Notes

- `.env` is ignored and should not be committed.
- Docker Compose provides the required MongoDB service automatically.
- Protected APIs require the login cookie.
- Passwords are hashed with bcrypt before saving.
