1. Project Title
  T.A.P (Tiger Attendance Portal) “Everybody T.A.P in for class to get credit”

2. Problem Statement
  Manual attendance can take up class time, create inaccurate records, and make attendance hard to manage. Students may be marked incorrectly, and old methods allow one student to check in for another.

3. Proposed Solution
  T.A.P. is a simple attendance system that lets an instructor create a class session and generate a QR code. Students scan the code to check in, and the system automatically records the student, session, and check-in time. The teacher can then review the attendance list.

4. Project Objectives
  We as a team plan to accomplish these objectives:
    - Develop a working student attendance database that stores students, courses, class sessions, and attendance records securely.
    - Implement an automatic check-in method, mainly using QR codes, with duplicate detection and a manual fallback option.
    - Create a professor dashboard that allows them to create sessions, monitor attendance, review records, and make authorized corrections.
    - Implement reporting and export functionality so professors can view attendance information and generate useful attendance reports.
    - Evaluate the system for accuracy, usability, privacy, and reliability through testing of normal use cases, failure cases, duplicate check-ins, and correction workflows.

5. Expected Outcome
  The project will deliver a working prototype that demonstrates one complete attendance workflow: create a session -> generate QR code -> student checks in -> attendance is recorded -> instructor reviews the result. This keeps the first version small, functional, and demonstrable while leaving additional features for later development. The goal at first is just to have the MVP and possibly so more later.

6. Preliminary Technologies
  The exact technologies may change during development. The team will prioritize tools that allow the core attendance workflow to be completed reliably within the project schedule.
    Frontend: HTML, CSS, and JavaScript; React may be used for the interface.
    Backend: Node.js with Express.js for application logic and APIs.
    Database: PostgreSQL for students, sessions, and attendance records.
    Check-In: QR-code generation and scanning.
    Version Control: Git and GitHub.

7. Initial Project Plan - The project will be divided between four students in the group based on their skills and strong suits:
  Student 1 - Backend and Database: Build the database and API needed to create sessions and save attendance records.
  Student 2 - QR Check-In: Build QR-code generation/scanning, validation, and duplicate check-in prevention.
  Student 3 - User Interface: Build the student check-in screen and instructor session/attendance screens.
  Student 4 - Testing and Integration: Test the complete workflow, document issues, and help integrate the components for the demonstration.

During testing, we will simulate realistic classroom scenarios, including students checking in, duplicate attempts, late attendance, absences, and instructor corrections. Problems discovered during testing will be documented and fixed before the final demonstration. Light use of AI will be used to only enhance or polish this project, and not full creation, just as it was used for this proposal.
