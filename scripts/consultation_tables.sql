-- Create consultation room enhancement tables
-- Run this in the PostgreSQL database to add consultation room functionality

-- Enhanced consultation room for collaboration features
CREATE TABLE IF NOT EXISTS consultation_rooms (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    room_type VARCHAR(50) NOT NULL DEFAULT 'consultation',
    
    -- Participants
    client_id TEXT NOT NULL,
    consultant_id TEXT NOT NULL,
    
    -- Scheduling
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    
    -- Status management
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    
    -- Settings and configuration
    settings JSONB DEFAULT '{}',
    
    -- Optional consultation link
    consultation_id TEXT UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_consultation_rooms_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultation_rooms_consultant FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultation_rooms_consultation FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT chk_consultation_room_status CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_consultation_room_type CHECK (room_type IN ('consultation', 'training', 'review')),
    CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0)
);

-- Indexes for consultation_rooms
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_client_id ON consultation_rooms(client_id);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_consultant_id ON consultation_rooms(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_status ON consultation_rooms(status);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_scheduled_at ON consultation_rooms(scheduled_at);

-- Chat messages for consultation rooms
CREATE TABLE IF NOT EXISTS consultation_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    room_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    
    -- Status tracking
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_consultation_messages_room FOREIGN KEY (room_id) REFERENCES consultation_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultation_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_message_type CHECK (message_type IN ('text', 'file', 'system', 'action_item'))
);

-- Indexes for consultation_messages
CREATE INDEX IF NOT EXISTS idx_consultation_messages_room_id ON consultation_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_sender_id ON consultation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_created_at ON consultation_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_type ON consultation_messages(message_type);

-- Documents and files for consultation rooms
CREATE TABLE IF NOT EXISTS consultation_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    room_id TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL DEFAULT 'document',
    
    -- Content
    content TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Access control
    uploaded_by TEXT,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    is_shared BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_consultation_documents_room FOREIGN KEY (room_id) REFERENCES consultation_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultation_documents_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT chk_document_type CHECK (document_type IN ('document', 'template', 'attachment'))
);

-- Indexes for consultation_documents
CREATE INDEX IF NOT EXISTS idx_consultation_documents_room_id ON consultation_documents(room_id);
CREATE INDEX IF NOT EXISTS idx_consultation_documents_type ON consultation_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_consultation_documents_uploaded_by ON consultation_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_consultation_documents_is_template ON consultation_documents(is_template);

-- Whiteboard data for consultation rooms
CREATE TABLE IF NOT EXISTS consultation_whiteboards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    room_id TEXT NOT NULL,
    canvas_data JSONB NOT NULL,
    thumbnail_url VARCHAR(500),
    
    -- Versioning
    version INTEGER NOT NULL DEFAULT 1,
    parent_version_id TEXT,
    
    -- Metadata
    title VARCHAR(255) NOT NULL DEFAULT 'Whiteboard',
    updated_by TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_consultation_whiteboards_room FOREIGN KEY (room_id) REFERENCES consultation_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultation_whiteboards_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_consultation_whiteboards_parent FOREIGN KEY (parent_version_id) REFERENCES consultation_whiteboards(id),
    
    -- Check constraints
    CONSTRAINT chk_whiteboard_version_positive CHECK (version > 0)
);

-- Indexes for consultation_whiteboards
CREATE INDEX IF NOT EXISTS idx_consultation_whiteboards_room_id ON consultation_whiteboards(room_id);
CREATE INDEX IF NOT EXISTS idx_consultation_whiteboards_updated_by ON consultation_whiteboards(updated_by);
CREATE INDEX IF NOT EXISTS idx_consultation_whiteboards_version ON consultation_whiteboards(version);

-- Action items and follow-ups for consultation rooms
CREATE TABLE IF NOT EXISTS consultation_action_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    room_id TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    
    -- Assignment
    assigned_to TEXT,
    created_by TEXT,
    
    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    due_date TIMESTAMP,
    
    -- Completion
    completed_at TIMESTAMP,
    completion_notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_consultation_action_items_room FOREIGN KEY (room_id) REFERENCES consultation_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultation_action_items_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_consultation_action_items_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT chk_action_item_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT chk_action_item_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Indexes for consultation_action_items
CREATE INDEX IF NOT EXISTS idx_consultation_action_items_room_id ON consultation_action_items(room_id);
CREATE INDEX IF NOT EXISTS idx_consultation_action_items_assigned_to ON consultation_action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_consultation_action_items_status ON consultation_action_items(status);
CREATE INDEX IF NOT EXISTS idx_consultation_action_items_due_date ON consultation_action_items(due_date);

-- Room participants for group consultations
CREATE TABLE IF NOT EXISTS consultation_participants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    
    -- Role and permissions
    role VARCHAR(50) NOT NULL DEFAULT 'participant',
    permissions JSONB NOT NULL DEFAULT '{"canEdit": false, "canShare": false}',
    
    -- Participation tracking
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    left_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Activity metrics
    total_time_minutes INTEGER NOT NULL DEFAULT 0,
    messages_sent INTEGER NOT NULL DEFAULT 0,
    documents_viewed INTEGER NOT NULL DEFAULT 0,
    
    -- Foreign key constraints
    CONSTRAINT fk_consultation_participants_room FOREIGN KEY (room_id) REFERENCES consultation_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultation_participants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_participant_role CHECK (role IN ('host', 'consultant', 'client', 'participant', 'observer')),
    
    -- Unique constraint
    CONSTRAINT uq_consultation_participants_room_user UNIQUE (room_id, user_id)
);

-- Indexes for consultation_participants
CREATE INDEX IF NOT EXISTS idx_consultation_participants_room_id ON consultation_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_consultation_participants_user_id ON consultation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_participants_role ON consultation_participants(role);

-- Session analytics for consultation rooms
CREATE TABLE IF NOT EXISTS consultation_analytics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    room_id TEXT NOT NULL UNIQUE,
    
    -- Session metrics
    actual_duration_minutes INTEGER,
    participant_count INTEGER,
    messages_count INTEGER,
    documents_shared INTEGER,
    action_items_created INTEGER,
    
    -- Engagement metrics
    avg_response_time_seconds INTEGER,
    tool_usage JSONB,
    client_satisfaction_score DECIMAL(3,2),
    
    -- Technical metrics
    connection_issues INTEGER NOT NULL DEFAULT 0,
    feature_errors INTEGER NOT NULL DEFAULT 0,
    
    -- Business metrics
    follow_up_scheduled BOOLEAN NOT NULL DEFAULT FALSE,
    project_proposed BOOLEAN NOT NULL DEFAULT FALSE,
    contract_signed BOOLEAN NOT NULL DEFAULT FALSE,
    project_value DECIMAL(10,2),
    
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_consultation_analytics_room FOREIGN KEY (room_id) REFERENCES consultation_rooms(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_satisfaction_score_range CHECK (client_satisfaction_score >= 1.0 AND client_satisfaction_score <= 5.0)
);

-- Indexes for consultation_analytics
CREATE INDEX IF NOT EXISTS idx_consultation_analytics_recorded_at ON consultation_analytics(recorded_at);

-- Add relation to consultations table (one-to-one)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='consultations' AND column_name='room_id'
    ) THEN
        ALTER TABLE consultations ADD COLUMN room_id TEXT UNIQUE;
        ALTER TABLE consultations ADD CONSTRAINT fk_consultations_room 
            FOREIGN KEY (room_id) REFERENCES consultation_rooms(id) ON DELETE SET NULL;
    END IF;
END $$;