-- Persistent teacher messaging with Supabase Realtime support
CREATE TABLE IF NOT EXISTS teacher_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    participant_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    participant_entity_id UUID,
    participant_type VARCHAR(30) NOT NULL CHECK (participant_type IN ('student', 'parent', 'director')),
    participant_name VARCHAR(255) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('students', 'parents', 'directors', 'teachers', 'groups')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE teacher_conversations ADD COLUMN IF NOT EXISTS is_group BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE teacher_conversations ADD COLUMN IF NOT EXISTS group_key VARCHAR(255);
ALTER TABLE teacher_conversations ADD COLUMN IF NOT EXISTS group_name VARCHAR(255);
ALTER TABLE teacher_conversations DROP CONSTRAINT IF EXISTS teacher_conversations_participant_type_check;
ALTER TABLE teacher_conversations ADD CONSTRAINT teacher_conversations_participant_type_check
  CHECK (participant_type IN ('student', 'parent', 'director', 'teacher', 'group'));
ALTER TABLE teacher_conversations DROP CONSTRAINT IF EXISTS teacher_conversations_category_check;
ALTER TABLE teacher_conversations ADD CONSTRAINT teacher_conversations_category_check
  CHECK (category IN ('students', 'parents', 'directors', 'teachers', 'groups'));

UPDATE teacher_conversations AS conversation
SET
  participant_user_id = teacher.user_id,
  participant_entity_id = teacher.id
FROM teachers AS teacher
WHERE conversation.teacher_id = teacher.id
  AND conversation.is_group = TRUE
  AND conversation.participant_entity_id IS NULL
  AND teacher.user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS teacher_conversations_participant_user_idx
  ON teacher_conversations(teacher_id, participant_user_id)
  WHERE participant_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS teacher_conversations_participant_entity_idx
  ON teacher_conversations(teacher_id, participant_entity_id, participant_type)
  WHERE participant_entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS teacher_conversations_teacher_idx ON teacher_conversations(school_id, teacher_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS teacher_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES teacher_conversations(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_role VARCHAR(30) NOT NULL,
    body TEXT NOT NULL CHECK (length(trim(body)) > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES teacher_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('teacher', 'student', 'parent', 'director')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS teacher_conversation_members_user_idx
  ON teacher_conversation_members(school_id, user_id);

CREATE INDEX IF NOT EXISTS teacher_messages_conversation_idx ON teacher_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS teacher_messages_school_idx ON teacher_messages(school_id, created_at DESC);

ALTER TABLE teacher_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_conversation_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_conversations_school_policy ON teacher_conversations;
CREATE POLICY teacher_conversations_school_policy ON teacher_conversations
  FOR ALL USING (school_id = get_current_school_id());
DROP POLICY IF EXISTS teacher_messages_school_policy ON teacher_messages;
CREATE POLICY teacher_messages_school_policy ON teacher_messages
  FOR ALL USING (school_id = get_current_school_id());
DROP POLICY IF EXISTS teacher_conversation_members_school_policy ON teacher_conversation_members;
CREATE POLICY teacher_conversation_members_school_policy ON teacher_conversation_members
  FOR ALL USING (school_id = get_current_school_id());

DROP TRIGGER IF EXISTS update_teacher_conversations_modtime ON teacher_conversations;
CREATE TRIGGER update_teacher_conversations_modtime
  BEFORE UPDATE ON teacher_conversations
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE teacher_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
