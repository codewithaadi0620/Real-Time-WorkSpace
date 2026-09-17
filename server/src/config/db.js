const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./env');

const realPool = new Pool({
  host: config.DB.host,
  port: config.DB.port,
  database: config.DB.database,
  user: config.DB.user,
  password: config.DB.password,
  connectionTimeoutMillis: 2000,
});

let isPostgresOnline = false;

// Pre-seeded In-Memory Store Fallback
const demoPasswordHash = bcrypt.hashSync('password123', 10);

const memoryDb = {
  users: [
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Aditya Sharma', email: 'aditya@example.com', password_hash: demoPasswordHash, created_at: new Date().toISOString() },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Rahul Verma', email: 'rahul@example.com', password_hash: demoPasswordHash, created_at: new Date().toISOString() },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Priya Patel', email: 'priya@example.com', password_hash: demoPasswordHash, created_at: new Date().toISOString() },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Neha Gupta', email: 'neha@example.com', password_hash: demoPasswordHash, created_at: new Date().toISOString() },
  ],
  workspaces: [
    { id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Engineering Team', description: 'Core infrastructure, microservices architecture, and real-time backend systems.', owner_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'w2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Product & Design', description: 'Product roadmaps, user research, wireframes, and launch strategy.', owner_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  workspace_members: [
    { id: 'wm1', workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', role: 'OWNER', joined_at: new Date().toISOString() },
    { id: 'wm2', workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', role: 'ADMIN', joined_at: new Date().toISOString() },
    { id: 'wm3', workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', role: 'MEMBER', joined_at: new Date().toISOString() },
    { id: 'wm4', workspace_id: 'w2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', role: 'OWNER', joined_at: new Date().toISOString() },
    { id: 'wm5', workspace_id: 'w2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', role: 'ADMIN', joined_at: new Date().toISOString() },
  ],
  documents: [
    {
      id: 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'System Architecture Overview',
      content: '# System Architecture Overview\n\n## 1. High-Level Design\nOur platform relies on a hybrid REST and WebSocket architecture.\n- **Node.js + Express**: Serves RESTful endpoints.\n- **Socket.IO**: Handles real-time document typing sync & presence.\n- **Redis**: Stores online user presence sets and caches hot workspace details.\n- **PostgreSQL**: Primary transactional persistence database.',
      created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      updated_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'REST API Specifications',
      content: '# REST API Specification\n\n### Authentication\n- `POST /api/auth/register`\n- `POST /api/auth/login`\n- `POST /api/auth/logout`',
      created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      updated_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  document_versions: [
    { id: 'v1', document_id: 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', content: '# Initial Draft Architecture', edited_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() }
  ],
  tasks: [
    { id: 't1', workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', title: 'Configure Redis Caching', description: 'Set up Redis hash keys for workspace caching and cache invalidation hooks.', status: 'IN_PROGRESS', priority: 'HIGH', assigned_to: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 't2', workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', title: 'Setup PostgreSQL Pool', description: 'Create standard node-postgres pool configuration with parameterization.', status: 'DONE', priority: 'HIGH', assigned_to: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 't3', workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', title: 'Build Typing Indicator WebSocket', description: 'Implement debounced typing events over Socket.IO rooms.', status: 'TODO', priority: 'MEDIUM', assigned_to: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  comments: [
    { id: 'c1', document_id: 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', content: 'The Redis cache strategy looks solid!', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  notifications: [
    { id: 'n1', user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', workspace_id: 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', type: 'TASK_ASSIGNED', message: 'Rahul Verma assigned you task "Setup PostgreSQL Pool"', read: false, created_at: new Date().toISOString() }
  ]
};

async function executeQuery(text, params = []) {
  if (isPostgresOnline) {
    try {
      return await realPool.query(text, params);
    } catch (err) {
      console.warn('PostgreSQL query error, switching to memory DB:', err.message);
      isPostgresOnline = false;
    }
  }

  // --- In-Memory Mock Query Processor ---
  const sql = text.trim();

  // 1. SELECT EXISTS / check tables
  if (sql.includes('information_schema.tables')) {
    return { rows: [{ exists: true }] };
  }

  // 2. USERS queries
  if (sql.includes('FROM users')) {
    if (sql.includes('WHERE email =')) {
      const emailParam = (params[0] || '').toLowerCase();
      const found = memoryDb.users.filter((u) => u.email.toLowerCase() === emailParam);
      return { rows: found };
    }
    if (sql.includes('WHERE id =')) {
      const found = memoryDb.users.filter((u) => u.id === params[0]);
      return { rows: found };
    }
  }

  if (sql.includes('INSERT INTO users')) {
    const newUser = {
      id: `u-${Date.now()}`,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      created_at: new Date().toISOString(),
    };
    memoryDb.users.push(newUser);
    return { rows: [newUser] };
  }

  // 3. WORKSPACES queries
  if (sql.includes('FROM workspaces')) {
    if (sql.includes('INNER JOIN workspace_members')) {
      const userId = params[0];
      const userMemberships = memoryDb.workspace_members.filter((wm) => wm.user_id === userId);
      const rows = userMemberships.map((wm) => {
        const ws = memoryDb.workspaces.find((w) => w.id === wm.workspace_id);
        if (!ws) return null;
        const memberCount = memoryDb.workspace_members.filter((m) => m.workspace_id === ws.id).length;
        const docCount = memoryDb.documents.filter((d) => d.workspace_id === ws.id).length;
        const taskCount = memoryDb.tasks.filter((t) => t.workspace_id === ws.id && t.status !== 'DONE').length;
        return {
          ...ws,
          role: wm.role,
          member_count: memberCount,
          document_count: docCount,
          active_task_count: taskCount,
        };
      }).filter(Boolean);
      return { rows };
    }

    if (sql.includes('WHERE w.id =') || sql.includes('WHERE id =')) {
      const wsId = params[0];
      const ws = memoryDb.workspaces.find((w) => w.id === wsId);
      if (!ws) return { rows: [] };
      const owner = memoryDb.users.find((u) => u.id === ws.owner_id);
      return { rows: [{ ...ws, owner_name: owner ? owner.name : 'Unknown' }] };
    }
  }

  if (sql.includes('INSERT INTO workspaces')) {
    const newWs = {
      id: `w-${Date.now()}`,
      name: params[0],
      description: params[1],
      owner_id: params[2],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDb.workspaces.push(newWs);
    return { rows: [newWs] };
  }

  if (sql.includes('UPDATE workspaces')) {
    const wsId = params[2];
    const ws = memoryDb.workspaces.find((w) => w.id === wsId);
    if (ws) {
      if (params[0]) ws.name = params[0];
      if (params[1]) ws.description = params[1];
      ws.updated_at = new Date().toISOString();
      return { rows: [ws] };
    }
    return { rows: [] };
  }

  if (sql.includes('DELETE FROM workspaces')) {
    const wsId = params[0];
    memoryDb.workspaces = memoryDb.workspaces.filter((w) => w.id !== wsId);
    return { rows: [] };
  }

  // 4. WORKSPACE MEMBERS queries
  if (sql.includes('FROM workspace_members')) {
    if (sql.includes('WHERE workspace_id = $1 AND user_id = $2')) {
      const found = memoryDb.workspace_members.filter((wm) => wm.workspace_id === params[0] && wm.user_id === params[1]);
      return { rows: found };
    }
    if (sql.includes('WHERE wm.workspace_id =')) {
      const members = memoryDb.workspace_members.filter((wm) => wm.workspace_id === params[0]);
      const rows = members.map((wm) => {
        const u = memoryDb.users.find((usr) => usr.id === wm.user_id);
        return {
          id: wm.id,
          role: wm.role,
          joined_at: wm.joined_at,
          user_id: u ? u.id : wm.user_id,
          name: u ? u.name : 'User',
          email: u ? u.email : '',
        };
      });
      return { rows };
    }
  }

  if (sql.includes('INSERT INTO workspace_members')) {
    const newMember = {
      id: `wm-${Date.now()}`,
      workspace_id: params[0],
      user_id: params[1],
      role: params[2] || 'MEMBER',
      joined_at: new Date().toISOString(),
    };
    memoryDb.workspace_members.push(newMember);
    return { rows: [newMember] };
  }

  if (sql.includes('DELETE FROM workspace_members')) {
    memoryDb.workspace_members = memoryDb.workspace_members.filter((wm) => !(wm.workspace_id === params[0] && wm.user_id === params[1]));
    return { rows: [] };
  }

  // 5. DOCUMENTS queries
  if (sql.includes('FROM documents')) {
    if (sql.includes('WHERE d.workspace_id =')) {
      const docs = memoryDb.documents.filter((d) => d.workspace_id === params[0]);
      const rows = docs.map((d) => {
        const u1 = memoryDb.users.find((u) => u.id === d.created_by);
        const u2 = memoryDb.users.find((u) => u.id === d.updated_by);
        const commentCount = memoryDb.comments.filter((c) => c.document_id === d.id).length;
        const versionCount = memoryDb.document_versions.filter((v) => v.document_id === d.id).length;
        return {
          ...d,
          creator_name: u1 ? u1.name : 'Author',
          updater_name: u2 ? u2.name : 'Author',
          comment_count: commentCount,
          version_count: versionCount || 1,
        };
      });
      return { rows };
    }
    if (sql.includes('WHERE d.id =') || sql.includes('WHERE id =')) {
      const doc = memoryDb.documents.find((d) => d.id === params[0]);
      if (!doc) return { rows: [] };
      const u1 = memoryDb.users.find((u) => u.id === doc.created_by);
      const u2 = memoryDb.users.find((u) => u.id === doc.updated_by);
      return {
        rows: [{
          ...doc,
          creator_name: u1 ? u1.name : 'Author',
          updater_name: u2 ? u2.name : 'Author',
        }]
      };
    }
  }

  if (sql.includes('INSERT INTO documents')) {
    const newDoc = {
      id: `d-${Date.now()}`,
      workspace_id: params[0],
      title: params[1],
      content: params[2] || '',
      created_by: params[3],
      updated_by: params[3],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDb.documents.push(newDoc);
    return { rows: [newDoc] };
  }

  if (sql.includes('UPDATE documents')) {
    const docId = params[3];
    const doc = memoryDb.documents.find((d) => d.id === docId);
    if (doc) {
      if (params[0] !== undefined) doc.title = params[0];
      if (params[1] !== undefined) doc.content = params[1];
      if (params[2] !== undefined) doc.updated_by = params[2];
      doc.updated_at = new Date().toISOString();
      return { rows: [doc] };
    }
    return { rows: [] };
  }

  if (sql.includes('DELETE FROM documents')) {
    const docId = params[0];
    memoryDb.documents = memoryDb.documents.filter((d) => d.id !== docId);
    return { rows: [] };
  }

  // 6. DOCUMENT VERSIONS queries
  if (sql.includes('FROM document_versions')) {
    const versions = memoryDb.document_versions.filter((v) => v.document_id === params[0]);
    const rows = versions.map((v) => {
      const u = memoryDb.users.find((usr) => usr.id === v.edited_by);
      return {
        ...v,
        editor_name: u ? u.name : 'Editor',
        editor_email: u ? u.email : '',
      };
    });
    return { rows };
  }

  if (sql.includes('INSERT INTO document_versions')) {
    const newVer = {
      id: `v-${Date.now()}`,
      document_id: params[0],
      content: params[1],
      edited_by: params[2],
      created_at: new Date().toISOString(),
    };
    memoryDb.document_versions.push(newVer);
    return { rows: [newVer] };
  }

  // 7. TASKS queries
  if (sql.includes('FROM tasks')) {
    if (sql.includes('WHERE t.workspace_id =')) {
      const tasks = memoryDb.tasks.filter((t) => t.workspace_id === params[0]);
      const rows = tasks.map((t) => {
        const u1 = memoryDb.users.find((u) => u.id === t.assigned_to);
        const u2 = memoryDb.users.find((u) => u.id === t.created_by);
        return {
          ...t,
          assignee_name: u1 ? u1.name : null,
          assignee_email: u1 ? u1.email : null,
          creator_name: u2 ? u2.name : 'Creator',
        };
      });
      return { rows };
    }
    if (sql.includes('WHERE t.id =')) {
      const t = memoryDb.tasks.find((tk) => tk.id === params[0]);
      if (!t) return { rows: [] };
      const u1 = memoryDb.users.find((u) => u.id === t.assigned_to);
      const u2 = memoryDb.users.find((u) => u.id === t.created_by);
      return {
        rows: [{
          ...t,
          assignee_name: u1 ? u1.name : null,
          creator_name: u2 ? u2.name : 'Creator',
        }]
      };
    }
  }

  if (sql.includes('INSERT INTO tasks')) {
    const newTask = {
      id: `t-${Date.now()}`,
      workspace_id: params[0],
      title: params[1],
      description: params[2] || '',
      status: params[3] || 'TODO',
      priority: params[4] || 'MEDIUM',
      assigned_to: params[5] || null,
      created_by: params[6],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDb.tasks.push(newTask);
    return { rows: [newTask] };
  }

  if (sql.includes('UPDATE tasks')) {
    const taskId = params[5];
    const task = memoryDb.tasks.find((t) => t.id === taskId);
    if (task) {
      if (params[0] !== undefined) task.title = params[0];
      if (params[1] !== undefined) task.description = params[1];
      if (params[2] !== undefined) task.status = params[2];
      if (params[3] !== undefined) task.priority = params[3];
      if (params[4] !== undefined) task.assigned_to = params[4];
      task.updated_at = new Date().toISOString();
      return { rows: [task] };
    }
    return { rows: [] };
  }

  if (sql.includes('DELETE FROM tasks')) {
    const taskId = params[0];
    memoryDb.tasks = memoryDb.tasks.filter((t) => t.id !== taskId);
    return { rows: [] };
  }

  // 8. COMMENTS queries
  if (sql.includes('FROM comments')) {
    const comments = memoryDb.comments.filter((c) => c.document_id === params[0]);
    const rows = comments.map((c) => {
      const u = memoryDb.users.find((usr) => usr.id === c.user_id);
      return {
        ...c,
        user_name: u ? u.name : 'User',
        user_email: u ? u.email : '',
      };
    });
    return { rows };
  }

  if (sql.includes('INSERT INTO comments')) {
    const newComment = {
      id: `c-${Date.now()}`,
      document_id: params[0],
      user_id: params[1],
      content: params[2],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDb.comments.push(newComment);
    return { rows: [newComment] };
  }

  if (sql.includes('DELETE FROM comments')) {
    const commentId = params[0];
    memoryDb.comments = memoryDb.comments.filter((c) => c.id !== commentId);
    return { rows: [] };
  }

  // 9. NOTIFICATIONS queries
  if (sql.includes('FROM notifications')) {
    const notifs = memoryDb.notifications.filter((n) => n.user_id === params[0]);
    return { rows: notifs };
  }

  if (sql.includes('INSERT INTO notifications')) {
    const newNotif = {
      id: `n-${Date.now()}`,
      user_id: params[0],
      workspace_id: params[1],
      type: params[2],
      message: params[3],
      read: false,
      created_at: new Date().toISOString(),
    };
    memoryDb.notifications.push(newNotif);
    return { rows: [newNotif] };
  }

  if (sql.includes('UPDATE notifications')) {
    const notif = memoryDb.notifications.find((n) => n.id === params[0]);
    if (notif) notif.read = true;
    return { rows: [notif || {}] };
  }

  return { rows: [] };
}

// Test initial PostgreSQL connection asynchronously
realPool.query('SELECT 1').then(() => {
  console.log('✅ PostgreSQL database connected successfully.');
  isPostgresOnline = true;
}).catch(() => {
  console.log('ℹ️ Local PostgreSQL server offline; using robust in-memory database store.');
  isPostgresOnline = false;
});

const mockClient = {
  query: executeQuery,
  release: () => {},
};

module.exports = {
  pool: {
    connect: async () => mockClient,
    query: executeQuery,
  },
  query: executeQuery,
};
