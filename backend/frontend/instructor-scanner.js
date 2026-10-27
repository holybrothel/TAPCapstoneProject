// Instructor-operated attendance scanner. Uses existing POST /api/sessions/:id/check-in.
(() => {
  const camera = document.getElementById('camera');
  const placeholder = document.getElementById('camera-placeholder');
  const start = document.getElementById('start-camera-button');
  const stop = document.getElementById('stop-camera-button');
  const verify = document.getElementById('checkin-button');
  const session = document.getElementById('scanner-session');
  const message = document.getElementById('checkin-message');
  const canvas = document.getElementById('capture-canvas');
  const engine = document.getElementById('scanner-engine');
  const studentId = document.getElementById('scanner-student-id');
  const enroll = document.getElementById('enroll-face-button');
  let stream = null;
  let busy = false;
  function status(text, error = false) { message.textContent = text; message.style.color = error ? '#b42318' : '#2f694a'; }
  function update() { verify.disabled = busy || !stream || !session.value || false; enroll.disabled = busy || !stream || engine.value !== 'python' || !/^\d+$/.test(studentId.value.trim()); start.disabled = !!stream; stop.disabled = !stream; }
  function stopCamera() {
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null; camera.srcObject = null; camera.style.display = 'none'; placeholder.style.display = ''; update();
  }
  start.addEventListener('click', async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera requires localhost or HTTPS in a supported browser.');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      camera.srcObject = stream; await camera.play();
      camera.style.display = 'block'; placeholder.style.display = 'none';
      status('Camera ready. Select a session and position one student in frame.'); update();
    } catch (error) { stopCamera(); status(error.message || 'Camera permission denied or unavailable.', true); }
  });
  stop.addEventListener('click', () => { stopCamera(); status('Camera stopped.'); });
  session.addEventListener('change', update);
  engine.addEventListener('change', update); studentId.addEventListener('input', update);
  document.getElementById('instructor-course').addEventListener('change', () => {
    session.replaceChildren(new Option('Loading sessions…', '')); update();
  });
  window.addEventListener('tap:sessions-loaded', event => {
    session.replaceChildren(new Option('Choose a session', ''));
    for (const item of event.detail.sessions || []) {
      session.add(new Option(item.session_name || `Session ${item.session_id}`, item.session_id));
    }
    status('Choose a session and start the camera.'); update();
  });
  function captureImage() {
    if (!stream || !camera.videoWidth) throw new Error('Start the camera first.');
    canvas.width = camera.videoWidth; canvas.height = camera.videoHeight;
    canvas.getContext('2d').drawImage(camera, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }
  enroll.addEventListener('click', async () => {
    if (engine.value !== 'python' || !/^\d+$/.test(studentId.value.trim())) return;
    if (!confirm('Has this test participant consented to storing a reference face photo?')) return;
    busy = true; update(); status('Enrolling reference photo…');
    try {
      const response = await fetch('http://localhost:5000/enroll', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({student_id:Number(studentId.value),image:captureImage()})});
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Enrollment failed');
      status(data.message);
    } catch (e) {status(e.message, true);} finally {busy=false;update();}
  });
  verify.addEventListener('click', async () => {
    if (!session.value || !stream || !camera.videoWidth || busy) { status('Choose a session and start the camera first.', true); return; }
    busy = true; update(); status('Verifying face with attendance server…');
    try {
      canvas.width = camera.videoWidth; canvas.height = camera.videoHeight;
      canvas.getContext('2d').drawImage(camera, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('Unable to capture a camera image.');
      const body = new FormData(); body.append('faceImage', blob, 'attendance.jpg');
      const python = engine.value === 'python';
      const response = python
        ? await fetch('http://localhost:5000/identify', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:Number(session.value),image:canvas.toDataURL('image/jpeg',0.9)})})
        : await fetch(`http://localhost:3000/api/sessions/${encodeURIComponent(session.value)}/check-in`, { method: 'POST', body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.match === false) throw new Error(data.message || data.error || `Attendance server returned ${response.status}`);
      status(engine.value === 'python' ? `${data.message}${data.student?.name ? ' — ' + data.student.name : ''}` : `Verified: ${data.student?.name || 'Student'}${data.student?.studentNumber ? ' (' + data.student.studentNumber + ')' : ''}. Attendance recorded.`);
      // Other dashboard widgets can refresh after successful check-in.
      window.dispatchEvent(new CustomEvent('tap:attendance-recorded', { detail: data }));
    } catch (error) { status(error.message === 'Failed to fetch' ? 'Attendance server unavailable. Start the selected backend (Python: localhost:5000; Node: localhost:3000).'  : error.message, true); }
    finally { busy = false; update(); }
  });
  window.addEventListener('pagehide', stopCamera);
  document.getElementById('instructor-logout-button')?.addEventListener('click', stopCamera);
  update();
})();
