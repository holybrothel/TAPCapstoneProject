1. Project Name & Team Members:
    Name: T.A.P (Tiger Attendance Portal)
    Team Members: Coda Black, Tajah Refuge, Derrick Ellis, Novick Dragnire

2. Problem Statement:
  Manual attendance can take up class time, create inaccurate records, and make attendance hard to manage. Students may be marked incorrectly, and old methods allow one student to check in for another.

3. Target Users:
     The target users are staff and student in the classroom setting.

4. Main Features — Priority Order:
    1.	QR Code Attendance Check-In	Students scan a QR code generated for an active class session to record their attendance.
    2.	Instructor Session Management	Instructors can create class sessions and generate a QR code for each session.
    3.	Attendance Records	The system automatically records the student, class session, and check-in time.
    4.	Instructor Attendance Dashboard	Instructors can view attendance for an active or previous class session and make authorized corrections.
    5.	Attendance Reporting & Export	Instructors can review attendance information and generate/export useful attendance reports.

5. Functional Requirements:
      Student Check-In
          1. FR-1 The system shall allow an instructor to create a class attendance session.
          2. FR-4 The system shall record the student's identity when a valid check-in is submitted.
      Instructor Functions
          3. FR-9 The system shall allow an instructor to view the attendance list for a class session.
          4. FR-10 The system shall allow an authorized instructor to correct an attendance record.
      Data Management
          5. FR-14 The system shall store student records in the attendance database.

6. Non-Functional Requirements:
      ID	Requirement	Measurement
          1. NFR-1	Response Time	The system shall display a successful attendance confirmation within 2 seconds under normal classroom usage.
          2. NFR-5	Data Accuracy	The system shall prevent duplicate attendance records for the same student and class session with 100% success during testing.
          3. NFR-7	Usability	A student shall be able to complete a normal QR-code check-in in 30 seconds or less after opening the check-in screen.

7. Major Development Tasks:
      Student 1 - Backend and Database: Build the database and API needed to create sessions and save attendance records.
      Student 2 - QR Check-In: Build QR-code generation/scanning, validation, and duplicate check-in prevention.
      Student 3 - User Interface: Build the student check-in screen and instructor session/attendance screens.
      Student 4 - Testing and Integration: Test the complete workflow, document issues, and help integrate the components for the demonstration.
