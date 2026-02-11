-- ============================================================================
-- Phase 4 Migration: Collaborative Learning & Advanced Features
-- ============================================================================
-- This migration adds collaborative features: discussions, study groups,
-- notifications, quizzes, and peer interactions.
--
-- Tables created:
-- - discussions: Discussion threads for materials and classes
-- - discussion_replies: Threaded comments
-- - study_groups: Student-created learning groups
-- - group_memberships: Student participation in groups
-- - group_messages: Group chat messages
-- - notifications: User notification center
-- - quizzes: Teacher-created assessments
-- - quiz_questions: Individual quiz questions
-- - quiz_responses: Student answers and scores
-- ============================================================================

-- ============================================================================
-- Discussion System
-- ============================================================================

-- Discussion threads (attached to materials or class-wide)
CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Context
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE, -- NULL = class-wide discussion

    -- Author
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Content
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Metadata
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false, -- Teachers can lock threads
    view_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT discussions_title_not_empty CHECK (char_length(title) > 0)
);

-- Discussion replies (threaded comments)
CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Links
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE, -- NULL = top-level reply
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Content
    content TEXT NOT NULL,

    -- Engagement
    likes_count INTEGER DEFAULT 0,
    is_best_answer BOOLEAN DEFAULT false, -- Teacher can mark as best answer

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT replies_content_not_empty CHECK (char_length(content) > 0)
);

-- Reply likes (many-to-many)
CREATE TABLE IF NOT EXISTS reply_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID NOT NULL REFERENCES discussion_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(reply_id, user_id)
);

-- Indexes
CREATE INDEX idx_discussions_class ON discussions(class_id, created_at DESC);
CREATE INDEX idx_discussions_material ON discussions(material_id);
CREATE INDEX idx_replies_discussion ON discussion_replies(discussion_id, created_at ASC);
CREATE INDEX idx_replies_parent ON discussion_replies(parent_reply_id);

-- ============================================================================
-- Study Groups
-- ============================================================================

-- Student-created study groups
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Context
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,

    -- Group details
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Settings
    max_members INTEGER DEFAULT 10,
    is_public BOOLEAN DEFAULT true, -- If false, join requires approval

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT group_name_not_empty CHECK (char_length(name) > 0)
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Status
    role TEXT DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(group_id, student_id)
);

-- Group messages (chat)
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Content
    message TEXT NOT NULL,

    -- Attachments (optional)
    attachment_url TEXT,
    attachment_type TEXT CHECK (attachment_type IN ('image', 'file', 'link')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT message_not_empty CHECK (char_length(message) > 0)
);

-- Indexes
CREATE INDEX idx_groups_class ON study_groups(class_id);
CREATE INDEX idx_group_messages ON group_messages(group_id, created_at DESC);

-- ============================================================================
-- Notification System
-- ============================================================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recipient
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Notification details
    type TEXT NOT NULL CHECK (type IN (
        'assignment_new',
        'assignment_due_soon',
        'assignment_overdue',
        'discussion_reply',
        'discussion_mention',
        'group_invite',
        'group_message',
        'quiz_graded',
        'struggling_alert',
        'material_shared',
        'announcement'
    )),

    -- Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Links
    link_type TEXT CHECK (link_type IN ('material', 'discussion', 'group', 'quiz', 'class')),
    link_id UUID, -- ID of the linked entity

    -- Status
    is_read BOOLEAN DEFAULT false,
    is_sent_email BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Preferences (JSON for flexibility)
    preferences JSONB DEFAULT '{
        "assignment_new": {"app": true, "email": false},
        "assignment_due_soon": {"app": true, "email": true},
        "assignment_overdue": {"app": true, "email": true},
        "discussion_reply": {"app": true, "email": false},
        "discussion_mention": {"app": true, "email": true},
        "group_message": {"app": true, "email": false},
        "quiz_graded": {"app": true, "email": true},
        "struggling_alert": {"app": true, "email": true}
    }'::jsonb,

    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- Quiz System
-- ============================================================================

-- Quizzes (teacher-created assessments)
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ownership
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Quiz details
    title TEXT NOT NULL,
    description TEXT,

    -- Settings
    time_limit_minutes INTEGER, -- NULL = no time limit
    passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    allow_retakes BOOLEAN DEFAULT true,
    show_correct_answers BOOLEAN DEFAULT true, -- After submission
    shuffle_questions BOOLEAN DEFAULT false,

    -- Metadata
    total_points INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT quiz_title_not_empty CHECK (char_length(title) > 0)
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,

    -- Question details
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),

    -- Ordering
    order_index INTEGER NOT NULL,

    -- Points
    points INTEGER DEFAULT 1 CHECK (points > 0),

    -- Answer options (for multiple choice)
    options JSONB, -- Array of option objects: [{"id": "a", "text": "...", "is_correct": true}, ...]

    -- Correct answer (for true/false and short answer)
    correct_answer TEXT,

    -- VARK-specific versions (optional)
    visual_version TEXT, -- Visual learners see images/diagrams
    auditory_version TEXT, -- Auditory learners hear question read aloud
    kinesthetic_version TEXT, -- Kinesthetic learners get hands-on scenarios

    CONSTRAINT question_text_not_empty CHECK (char_length(question_text) > 0)
);

-- Quiz assignments (linking quizzes to classes)
CREATE TABLE IF NOT EXISTS quiz_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,

    -- Assignment details
    assigned_by UUID NOT NULL REFERENCES profiles(id),
    due_date TIMESTAMP WITH TIME ZONE,

    -- Settings (can override quiz defaults)
    time_limit_override INTEGER,

    -- Visibility
    is_published BOOLEAN DEFAULT true,

    -- Timestamps
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(quiz_id, class_id)
);

-- Quiz responses (student submissions)
CREATE TABLE IF NOT EXISTS quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_assignment_id UUID NOT NULL REFERENCES quiz_assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Submission details
    answers JSONB NOT NULL, -- Array of answer objects: [{"question_id": "...", "answer": "...", "is_correct": true, "points": 1}, ...]

    -- Scoring
    score INTEGER NOT NULL CHECK (score >= 0),
    total_possible INTEGER NOT NULL,
    percentage NUMERIC GENERATED ALWAYS AS (
        CASE WHEN total_possible > 0
            THEN ROUND(100.0 * score / total_possible, 2)
            ELSE 0
        END
    ) STORED,

    -- Timing
    time_spent_seconds INTEGER DEFAULT 0,

    -- Status
    is_graded BOOLEAN DEFAULT false, -- False if has short answer questions
    graded_by UUID REFERENCES profiles(id), -- Teacher who graded (if manual)

    -- Attempt tracking
    attempt_number INTEGER DEFAULT 1,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX idx_quiz_assignments_class ON quiz_assignments(class_id, due_date);
CREATE INDEX idx_quiz_responses_student ON quiz_responses(student_id, submitted_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- Discussion Policies
CREATE POLICY "Users can view discussions in their classes"
    ON discussions FOR SELECT
    USING (
        class_id IN (
            SELECT class_id FROM class_memberships
            WHERE student_id = auth.uid() AND status = 'active'
            UNION
            SELECT id FROM classes WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can create discussions in their classes"
    ON discussions FOR INSERT
    WITH CHECK (author_id = auth.uid());

-- Reply Policies
CREATE POLICY "Users can view replies to visible discussions"
    ON discussion_replies FOR SELECT
    USING (
        discussion_id IN (
            SELECT id FROM discussions
            WHERE class_id IN (
                SELECT class_id FROM class_memberships
                WHERE student_id = auth.uid() AND status = 'active'
                UNION
                SELECT id FROM classes WHERE teacher_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create replies"
    ON discussion_replies FOR INSERT
    WITH CHECK (author_id = auth.uid());

-- Notification Policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- Quiz Policies
CREATE POLICY "Teachers can manage their quizzes"
    ON quizzes FOR ALL
    USING (teacher_id = auth.uid());

CREATE POLICY "Students can view assigned quizzes"
    ON quiz_assignments FOR SELECT
    USING (
        class_id IN (
            SELECT class_id FROM class_memberships
            WHERE student_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Students can submit responses"
    ON quiz_responses FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view their responses"
    ON quiz_responses FOR SELECT
    USING (student_id = auth.uid());

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discussions_updated_at
    BEFORE UPDATE ON discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER replies_updated_at
    BEFORE UPDATE ON discussion_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update discussion when new reply added
CREATE OR REPLACE FUNCTION update_discussion_on_reply()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions
    SET updated_at = NOW()
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_reply_updates_discussion
    AFTER INSERT ON discussion_replies
    FOR EACH ROW EXECUTE FUNCTION update_discussion_on_reply();

-- Update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussion_replies
        SET likes_count = likes_count + 1
        WHERE id = NEW.reply_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussion_replies
        SET likes_count = likes_count - 1
        WHERE id = OLD.reply_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reply_likes_count
    AFTER INSERT OR DELETE ON reply_likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Create notification on new reply
CREATE OR REPLACE FUNCTION notify_on_discussion_reply()
RETURNS TRIGGER AS $$
DECLARE
    discussion_author UUID;
    discussion_title TEXT;
BEGIN
    -- Get discussion author and title
    SELECT author_id, title INTO discussion_author, discussion_title
    FROM discussions
    WHERE id = NEW.discussion_id;

    -- Don't notify if replying to own discussion
    IF discussion_author != NEW.author_id THEN
        INSERT INTO notifications (user_id, type, title, message, link_type, link_id)
        VALUES (
            discussion_author,
            'discussion_reply',
            'New Reply',
            'Someone replied to your discussion: ' || discussion_title,
            'discussion',
            NEW.discussion_id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_discussion_reply
    AFTER INSERT ON discussion_replies
    FOR EACH ROW EXECUTE FUNCTION notify_on_discussion_reply();

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Phase 4 collaborative features are now ready:
-- - Discussion boards with threaded replies
-- - Study groups with chat
-- - Notification center
-- - Quiz creation and grading system
-- ============================================================================
