# T.A.P. — Tiger Attendance Portal

> **"Everybody T.A.P. in for class to get credit."**

## Overview

**T.A.P. (Tiger Attendance Portal)** is a student attendance management system designed to make classroom attendance faster, more accurate, and easier for instructors to manage.

T.A.P. uses **facial recognition** to verify a student's identity before recording attendance. Instead of relying on transferable methods such as QR codes, a student submits a live face capture during an active class session. The system verifies the student's identity using **Exadel CompreFace**, confirms that the student is enrolled in the course, checks for an existing attendance record, and records the successful check-in.

Instructors can create class sessions, manage enrolled students, review attendance records, and make authorized attendance corrections when necessary.

---

## Problem Statement

Traditional attendance methods can consume valuable class time and may produce inaccurate records. Manual attendance can result in students being marked incorrectly, while simple digital check-in methods can still allow one student to check in on behalf of another.

T.A.P. addresses these problems by providing a centralized digital attendance system that combines:

- Facial-recognition identity verification
- Course enrollment validation
- Active class-session validation
- Duplicate check-in prevention
- Automatic attendance recording
- Instructor attendance management

The goal is to provide a more reliable method of determining whether the correct student is checking into a class session.

---

## MVP

The current project is focused on delivering a **Minimum Viable Product (MVP)** that demonstrates one complete attendance workflow.

The MVP must allow:

1. An instructor to create a class session.
2. Students to be associated with their enrolled courses.
3. A student to select an active class session.
4. A student to capture and submit a face image.
5. T.A.P. to send the image to Exadel CompreFace for recognition.
6. The backend to verify the recognized student's enrollment.
7. The system to prevent duplicate attendance.
8. The system to record a successful attendance check-in.
9. An instructor to review the attendance list.

Additional reporting, analytics, deployment, and advanced security features may be developed after the core MVP is stable.

---

# System Architecture

T.A.P. is being developed as a web-based system with separate frontend, backend, database, and facial-recognition components.

```text
              STUDENT / INSTRUCTOR
                       │
                       ▼
              Frontend Web Application
              HTML / CSS / JavaScript
                     React
                       │
                       │ REST API
                       ▼
               Node.js + Express
                 T.A.P. Backend
                  /          \
                 /            \
                ▼              ▼
        PostgreSQL        Exadel CompreFace
          Database         Face Recognition
```

The backend serves as the central connection between the user interface, PostgreSQL database, and facial-recognition service.

---

## Attendance Workflow

The primary MVP workflow is:

```text
Instructor creates class session
              ↓
Student selects active session
              ↓
Student captures live face image
              ↓
Frontend sends image to backend
              ↓
Backend sends image to CompreFace
              ↓
CompreFace attempts to recognize student
              ↓
Backend receives recognition result
              ↓
System verifies course enrollment
              ↓
System checks for duplicate attendance
              ↓
Attendance record is created
              ↓
Student receives confirmation
              ↓
Instructor can view attendance
```

---

# Project Objectives

The project aims to:

- Develop a working database for users, courses, enrollments, class sessions, face profiles, and attendance records.
- Implement facial-recognition attendance verification using Exadel CompreFace.
- Verify that a recognized student is enrolled in the selected course.
- Prevent duplicate attendance check-ins.
- Automatically record successful attendance.
- Provide an instructor interface for creating class sessions.
- Provide an instructor interface for viewing attendance.
- Allow authorized attendance corrections when necessary.
- Test the system for accuracy, reliability, usability, and privacy.
- Integrate the frontend, backend, database, and facial-recognition components into one functional MVP.

---

# Core Features

## 1. Facial Recognition Check-In

Students submit a face capture when checking into an active class session.

The backend communicates with **Exadel CompreFace** to determine whether the submitted face matches an enrolled identity.

---

## 2. Class Session Management

Instructors can create attendance sessions associated with their courses.

Sessions can have states such as:

- `scheduled`
- `active`
- `closed`

Normal student check-ins are only accepted for active sessions.

---

## 3. Enrollment Validation

Recognizing a student is not enough to receive attendance credit.

After recognition, T.A.P. verifies that the identified student is currently enrolled in the course associated with the class session.

---

## 4. Duplicate Check-In Prevention

T.A.P. prevents the same student from receiving multiple attendance records for the same class session.

Duplicate protection is enforced at both the application and database levels.

The database uses the constraint:

```sql
UNIQUE(student_id, session_id)
```

---

## 5. Automatic Attendance Recording

After a successful verification, T.A.P. records information including:

- Student
- Class session
- Check-in time
- Verification status
- Recognition confidence score, when available

---

## 6. Instructor Attendance Management

Instructors will be able to:

- Create class sessions
- View enrolled students
- View attendance records
- Review previous class sessions
- Make authorized attendance corrections when necessary

---

# Functional Requirements

The current MVP functional requirements include:

- **FR-1:** Allow an instructor to create a class attendance session.
- **FR-2:** Allow a student to view/select an available class session.
- **FR-3:** Allow a student to capture and submit a face image for attendance verification.
- **FR-4:** Submit the captured image to the facial-recognition service.
- **FR-5:** Determine whether the submitted face matches a registered student.
- **FR-6:** Verify that the recognized student is enrolled in the course.
- **FR-7:** Verify that the selected class session is active.
- **FR-8:** Record the recognized student's identity for a successful check-in.
- **FR-9:** Record the class session associated with the check-in.
- **FR-10:** Record the date and time of the attendance check-in.
- **FR-11:** Prevent a student from receiving more than one attendance record for the same class session.
- **FR-12:** Allow an instructor to view the attendance list for a class session.
- **FR-13:** Allow an authorized instructor to correct an attendance record.
- **FR-14:** Store student and instructor information in the system database.
- **FR-15:** Store course and class-session information.
- **FR-16:** Store course enrollment information.
- **FR-17:** Associate each attendance record with a student and class session.
- **FR-18:** Associate registered students with the facial-recognition system.

---

# Non-Functional Requirements

| ID | Requirement | Current Target |
|---|---|---|
| **NFR-1** | Performance | Attendance verification should complete within a reasonable period under normal classroom conditions. |
| **NFR-2** | Concurrent Usage | The system should support multiple students attempting to check in during the same class session. |
| **NFR-3** | Password Security | User credentials shall be stored using secure password hashing. |
| **NFR-4** | Duplicate Prevention | The system shall prevent duplicate attendance records for the same student and session. |
| **NFR-5** | Reliability | Valid attendance records should be stored consistently without data loss during controlled testing. |
| **NFR-6** | Usability | A student should be able to complete the normal attendance process without unnecessary steps. |
| **NFR-7** | Privacy | Access to student, attendance, and facial-recognition information shall be limited to authorized system components and users. |
| **NFR-8** | Maintainability | Backend, database, frontend, and facial-recognition functionality should remain modular to allow independent development and testing. |

> Performance and reliability targets will be refined after integration testing provides measurable results.

---

# Technology Stack

## Frontend

- HTML
- CSS
- JavaScript
- React

## Backend

- Node.js
- Express.js
- REST API

## Database

- PostgreSQL
- SQL migrations
- Development seed data

## Facial Recognition

- Exadel CompreFace
- Image-based face recognition
- Facial identity/subject association
- Recognition confidence results

## Development & Version Control

- Visual Studio Code
- Git
- GitHub
- npm
- Nodemon

---

# Backend Structure

The backend follows a modular structure:

```text
backend/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── docs/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── compreface.service.js
│   ├── app.js
│   └── server.js
│
├── tests/
├── uploads/
├── .env.example
├── .gitignore
└── package.json
```

The architecture separates database access, API routes, business logic, and facial-recognition integration so team members can work on different components independently.

---

# Database

The initial PostgreSQL schema contains six primary tables:

```text
users
courses
enrollments
class_sessions
face_profiles
attendance_records
```

### Major Relationships

```text
Instructor
    │
    └── Course
          │
          ├── Enrollments ── Students
          │
          └── Class Sessions
                    │
                    └── Attendance Records
                              │
                              └── Student

Student
    │
    └── Face Profile
```

The `face_profiles` table connects a T.A.P. student account with the identity/subject used by the facial-recognition service.

---

# API

The backend exposes REST API endpoints for the frontend and other project components.

Current/planned endpoints include:

```text
GET    /api/health

GET    /api/courses
GET    /api/courses/:courseId

GET    /api/courses/:courseId/students
POST   /api/courses/:courseId/enrollments

GET    /api/courses/:courseId/sessions
POST   /api/courses/:courseId/sessions

GET    /api/sessions/:sessionId

POST   /api/sessions/:sessionId/check-in
GET    /api/sessions/:sessionId/attendance

POST   /api/students/:studentId/face/enroll
```

Detailed request and response information is maintained in the project's API documentation.

---

# Facial Recognition Integration

Facial-recognition functionality is intentionally isolated from the main attendance logic.

The integration is located in:

```text
src/services/compreface.service.js
```

The goal is for the rest of the backend to interact with a simplified interface such as:

```javascript
recognizeFace(image)
```

rather than depending directly on CompreFace's internal response structure.

Conceptually:

```text
Captured Image
      ↓
CompreFace Service
      ↓
Recognition Result
      ↓
Student Identity / Subject
      ↓
Confidence Score
      ↓
T.A.P. Attendance Logic
```

During development, mock recognition can be used so that frontend, backend, database, and testing work can continue before the real CompreFace integration is complete.

---

# Major Development Areas

## Backend

- Express server
- REST API
- PostgreSQL connectivity
- Session validation
- Enrollment validation
- Duplicate prevention
- Attendance recording
- CompreFace service integration
- Authentication and authorization

## Database

- Database schema
- Table relationships
- Constraints
- SQL migrations
- Development seed data
- Attendance integrity
- Face-profile association

## Frontend

### Student Interface

- Login
- View/select class session
- Webcam access
- Face capture
- Submit check-in
- Display check-in confirmation/errors

### Instructor Interface

- Login
- Create class session
- View/manage enrolled students
- View attendance
- Correct attendance when authorized

## Facial Recognition

- Run/configure Exadel CompreFace
- Register student identities
- Enroll reference face data
- Submit captured images for recognition
- Process recognition results
- Return identity and confidence information to T.A.P.

## Testing & Integration

- Valid student check-in
- Unrecognized face
- Student not enrolled in course
- Inactive class session
- Duplicate check-in
- Missing/invalid image
- Instructor attendance retrieval
- Attendance corrections
- Complete end-to-end workflow

---

# Team

| Team Member | Primary Responsibility |
|---|---|
| **Efrem (Coda) Black** | Backend Development / System Integration |
| **Tajah Refuge** | PostgreSQL Database |
| **Derrick Ellis** | Frontend Design & Development |
| **Novick Dragnire** | Exadel CompreFace / Facial Recognition |

### Development Responsibilities

**Backend / System Integration — Efrem (Coda)**

Responsible for establishing the Node.js/Express backend, REST API structure, PostgreSQL connectivity, attendance business logic, development environment, and integration points between project components.

**Database — Tajah**

Responsible for reviewing and refining the PostgreSQL schema, relationships, constraints, migrations, and data-storage requirements.

**Frontend — Derrick**

Responsible for developing the student and instructor interfaces and connecting the user interface to the backend REST API.

**Facial Recognition — Novick**

Responsible for configuring Exadel CompreFace and implementing student face enrollment and recognition functionality through the backend's CompreFace service.

The project is structured so these components can be developed in parallel and integrated as development progresses.

---

# Testing

Testing will include realistic classroom and system scenarios such as:

- Successful facial-recognition check-in
- Unrecognized face
- Recognized student who is not enrolled in the selected course
- Duplicate check-in attempt
- Check-in attempt for an inactive class session
- Missing or invalid face image
- Student absence
- Late attendance
- Instructor attendance review
- Authorized attendance correction
- Database integrity
- Complete end-to-end attendance workflow

Problems discovered during development and testing will be documented in the project's progress log and corrected as the MVP develops.

---

# Current Development Progress

The project has moved from system planning into active MVP development.

### Completed / Operational

- [x] Initial project concept
- [x] MVP definition
- [x] Transition from QR-based attendance to facial recognition
- [x] High-level system architecture
- [x] Use-case planning
- [x] Initial database design
- [x] Backend project structure
- [x] Node.js / Express development environment
- [x] PostgreSQL development database
- [x] PostgreSQL connection from backend
- [x] SQL migration system
- [x] Initial database migrations
- [x] Development seed-data system
- [x] REST API foundation
- [x] Backend health endpoint
- [x] Mock facial-recognition interface
- [x] Initial API documentation

### In Progress

- [ ] Database refinement and testing
- [ ] Student frontend
- [ ] Instructor frontend
- [ ] Real Exadel CompreFace integration
- [ ] Face enrollment workflow
- [ ] Authentication and authorization
- [ ] Full attendance check-in integration

### Future / Stretch Goals

- [ ] Advanced attendance reports
- [ ] Attendance export
- [ ] Attendance analytics
- [ ] Audit logging
- [ ] Additional anti-spoofing/liveness protections
- [ ] Production deployment

---

# Project Roadmap

```text
Planning & Requirements
          │
          ▼
MVP Definition
          │
          ▼
System Architecture
          │
          ▼
Backend + Database Foundation
          │
          ▼
Parallel Component Development
     ┌────┼────────────┐
     ▼    ▼            ▼
 Database Frontend   CompreFace
     └────┼────────────┘
          ▼
     Integration
          │
          ▼
    End-to-End MVP
          │
          ▼
       Testing
          │
          ▼
   Final Demonstration
```

Development decisions, implementation progress, encountered problems, and solutions are maintained in the project's **Progress Log**.

---

# Project Goal

The primary goal of T.A.P. is to deliver a **working and demonstrable attendance MVP**:

> **Create Session → Student Face Capture → Facial Recognition → Verify Enrollment → Prevent Duplicate → Record Attendance → Instructor Reviews Result**

The MVP prioritizes completing this core workflow before additional features are added.

---

# Project Status

**Status:** 🚧 In Development

**Current Phase:** Backend/database foundation completed; parallel frontend, database, and CompreFace development beginning.

**Current Focus:** Connecting the database, frontend, and real facial-recognition components to produce the first complete end-to-end attendance check-in.

---

## Team Repository

This repository contains the source code, documentation, requirements, development history, and implementation work for the **T.A.P. — Tiger Attendance Portal** capstone project.