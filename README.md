# T.A.P. — Tiger Attendance Portal

> **"Everybody T.A.P. in for class to get credit."**

## Overview

**T.A.P. (Tiger Attendance Portal)** is a student attendance management system designed to make classroom attendance faster, more accurate, and easier for instructors to manage.

The system provides a complete attendance workflow where an instructor creates a class session and generates a QR code. Students scan the QR code to check in, and T.A.P. automatically records the student, class session, and check-in time. Instructors can then review the attendance list through an instructor dashboard.

## Problem Statement

Traditional manual attendance methods can take valuable class time and may result in inaccurate attendance records. Students may be marked incorrectly, and manual methods can make it possible for one student to check in for another.

T.A.P. addresses these problems by providing a centralized digital attendance system with QR-code check-in, duplicate detection, instructor attendance management, and reporting capabilities.

## Project Objectives

The project aims to:

* Develop a working attendance database for students, courses, class sessions, and attendance records.
* Implement QR-code attendance check-in.
* Prevent duplicate attendance check-ins.
* Provide a manual check-in fallback option.
* Provide an instructor dashboard for managing class sessions and attendance.
* Allow authorized instructors to correct attendance records.
* Provide attendance reporting and export functionality.
* Test the system for accuracy, usability, privacy, and reliability.

## Main Features

### 1. QR Code Attendance Check-In

Instructors can generate a QR code for an active class session. Students scan the QR code to submit their attendance.

### 2. Class Session Management

Instructors can create attendance sessions for their classes and generate a unique QR code for each session.

### 3. Automatic Attendance Records

When a student successfully checks in, the system records:

* Student
* Course/class session
* Check-in date
* Check-in time

### 4. Instructor Dashboard

Instructors can review attendance for active and previous class sessions and make authorized corrections when necessary.

### 5. Attendance Reports & Export

Instructors can review attendance information and generate useful attendance reports.

## Functional Requirements

The system shall:

* **FR-1:** Allow an instructor to create a class attendance session.
* **FR-2:** Generate a unique QR code for an active class session.
* **FR-3:** Allow a student to scan the QR code for an active class session.
* **FR-4:** Record the student's identity when a valid check-in is submitted.
* **FR-5:** Record the class session associated with each attendance check-in.
* **FR-6:** Record the date and time of each attendance check-in.
* **FR-7:** Prevent a student from submitting more than one attendance check-in for the same class session.
* **FR-8:** Provide a manual attendance option when QR-code check-in cannot be used.
* **FR-9:** Allow an instructor to view the attendance list for a class session.
* **FR-10:** Allow an authorized instructor to correct an attendance record.
* **FR-11:** Allow an instructor to review attendance records for previous class sessions.
* **FR-12:** Allow an instructor to generate an attendance report.
* **FR-13:** Allow an instructor to export attendance information.
* **FR-14:** Store student records in the attendance database.
* **FR-15:** Store course and class-session records in the attendance database.
* **FR-16:** Associate each attendance record with a student and class session.

## Non-Functional Requirements

| ID        | Requirement          | Target                                                                                                                 |
| --------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **NFR-1** | Response Time        | Successful attendance confirmation shall be displayed within **2 seconds** under normal classroom usage.               |
| **NFR-2** | Concurrent Users     | The system shall support at least **100 simultaneous students** attempting to check in.                                |
| **NFR-3** | Availability         | The system shall maintain at least **99% availability** during scheduled classroom testing.                            |
| **NFR-4** | Password Security    | User credentials shall be stored using **hashed and salted passwords**.                                                |
| **NFR-5** | Duplicate Prevention | The system shall prevent duplicate attendance records with **100% success during testing**.                            |
| **NFR-6** | Check-In Reliability | The system shall successfully record at least **99% of valid check-in attempts** during controlled testing.            |
| **NFR-7** | Usability            | A student shall be able to complete a normal QR-code check-in within **30 seconds** after opening the check-in screen. |

## Technology Stack

The exact technologies may change during development. The current proposed technology stack is:

### Frontend

* HTML
* CSS
* JavaScript
* React *(may be used)*

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Attendance

* QR-code generation
* QR-code scanning

### Version Control

* Git
* GitHub

## System Workflow

The primary MVP workflow is:

```text
Instructor creates class session
            ↓
     System generates QR code
            ↓
       Student scans QR
            ↓
     System validates check-in
            ↓
      Attendance is recorded
            ↓
    Instructor reviews attendance
            ↓
   Report can be generated/exported
```

The goal of the MVP is to demonstrate one complete attendance workflow from session creation through instructor review.

## Major Development Tasks

### 1. Backend & Database

* Design the PostgreSQL database.
* Create student, course, session, and attendance tables.
* Develop APIs for creating sessions.
* Develop APIs for recording attendance.
* Develop APIs for retrieving attendance records.
* Connect the backend to the database.

### 2. QR Code Check-In

* Implement QR-code generation.
* Implement QR-code scanning.
* Validate QR codes against active sessions.
* Prevent duplicate check-ins.
* Implement the manual check-in fallback.

### 3. User Interface

* Build the student check-in screen.
* Build the instructor session creation screen.
* Build the instructor attendance dashboard.
* Display attendance records.
* Provide authorized attendance correction controls.

### 4. Reporting & Export

* Build attendance report views.
* Add attendance information filtering/review.
* Implement attendance data export.
* Verify exported information against stored attendance records.

### 5. Testing & Integration

* Test the complete attendance workflow.
* Test duplicate check-ins.
* Test invalid or expired QR codes.
* Test late attendance.
* Test absences.
* Test instructor corrections.
* Test the manual check-in option.
* Document and fix issues.
* Integrate all components for the final demonstration.

## Team

| Team Member            | Primary Responsibility    |
| ---------------------- | ------------------------- |
| **Efrem (Coda) Black** | Team member / development |
| **Tajah Refuge**       | Team member / development |
| **Novick Dragnire**    | Team member / development |
| **Derrick Ellis**      | Team member / development |

The original project plan divides the development work into backend/database, QR check-in, user interface, and testing/integration responsibilities.

## Testing

Testing will simulate realistic classroom scenarios, including:

* Normal student check-ins
* Duplicate check-in attempts
* Late attendance
* Student absences
* Instructor attendance corrections
* QR-code failures
* Manual attendance fallback
* Complete end-to-end attendance workflow

Problems discovered during testing will be documented and corrected before the final demonstration.

## Project Goal

The primary goal of T.A.P. is to deliver a **working, functional MVP** that demonstrates a reliable digital attendance process:

> **Create a session → Generate QR code → Student checks in → Attendance is recorded → Instructor reviews the result**

Future development can expand the system after the core MVP has been successfully completed.

## Project Status

**Status:** 🚧 In Development

**Current Focus:** MVP attendance workflow, database, QR-code check-in, instructor dashboard, and testing.

---

### Team Repository

This repository contains the source code, documentation, requirements, and development work for the **T.A.P. — Tiger Attendance Portal** project.
