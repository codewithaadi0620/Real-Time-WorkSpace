-- SEED DEMO DATA
-- Password for all demo users is: password123 (bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)

DO $$
DECLARE
    user_aditya_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    user_rahul_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    user_priya_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    user_neha_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

    ws_eng_id UUID := 'w1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    ws_product_id UUID := 'w2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

    doc_arch_id UUID := 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    doc_api_id UUID := 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    doc_roadmap_id UUID := 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
BEGIN
    -- 1. Insert Demo Users
    INSERT INTO users (id, name, email, password_hash)
    VALUES
        (user_aditya_id, 'Aditya Sharma', 'aditya@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
        (user_rahul_id, 'Rahul Verma', 'rahul@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
        (user_priya_id, 'Priya Patel', 'priya@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
        (user_neha_id, 'Neha Gupta', 'neha@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
    ON CONFLICT (email) DO NOTHING;

    -- 2. Insert Workspaces
    INSERT INTO workspaces (id, name, description, owner_id)
    VALUES
        (ws_eng_id, 'Engineering Team', 'Core infrastructure, microservices architecture, and real-time backend systems.', user_aditya_id),
        (ws_product_id, 'Product & Design', 'Product roadmaps, user research, wireframes, and launch strategy.', user_priya_id)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Workspace Members
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES
        (ws_eng_id, user_aditya_id, 'OWNER'),
        (ws_eng_id, user_rahul_id, 'ADMIN'),
        (ws_eng_id, user_priya_id, 'MEMBER'),
        (ws_product_id, user_priya_id, 'OWNER'),
        (ws_product_id, user_neha_id, 'ADMIN'),
        (ws_product_id, user_aditya_id, 'MEMBER')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

    -- 4. Insert Documents
    INSERT INTO documents (id, workspace_id, title, content, created_by, updated_by)
    VALUES
        (
            doc_arch_id,
            ws_eng_id,
            'System Architecture Overview',
            '# System Architecture Overview'||CHR(10)||CHR(10)||'## 1. High-Level Design'||CHR(10)||'Our platform relies on a hybrid REST and WebSocket architecture.'||CHR(10)||'- **Node.js + Express**: Serves RESTful endpoints.'||CHR(10)||'- **Socket.IO**: Handles real-time document typing sync & presence.'||CHR(10)||'- **Redis**: Stores online user presence sets and caches hot workspace details.'||CHR(10)||'- **PostgreSQL**: Primary transactional persistence database.',
            user_aditya_id,
            user_aditya_id
        ),
        (
            doc_api_id,
            ws_eng_id,
            'REST API Specifications',
            '# REST API Specification'||CHR(10)||CHR(10)||'### Authentication'||CHR(10)||'- `POST /api/auth/register`'||CHR(10)||'- `POST /api/auth/login`'||CHR(10)||'- `POST /api/auth/logout`'||CHR(10)||CHR(10)||'### Workspaces'||CHR(10)||'- `GET /api/workspaces`'||CHR(10)||'- `POST /api/workspaces`',
            user_rahul_id,
            user_rahul_id
        ),
        (
            doc_roadmap_id,
            ws_product_id,
            'Q4 Product Roadmap',
            '# Q4 Product Strategy'||CHR(10)||CHR(10)||'1. Launch WebSocket presence & status indicator.'||CHR(10)||'2. Expand task Kanban board with drag-and-drop support.'||CHR(10)||'3. Add export options for workspace documents.',
            user_priya_id,
            user_priya_id
        )
    ON CONFLICT (id) DO NOTHING;

    -- 5. Insert Initial Document Versions
    INSERT INTO document_versions (document_id, content, edited_by)
    VALUES
        (doc_arch_id, '# Draft System Architecture', user_aditya_id),
        (doc_arch_id, '# System Architecture Overview'||CHR(10)||CHR(10)||'Initial design draft for review.', user_rahul_id),
        (doc_api_id, '# API Specifications Draft', user_rahul_id)
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Tasks
    INSERT INTO tasks (workspace_id, title, description, status, priority, assigned_to, created_by)
    VALUES
        (ws_eng_id, 'Configure Redis Caching', 'Set up Redis hash keys for workspace caching and cache invalidation hooks.', 'IN_PROGRESS', 'HIGH', user_rahul_id, user_aditya_id),
        (ws_eng_id, 'Setup PostgreSQL Pool', 'Create standard node-postgres pool configuration with parameterization.', 'DONE', 'HIGH', user_aditya_id, user_aditya_id),
        (ws_eng_id, 'Build Typing Indicator WebSocket', 'Implement debounced typing events over Socket.IO rooms.', 'TODO', 'MEDIUM', user_priya_id, user_rahul_id),
        (ws_product_id, 'Design Dark Theme UI', 'Craft sleek developer-oriented theme using Tailwind CSS and glassmorphism.', 'DONE', 'URGENT', user_neha_id, user_priya_id)
    ON CONFLICT (id) DO NOTHING;

    -- 7. Insert Comments
    INSERT INTO comments (document_id, user_id, content)
    VALUES
        (doc_arch_id, user_rahul_id, 'The Redis cache invalidation strategy looks super solid! Let''s make sure TTL is set to 1 hour.'),
        (doc_arch_id, user_aditya_id, 'Agreed Rahul, I have updated the cache service with auto-eviction on write events.'),
        (doc_api_id, user_priya_id, 'Can we add pagination params to the `GET /api/documents` endpoint?')
    ON CONFLICT (id) DO NOTHING;

    -- 8. Insert Notifications
    INSERT INTO notifications (user_id, workspace_id, type, message, read)
    VALUES
        (user_aditya_id, ws_eng_id, 'TASK_ASSIGNED', 'Rahul Verma assigned you task "Setup PostgreSQL Pool"', true),
        (user_aditya_id, ws_eng_id, 'COMMENT_ADDED', 'Priya Patel commented on "REST API Specifications"', false),
        (user_rahul_id, ws_eng_id, 'TASK_ASSIGNED', 'Aditya Sharma assigned you task "Configure Redis Caching"', false)
    ON CONFLICT (id) DO NOTHING;

END $$;
