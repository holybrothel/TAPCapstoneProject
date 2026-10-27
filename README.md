# T.A.P. — Coda DeepFace Development Branch

**A beginner-friendly setup and testing guide for teammates (macOS / Apple Silicon, Windows 11, and Ubuntu/Debian Linux).**

> **Current status (October 27, 2026):** The instructor dashboard, Node.js API, PostgreSQL connection, and Python DeepFace service have been started together on the developer's Mac. CORS preflight has passed. The instructor dashboard successfully created a session, and the backend assigned the course instructor automatically; the saved record was verified in PostgreSQL. **A successful end-to-end face enrollment → identification → attendance check-in has NOT yet been confirmed.** Treat that as the main test goal, not as a completed feature.

## 0. What are we testing?

T.A.P. is a classroom attendance prototype. An instructor selects a course and an **active** class session, turns on a camera, and scans one student's face. The Python DeepFace service tries to identify the student among people who are **(1) enrolled in that course and (2) have a reference face photo stored**. If it finds an unambiguous match, it records attendance. The instructor enters a numeric student ID **only when enrolling a reference photo**, not when scanning attendance.

This is a **local development prototype**. Do not use it for real classroom attendance or store actual student biometric data without appropriate authorization, consent, access controls, and security review.

## 1. Important before you begin

- **Use the correct branch:** `coda-deepface-development`, not `main`.
- **Choose the instructions for your operating system.** Sections 2–8 use macOS commands. Windows and Linux setup instructions appear in the platform-specific appendices below. Everyone can follow Sections 9–17 for testing, substituting the appropriate PostgreSQL command (`psql`) for the macOS-specific path.
- **Use a consenting volunteer and test-only records.** The `/enroll` endpoint stores a JPEG reference face photo in PostgreSQL (`deepface_enrollments.photo`). Do not put database dumps or face images on public GitHub.
- **Database setup is included in the branch.** Seven SQL migrations and a synthetic development seed script are committed. Run both as described below; the repository does not contain a pre-populated database.
- **The `start-tap.command` launcher is committed.** It starts local services after dependencies and the database have been configured; the manual commands below are available for troubleshooting.
- **Do not run `npm run dev`, `npm run db:migrate`, or `npm run db:seed` expecting them to work yet.** The current branch's `backend/package.json` only defines `npm test`; use the direct commands in this guide.

## 2. macOS (Apple Silicon): What to install (one-time setup)

Open **Terminal** (Applications → Utilities → Terminal).

### 2A. Install Homebrew, if needed

Check:

```bash
brew --version
```

If Terminal says `command not found`, follow the official instructions at https://brew.sh/ . After installing, open a new Terminal and retry `brew --version`.

### 2B. Install Python 3.11, PostgreSQL 17, Node.js, and Git

```bash
brew install python@3.11 postgresql@17 node git
```

Verify:

```bash
/opt/homebrew/bin/python3.11 --version
/opt/homebrew/opt/postgresql@17/bin/psql --version
node --version
npm --version
git --version
```

Expected: Python **3.11.x**, PostgreSQL **17.x**, and working Node/npm/Git commands. Node versions can vary.

## 3. Download the correct GitHub branch

Choose a folder where you want the project, then run:

```bash
cd "$HOME/Downloads"
git clone --branch coda-deepface-development --single-branch https://github.com/holybrothel/TAPCapstoneProject.git TAP-Coda
cd TAP-Coda
```

**If the repository is private**, GitHub may ask you to authenticate and the owner must grant you access.

Verify:

```bash
git branch --show-current
ls backend
```

Expected branch: `coda-deepface-development`.

> **Already have the project cloned?** Do not clone into the same folder. Ask a teammate familiar with Git before switching branches if you have uncommitted changes.

## 4. Set up the Node.js backend

```bash
cd "$HOME/Downloads/TAP-Coda/backend"
npm ci
```

`npm ci` installs the packages listed in `package-lock.json`. Wait for it to finish. If npm reports audit vulnerabilities, record them for the team; do not blindly run `npm audit fix --force` because it can change dependencies.

## 5. Set up Python DeepFace

Stay inside `backend` and run:

```bash
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install deepface flask flask-cors psycopg2-binary opencv-python numpy tf-keras
```

The installation may take several minutes. TensorFlow/DeepFace may download models on first use. This branch does **not** yet have a pinned Python requirements file, so different dependency versions could behave differently across teammates' machines.

Verify:

```bash
python -c "import deepface, flask, flask_cors, psycopg2, cv2; print('Python packages imported OK')"
```

If that prints the success message, continue. Leave this Terminal available.

## 6. Set up PostgreSQL and obtain the database schema

### 6A. Start PostgreSQL

Open a **new Terminal**:

```bash
brew services start postgresql@17
/opt/homebrew/opt/postgresql@17/bin/pg_isready
```

Expected: `accepting connections`.

### 6B. Create your own local database

```bash
/opt/homebrew/opt/postgresql@17/bin/createdb tap_attendance
```

If it says the database already exists, do **not** delete it. Ask the owner whether to reuse it.

### 6C. Apply the database migrations and development seed data — REQUIRED

The branch contains seven SQL migrations in `backend/database/migrations/` and synthetic test records in `backend/database/seeds/001_seed_dev_data.sql`. For a **new, empty local development database**, run:

```bash
cd "$HOME/Downloads/TAP-Coda/backend"
export DATABASE_URL="postgresql:///tap_attendance"
node database/run-migrations.js
node database/run-seeds.js
```

Expected seed output includes `Running seed: 001_seed_dev_data.sql` and `Seed data complete`. The seed script creates a fictional **Test Instructor**, **John Student**, course **CS-101**, an active enrollment, and a **Development Test Session**. It uses database-generated IDs and can be rerun without duplicating these sample records under normal single-user development conditions. The developer verified it locally; a completely fresh teammate installation still needs testing.

**Do not restore the owner's private database dump as part of normal setup.** Do not share biometric photos or unsanitized database backups.

### 6D. Verify the database tables

```bash
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "\dt"
```

Look for at least: `users`, `courses`, `enrollments`, `class_sessions`, `attendance_records`, and `deepface_enrollments`.

If those tables are missing, **stop here**. The website may load but recognition and attendance will not work.

## 7. Verify the seeded instructor, course, and student

The seed script should have created the fictional instructor and student and enrolled the student in **CS-101**. Verify their actual IDs rather than assuming fixed numbers:

```bash
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "SELECT user_id, first_name, last_name, role FROM users ORDER BY user_id;"
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "SELECT course_id, course_code, course_name, instructor_id FROM courses ORDER BY course_id;"
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "SELECT student_id, course_id, status FROM enrollments;"
```

The updated session-creation endpoint derives `created_by` from the selected course's `instructor_id` instead of requiring frontend `createdBy: 1`. This was tested via the API and dashboard, and the resulting database record was verified. **This is not authentication or authorization**: the backend still needs to check the identity and permissions of the instructor making the request before any real deployment.

## 8. Start the three servers

All three servers must run **at the same time**. Keep each Terminal window open.

### Terminal A — Python DeepFace (port 5000)

```bash
cd "$HOME/Downloads/TAP-Coda/backend"
source .venv/bin/activate
export DATABASE_URL="postgresql:///tap_attendance"
export FRONTEND_ORIGIN="http://localhost:5500"
python database/deepface_service.py
```

Expected: Flask running at `http://127.0.0.1:5000`.

### Terminal B — Node.js API (port 3000)

Open a second Terminal:

```bash
cd "$HOME/Downloads/TAP-Coda/backend"
export DATABASE_URL="postgresql:///tap_attendance"
node src/server.js
```

Expected: `PostgreSQL connected` and `T.A.P. backend running on http://localhost:3000`.

### Terminal C — Frontend (port 5500)

Open a third Terminal:

```bash
cd "$HOME/Downloads/TAP-Coda/backend"
python3 -m http.server 5500 --directory frontend
```

Expected: `Serving HTTP on ... port 5500`.

**Optional launcher:** If the owner has pushed `start-tap.command` into the branch, you may instead run it from the repository root with `./start-tap.command`. It was written for the owner's Mac; it still requires the database, Python environment, and npm dependencies to be installed. Do not run it while manual servers are already occupying those ports.

## 9. Check that the servers work

Open a fourth Terminal and run:

```bash
curl http://127.0.0.1:5000/health
curl http://localhost:3000/api/health
curl -I http://localhost:5500/instructor.html
```

Expected:

- DeepFace responds with JSON including `"status":"ok"`.
- Node.js returns a successful health response.
- The frontend returns HTTP `200 OK`.

**Check CORS**, which previously caused a browser error:

```bash
curl -i -X OPTIONS http://127.0.0.1:5000/identify \
  -H 'Origin: http://localhost:5500' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

Look for `Access-Control-Allow-Origin: http://localhost:5500`.

## 10. Open the instructor dashboard

In Chrome, open:

**http://localhost:5500/instructor.html**

Do not open the HTML file by double-clicking it from Finder (`file://...`); use the `localhost` address.

1. Confirm the page loads.
2. Choose **CS-101** (the seeded test course), or another course that exists in your database.
3. Create a class session using a name, start time, end time, and location. Make sure end time is later than start time.
4. Confirm the success message.
5. Confirm the session appears in the scanner's session selector.
6. Select **Python / DeepFace**, not Node / CompreFace, for this test.

**Development limitation:** The backend assigns the course's instructor as the session creator, but it does not yet verify that the person making the request is authenticated or authorized.

## 11. Create and enroll a consenting TEST student

For the scanner to recognize a student, the database must have:

1. A `users` row whose `role` is `student`.
2. An `enrollments` row connecting that student to the selected course with `status = 'active'`.
3. A reference face photo enrolled through DeepFace.
4. An active class session for that course.

### 11A. Check whether a test student is already available

```bash
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "SELECT user_id, first_name, last_name, role FROM users WHERE role = 'student';"
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "SELECT student_id, course_id, status FROM enrollments;"
```

The seed script should already have created **John Student** (`student@tap.local`) and enrolled that student in CS-101. Note the returned student ID for face enrollment. If you need a separate fictional test student, create one using a **fictional name and non-real email**:

```bash
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "INSERT INTO users (first_name, last_name, email, role) VALUES ('Demo', 'Student', 'demo.student@tap.local', 'student') RETURNING user_id;"
```

**Write down the returned `user_id`.** Do not assume it is `2`.

Find your course ID:

```bash
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "SELECT course_id, course_code FROM courses;"
```

To enroll an additional demo student in CS-101, run this command (it looks up IDs by email and course code rather than guessing):

```bash
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "INSERT INTO enrollments (student_id, course_id) SELECT u.user_id, c.course_id FROM users u CROSS JOIN courses c WHERE u.email = 'demo.student@tap.local' AND c.course_code = 'CS-101' ON CONFLICT (student_id, course_id) DO UPDATE SET status = 'active' RETURNING student_id, course_id, status;"
```

If the command returns zero rows, the course or demo student wasn't found. Fix that before continuing.

### 11B. Enroll a reference face photo

1. Ask the volunteer for **explicit permission** to store a reference face photo for this local test.
2. In the instructor dashboard, choose **Python / DeepFace**.
3. Click **Start Camera** and allow camera access.
4. Position exactly one consenting volunteer in good lighting.
5. Enter the **numeric student `user_id`** from step 11A into the **face enrollment** field.
6. Click **Enroll Face** and confirm consent.
7. Wait for a success message. This stores the reference JPEG in the local PostgreSQL database.

If you see `Student user ID not found`, verify the `users` row and its `student` role. If you see `No clear face detected`, improve lighting and try again.

## 12. Test automatic attendance recognition

1. Keep the Python, Node, and frontend servers running.
2. In the instructor dashboard, choose the course and **active** session.
3. Choose **Python / DeepFace** as the scanner engine.
4. Start the camera and position **the same volunteer** in view, with only one face visible.
5. Click the attendance scan/check-in button.
6. Watch for a result naming the recognized student and saying attendance was recorded.
7. Scan the same person again. The expected result is that the student is **already marked present** rather than creating a second record.
8. Try an **unenrolled consenting volunteer** or an image with no face. It should **not** record attendance.

### Verify the actual database record

Run:

```bash
/opt/homebrew/opt/postgresql@17/bin/psql -d tap_attendance -c "SELECT ar.attendance_id, u.first_name, u.last_name, ar.session_id, ar.check_in_time, ar.verification_status FROM attendance_records ar JOIN users u ON u.user_id = ar.student_id ORDER BY ar.check_in_time DESC LIMIT 10;"
```

If the scan says success but no attendance row appears, **report that as a bug**. The database is the source of truth for this test.

## 13. What to test and report

Mark each item **PASS**, **FAIL**, or **NOT TESTED**:

- [ ] All installations completed
- [ ] PostgreSQL database and required tables exist
- [ ] Python `/health` works
- [ ] Node `/api/health` works
- [ ] Instructor dashboard opens
- [ ] Course list loads
- [ ] Class session can be created
- [ ] Session appears in scanner selector
- [ ] Camera permission works
- [ ] Consenting test student reference photo enrolls
- [ ] Enrolled student is automatically identified **without entering an ID at scan time**
- [ ] Correct attendance record appears in PostgreSQL
- [ ] Repeated scan does not create a duplicate
- [ ] Unknown face does not create attendance
- [ ] Camera stops when requested
- [ ] Browser Console shows no unexpected errors

When reporting a bug, include: **step number**, what you clicked, expected result, actual error message, whether Python/Node terminals showed errors, and your operating system. **Do not include faces, database dumps, passwords, or access tokens** in bug reports.

## 14. Common errors and quick fixes

| Problem | What to check |
|---|---|
| `ModuleNotFoundError` | Activate `.venv` and reinstall Python dependencies (Step 5). |
| `ECONNREFUSED` / backend unavailable | Confirm the correct server is running on ports 3000 and 5000 (Steps 8–9). |
| Browser CORS error | Confirm `FRONTEND_ORIGIN=http://localhost:5500` was set **before** starting Python; rerun the CORS test. |
| PostgreSQL connection error | Start `postgresql@17`, check `pg_isready`, verify `DATABASE_URL`. |
| `relation ... does not exist` | Database schema is missing. Complete Step 6. |
| `class_sessions_created_by_fkey` | Verify the selected course has a valid `instructor_id` and the updated backend is running. |
| Course dropdown empty | Check `courses` table and Node server logs. |
| Session dropdown empty | Create a session and verify the correct course is selected. |
| `Student user ID not found` | Add a test student to `users` with `role='student'`. |
| `No registered faces in this active class` | Confirm active course enrollment, stored reference face, and active session. |
| `No clear face detected` | Improve lighting; keep one face in view. |
| Camera permission denied | Use Chrome on `localhost`, allow camera permissions, close other camera apps. |
| `Address already in use` | Another process is already using that port; stop the old server before restarting. |
| GitHub clone fails | Ask for repository access and authenticate with GitHub. |

## 15. How to stop and restart later

To stop the manually started servers, press **Control+C** in each of the three server Terminal windows. You do **not** need to reinstall everything when restarting your Mac.

On the next day:

1. Start PostgreSQL: `brew services start postgresql@17`.
2. Open three Terminal windows and repeat the commands in **Step 8**.
3. Open `http://localhost:5500/instructor.html`.
4. Continue testing. Your local database persists across ordinary restarts.

If `start-tap.command` has been committed and works on your Mac, you can use it instead of opening three server windows.

## 16. GitHub collaboration rules

- Work on **your own branch**, or coordinate with the owner before editing `coda-deepface-development`.
- Do **not** force-push, reset, or merge unrelated histories into the team's `main` branch.
- Do **not** commit `.env`, `.venv`, `node_modules`, database dumps, student photos, or credentials.
- For changes, commit and push your branch, then open a pull request for review.
- Do not run unreviewed database migration scripts against someone else's real data.

## 17. Completed milestones and remaining work

**Completed and pushed to `coda-deepface-development`:** Seven SQL migrations, synthetic development seed data, `start-tap.command`, and the initial setup guide. The session-creation instructor assignment fix was validated through the API, PostgreSQL, and the dashboard; commit and push the JavaScript changes separately if they are not yet on the remote branch.

**Remaining:**

1. **Verify a fresh teammate install** using the migration and seed commands above.
2. **Pin Python dependencies** in `requirements.txt` after testing a reproducible install.
3. **Implement real authentication and authorization** for instructors. The current course-instructor lookup is not an access-control mechanism; the older `backend/server.js` should not be treated as production-ready authentication.
4. **Confirm a full end-to-end DeepFace test**: face enrollment, identification, correct attendance row, duplicate prevention, and rejection of unknown faces.
5. **Review npm dependency vulnerabilities** and decide on safe updates.
6. **Plan biometric data retention/deletion and secure storage** before any real student use.

---

**Owner's original working Mac path:** `~/Downloads/TAPCapstoneProject-main 7/TAP-Resources`  
**Teammate clone path used in this guide:** `~/Downloads/TAP-Coda`  
**Branch:** `coda-deepface-development`  
**Frontend:** http://localhost:5500/instructor.html  
**Node API:** http://localhost:3000/api/health  
**Python API:** http://127.0.0.1:5000/health


---

## 18. Windows 11 installation (PowerShell)

**Status: installation instructions provided, but not yet verified on a teammate's Windows PC.** Use **Windows PowerShell**, not Command Prompt or Git Bash, for the commands in this section. Commands are intended for a local development machine, not production deployment.

### 18A. Install required software

Install these from their official websites, choosing **64-bit** builds:

- **Git for Windows:** https://git-scm.com/download/win
- **Node.js (LTS):** https://nodejs.org/en/download
- **Python 3.11:** https://www.python.org/downloads/ (select a Python 3.11.x release; enable **Add Python to PATH** when installing)
- **PostgreSQL 17:** https://www.postgresql.org/download/windows/ (the EDB installer includes PostgreSQL and `psql`; remember the `postgres` account password you set)

Open a **new PowerShell** after installation and verify:

```powershell
 git --version
 node --version
 npm --version
 py -3.11 --version
```

If PowerShell blocks `npm` scripts, use `npm.cmd` instead of `npm`; do not change system-wide execution policy just to install dependencies. PostgreSQL's `psql.exe` is normally at `C:\Program Files\PostgreSQL\17\bin\psql.exe`.

### 18B. Clone the project and install Node dependencies

```powershell
Set-Location "$HOME\Downloads"
git clone --branch coda-deepface-development --single-branch https://github.com/holybrothel/TAPCapstoneProject.git TAP-Coda
Set-Location "$HOME\Downloads\TAP-Coda\backend"
npm.cmd ci
```

### 18C. Create the Python environment

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install deepface flask flask-cors psycopg2-binary opencv-python numpy tf-keras
.\.venv\Scripts\python.exe -c "import deepface, flask, flask_cors, psycopg2, cv2; print('Python packages imported OK')"
```

Using `.venv\Scripts\python.exe` directly avoids PowerShell's virtual-environment activation policy. DeepFace/TensorFlow installation on Windows can be version-sensitive; if it fails, report the exact error and Python version. **Do not assume GPU acceleration is available**; CPU inference is acceptable for initial testing.

### 18D. Create the local PostgreSQL database

Make sure the PostgreSQL 17 Windows service is running (open **Services**, find the PostgreSQL 17 service, and start it if necessary). Then run:

```powershell
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
& $psql -U postgres -h localhost -d postgres -c "CREATE USER tap_dev WITH PASSWORD 'change-this-local-password';"
& $psql -U postgres -h localhost -d postgres -c "CREATE DATABASE tap_attendance OWNER tap_dev;"
```

The `postgres` commands prompt for the administrator password chosen during installation. **Replace `change-this-local-password` with a unique local development password**. If the role/database already exists, inspect it instead of deleting it. These commands are intended for a new installation.

Set the database URL in each PowerShell window that runs a backend service. Replace the password with the same local password; URL-encode special characters in it (or use an alphanumeric test-only password):

```powershell
$env:DATABASE_URL = "postgresql://tap_dev:change-this-local-password@localhost:5432/tap_attendance"
```

**Never commit a real database password to Git.** This environment variable lasts only for the current PowerShell process.

### 18E. Apply migrations and seed sample data

From `TAP-Coda\backend`, with `DATABASE_URL` set:

```powershell
node database/run-migrations.js
node database/run-seeds.js
& $psql -U tap_dev -h localhost -d tap_attendance -c "SELECT course_id, course_code FROM courses;"
```

You should see **CS-101**. The last command prompts for your `tap_dev` password. For repeat runs, review existing records first; never drop the database merely to reset a test.

### 18F. Start the three servers

Open **three separate PowerShell windows**. In each one, navigate to the backend folder:

```powershell
Set-Location "$HOME\Downloads\TAP-Coda\backend"
```

**Window A — DeepFace (5000):**

```powershell
$env:DATABASE_URL = "postgresql://tap_dev:change-this-local-password@localhost:5432/tap_attendance"
$env:FRONTEND_ORIGIN = "http://localhost:5500"
.\.venv\Scripts\python.exe database/deepface_service.py
```

**Window B — Node.js (3000):**

```powershell
$env:DATABASE_URL = "postgresql://tap_dev:change-this-local-password@localhost:5432/tap_attendance"
node src/server.js
```

**Window C — Frontend (5500):**

```powershell
.\.venv\Scripts\python.exe -m http.server 5500 --directory frontend
```

Test in a **fourth PowerShell window**:

```powershell
curl.exe http://127.0.0.1:5000/health
curl.exe http://localhost:3000/api/health
curl.exe -I http://localhost:5500/instructor.html
```

Open **http://localhost:5500/instructor.html** in Chrome. Continue with Sections 10–13. For SQL verification commands in those sections, use `& $psql -U tap_dev -h localhost -d tap_attendance -c "SQL HERE"` (define `$psql` again in any new PowerShell window). The macOS `start-tap.command` launcher **does not run natively on Windows**.

---

## 19. Ubuntu / Debian Linux installation (Bash)

**Status: installation instructions provided, but not yet verified on a teammate's Linux machine.** Commands below target a recent Ubuntu/Debian desktop using Bash and `apt`. Other distributions need different package installation commands. PostgreSQL 17 availability varies by distribution release; use the official PostgreSQL APT repository if your default repository does not offer version 17: https://www.postgresql.org/download/linux/ubuntu/ or https://www.postgresql.org/download/linux/debian/ .

### 19A. Install dependencies

Install **Git**, **Node.js LTS + npm**, **Python 3.11 with `venv` and `pip`**, and **PostgreSQL 17 server/client**. For Node.js, follow https://nodejs.org/en/download and verify `node --version` and `npm --version`. For Python 3.11, use your distribution's packages if available; otherwise use an officially supported installation method for your distribution. Do not replace your OS's system Python.

After configuring the appropriate package repositories, a typical Ubuntu/Debian installation command is:

```bash
sudo apt update
sudo apt install -y git build-essential python3.11 python3.11-venv python3-pip libgl1 libglib2.0-0 postgresql-17 postgresql-client-17
```

If `python3.11` or `postgresql-17` cannot be located, stop and install that version using your distribution's supported repository instructions rather than substituting an arbitrary version. TensorFlow wheels are architecture- and Python-version-dependent; **x86-64 Linux is the intended starting point**. Verify:

```bash
git --version
node --version
npm --version
python3.11 --version
psql --version
```

### 19B. Clone and install dependencies

```bash
cd "$HOME/Downloads"
git clone --branch coda-deepface-development --single-branch https://github.com/holybrothel/TAPCapstoneProject.git TAP-Coda
cd "$HOME/Downloads/TAP-Coda/backend"
npm ci
python3.11 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install deepface flask flask-cors psycopg2-binary opencv-python numpy tf-keras
.venv/bin/python -c "import deepface, flask, flask_cors, psycopg2, cv2; print('Python packages imported OK')"
```

### 19C. Configure PostgreSQL

Start PostgreSQL using your distribution's service manager:

```bash
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "CREATE USER tap_dev WITH PASSWORD 'change-this-local-password';"
sudo -u postgres psql -c "CREATE DATABASE tap_attendance OWNER tap_dev;"
```

Replace the placeholder password with a unique local development password. If the role/database already exists, inspect it instead of deleting it. Set the URL in each Bash window running a backend service:

```bash
export DATABASE_URL='postgresql://tap_dev:change-this-local-password@localhost:5432/tap_attendance'
```

URL-encode special characters in passwords. Do not commit credentials to Git.

### 19D. Run migrations and seed data

From the `backend` folder, with `DATABASE_URL` set:

```bash
node database/run-migrations.js
node database/run-seeds.js
psql "$DATABASE_URL" -c 'SELECT course_id, course_code FROM courses;'
```

Confirm that **CS-101** exists.

### 19E. Start the three servers

Open **three Bash terminals**. Run `cd "$HOME/Downloads/TAP-Coda/backend"` in each.

**Terminal A — DeepFace (5000):**

```bash
export DATABASE_URL='postgresql://tap_dev:change-this-local-password@localhost:5432/tap_attendance'
export FRONTEND_ORIGIN='http://localhost:5500'
.venv/bin/python database/deepface_service.py
```

**Terminal B — Node.js (3000):**

```bash
export DATABASE_URL='postgresql://tap_dev:change-this-local-password@localhost:5432/tap_attendance'
node src/server.js
```

**Terminal C — Frontend (5500):**

```bash
.venv/bin/python -m http.server 5500 --directory frontend
```

Verify in a fourth terminal:

```bash
curl http://127.0.0.1:5000/health
curl http://localhost:3000/api/health
curl -I http://localhost:5500/instructor.html
```

Open **http://localhost:5500/instructor.html** and continue with Sections 10–13. For SQL verification commands, use `psql "$DATABASE_URL" -c 'SQL HERE'` instead of the macOS-specific `/opt/homebrew/.../psql` path. The macOS `start-tap.command` launcher is **not a Linux setup script**.

---

## 20. Cross-platform testing notes

- **Verified:** macOS developer environment, PostgreSQL migrations and seed script on that Mac, DeepFace `/health`, Node API, and creating a session from the instructor dashboard with the correct instructor assignment.
- **Not yet verified:** a clean clone/install on Windows or Linux, or a complete face enrollment → identification → attendance record flow on any operating system.
- **Python dependencies are not pinned:** the `pip install` commands may resolve to newer versions over time; report version and installation errors to the team. A tested `requirements.txt` is a future improvement.
- **Local database only:** teammates each have their own PostgreSQL data; cloned code does not include the developer's database or face images.
- **Security:** use synthetic test accounts and consenting volunteers only. Do not publish face photos, database backups, `.env` files, or credentials. Instructor authorization is not implemented for real deployment.
- **Report issues with:** OS and version, CPU architecture, Python/Node/PostgreSQL versions, exact command, error text, and whether ports 3000/5000/5500 are running. Never include passwords or biometric data in reports.
