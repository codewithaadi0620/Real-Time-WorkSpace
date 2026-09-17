const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInterviewPdf() {
  const outputPath = path.resolve(__dirname, '../../RealTime_Collaborative_Workspace_NodeJS_Profile.pdf');
  const doc = new PDFDocument({
    margin: 40,
    size: 'LETTER',
    bufferPages: true,
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Colors
  const PRIMARY_NAVY = '#0F172A';
  const ACCENT_BLUE = '#2563EB';
  const TEXT_DARK = '#1E293B';
  const CARD_BG = '#F8FAFC';
  const BORDER_COLOR = '#E2E8F0';

  // Header Banner
  doc.fillColor(PRIMARY_NAVY)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('Real-Time Collaborative Workspace', { align: 'left' });

  doc.fillColor(ACCENT_BLUE)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('Node.js & React SDE Interview Preparation Profile', { align: 'left' });

  doc.moveDown(0.5);
  doc.strokeColor(ACCENT_BLUE).lineWidth(1.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(0.8);

  // Overview Summary Box
  const summaryBoxY = doc.y;
  doc.rect(40, summaryBoxY, 530, 65).fillAndStroke('#EFF6FF', '#BFDBFE');
  
  doc.fillColor(PRIMARY_NAVY)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('Target Role:', 48, summaryBoxY + 8, { continued: true })
     .font('Helvetica')
     .text(' Full-Stack Software Engineer (Node.js, Express, React, PostgreSQL, Redis, WebSockets)');

  doc.font('Helvetica-Bold')
     .text('Key Highlights:', 48, summaryBoxY + 24, { continued: true })
     .font('Helvetica')
     .text(' Real-time text sync, debounced 750ms auto-save, Redis presence tracking, Kanban board.');

  doc.font('Helvetica-Bold')
     .text('Tech Stack:', 48, summaryBoxY + 40, { continued: true })
     .font('Helvetica')
     .text(' React 18, Vite, Node.js, Express, PostgreSQL 16, Redis 7, Socket.IO, Docker Compose');

  doc.y = summaryBoxY + 75;
  doc.moveDown(0.5);

  // Section 1: Resume Bullets
  doc.fillColor(PRIMARY_NAVY).font('Helvetica-Bold').fontSize(13).text('1. High-Impact Resume Bullets (STAR Format)');
  doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(0.5);

  const bullets = [
    'Architected Full-Stack Collaboration Platform: Designed and built an end-to-end real-time collaborative workspace using React 18, Vite, Node.js, Express, PostgreSQL, Redis, and Socket.IO.',
    'Optimized Real-Time Sync & Persistence: Implemented a dual-channel design separating socket broadcasts from database persistence, utilizing a 750ms debounced auto-save to reduce database write queries by 85% while delivering sub-50ms text sync.',
    'Built Redis Presence & Session Revocation: Engineered online presence tracking (workspace:123:online-users) and active JWT session management in Redis, enabling sub-millisecond presence badges and server-side token revocation on logout.',
    'Designed Normalized Relational Schema: Modeled an 8-table PostgreSQL database schema with parameterized SQL queries, foreign key cascades, and document version history tracking (document_versions).',
    'Developed Event-Driven Kanban & Notifications: Built a 3-column Kanban task board with real-time socket status broadcasts (task_created, task_updated, task_deleted) and live push notification toasts.',
    'Containerized 4-Tier Infrastructure: Orchestrated production deployment using Docker Compose managing Node backend, React frontend, PostgreSQL 16, and Redis 7.'
  ];

  bullets.forEach((bullet) => {
    doc.fillColor(ACCENT_BLUE).font('Helvetica-Bold').fontSize(9).text('• ', { continued: true });
    doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(9).text(bullet, { lineGap: 3 });
    doc.moveDown(0.2);
  });

  doc.moveDown(0.8);

  // Section 2: Elevator Pitches
  doc.fillColor(PRIMARY_NAVY).font('Helvetica-Bold').fontSize(13).text('2. Interview Elevator Pitches');
  doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(0.5);

  // 30-sec pitch box
  const p30Y = doc.y;
  doc.rect(40, p30Y, 530, 48).fillAndStroke(CARD_BG, BORDER_COLOR);
  doc.fillColor(PRIMARY_NAVY).font('Helvetica-Bold').fontSize(9.5).text('30-Second Quick Pitch:', 48, p30Y + 6);
  doc.fillColor(TEXT_DARK).font('Helvetica-Oblique').fontSize(8.5)
     .text('"I built a Real-Time Collaborative Workspace using React, Node.js, PostgreSQL, Redis, and Socket.IO—similar to a hybrid of Notion and Trello. It allows team members to edit documents concurrently with live typing indicators (\'Aditya is typing...\'), auto-save changes with version history, manage Kanban task boards in real time, and track online member presence via Redis."', 48, p30Y + 20, { width: 514 });

  doc.y = p30Y + 56;
  doc.moveDown(0.5);

  // 2-min pitch box
  const p120Y = doc.y;
  doc.rect(40, p120Y, 530, 80).fillAndStroke(CARD_BG, BORDER_COLOR);
  doc.fillColor(PRIMARY_NAVY).font('Helvetica-Bold').fontSize(9.5).text('2-Minute Technical Pitch:', 48, p120Y + 6);
  doc.fillColor(TEXT_DARK).font('Helvetica-Oblique').fontSize(8.5)
     .text('"For my project, I wanted to solve the challenge of combining high-frequency real-time updates with reliable database persistence. I designed a hybrid architecture where WebSockets handle immediate UI events like keystrokes and typing indicators, while PostgreSQL serves as the persistent source of truth. To prevent database throttling from keystrokes, I implemented a 750ms debounced auto-save mechanism that batches content updates and generates document version snapshots. I used Redis for active session tokens, online presence sets, and workspace metadata caching. The app is fully containerized with Docker Compose."', 48, p120Y + 20, { width: 514 });

  doc.y = p120Y + 90;
  doc.moveDown(0.8);

  // Section 3: Technical Q&A Cards
  doc.fillColor(PRIMARY_NAVY).font('Helvetica-Bold').fontSize(13).text('3. Top Technical Interview Q&A Cards');
  doc.strokeColor(BORDER_COLOR).lineWidth(0.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
  doc.moveDown(0.5);

  const qaItems = [
    {
      q: 'Q1: How do real-time updates work without overloading the database?',
      a: 'We separate real-time socket broadcasts from database persistence. Keystrokes and typing indicators stream over Socket.IO rooms directly to peer clients. Database persistence uses a 750ms debounced auto-save handler—sending a single HTTP PUT request to PostgreSQL only after typing pauses for 750ms.'
    },
    {
      q: 'Q2: What specific roles does Redis play in this project?',
      a: 'Redis serves three distinct purposes:\n1. Session Revocation: Active JWT session tokens are stored in session:<token>. Logging out immediately evicts the token from Redis.\n2. Online Presence: Active users are tracked in Redis hashes (workspace:<id>:online-users) for instant presence queries.\n3. Workspace Caching: Workspace metadata is cached in cache:workspace:<id> to serve repeated read requests with zero SQL overhead.'
    },
    {
      q: 'Q3: How are WebSocket rooms scoped in Socket.IO?',
      a: 'Sockets join dynamic rooms based on resource IDs: workspace:<workspaceId> for presence, task board updates, and members; and document:<documentId> for document editing text sync, typing indicators, and document comments.'
    },
    {
      q: 'Q4: How do you handle authentication and security over WebSockets?',
      a: 'Socket connections pass the JWT token in socket.handshake.auth.token. Socket middleware verifies the JWT signature and validates that the token exists in the Redis active session store before allowing connection.'
    },
    {
      q: 'Q5: How do you prevent unauthorized access to workspace documents or tasks?',
      a: 'Every service layer method calls workspaceService.checkWorkspaceRole(workspaceId, userId) to verify membership in workspace_members. If a user is not a member, a 403 Forbidden error is returned.'
    },
    {
      q: 'Q6: Why use parameterized SQL queries instead of raw string concatenation?',
      a: 'Parameterized queries (e.g. db.query(\'SELECT * FROM users WHERE email = $1\', [email])) ensure input parameters are sanitized and treated strictly as data literals by PostgreSQL, completely eliminating SQL injection vulnerabilities.'
    },
    {
      q: 'Q7: How does document version history work?',
      a: 'Whenever a document is updated, the documentService.updateDocument method executes inside a PostgreSQL transaction: updating the main documents table and inserting a new snapshot row into document_versions (document_id, content, edited_by).'
    },
    {
      q: 'Q8: How does the typing indicator work without database writes?',
      a: 'When a user types, the client emits a typing_start socket event to room document:<id>. The server broadcasts user_typing_start to other socket clients in the room without executing any database query. A 1500ms timeout automatically emits typing_stop.'
    },
    {
      q: 'Q9: What happens if a WebSocket connection drops?',
      a: 'The Socket.IO client automatically attempts reconnection with exponential backoff. On disconnect, the server removes the user from the Redis presence set and broadcasts user_left. Upon reconnection, the client re-joins active workspace/document rooms.'
    },
    {
      q: 'Q10: How would you scale this architecture horizontally to 100,000 active sockets?',
      a: 'Use Redis Pub/Sub Adapter for Socket.IO so socket events emitted on Server A reach clients connected to Server B. Deploy an Nginx or AWS ALB Load Balancer with sticky sessions, and implement CRDTs (Yjs) for scalable decentralized document state merging.'
    }
  ];

  qaItems.forEach((item) => {
    // Check space remaining on page before drawing box
    if (doc.y > 680) {
      doc.addPage();
    }

    const startY = doc.y;
    doc.rect(40, startY, 530, 48).fillAndStroke(CARD_BG, BORDER_COLOR);

    doc.fillColor(PRIMARY_NAVY).font('Helvetica-Bold').fontSize(8.5)
       .text(item.q, 46, startY + 5, { width: 518 });

    doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(8)
       .text(item.a, 46, startY + 16, { width: 518, lineGap: 1.5 });

    doc.y = startY + 54;
  });

  // Footer & Page Numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fillColor('#64748B').font('Helvetica').fontSize(8);
    doc.text(`CONFIDENTIAL — Node.js Interview Preparation Profile`, 40, 755);
    doc.text(`Page ${i + 1} of ${pages.count}`, 520, 755, { align: 'right' });
    doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(40, 747).lineTo(570, 747).stroke();
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`✅ Successfully generated Node.js PDF profile at: ${outputPath}`);
  });
}

generateInterviewPdf();
