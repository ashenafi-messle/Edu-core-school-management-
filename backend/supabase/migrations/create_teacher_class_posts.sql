CREATE TABLE IF NOT EXISTS teacher_class_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    grade_level VARCHAR(50) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_type VARCHAR(30) NOT NULL DEFAULT 'announcement' CHECK (post_type IN ('announcement', 'homework', 'reminder', 'resource')),
    publish_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS teacher_class_posts_scope_idx
  ON teacher_class_posts(school_id, teacher_id, grade_level, section_name, created_at DESC);

ALTER TABLE teacher_class_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS teacher_class_posts_school_policy ON teacher_class_posts;
CREATE POLICY teacher_class_posts_school_policy ON teacher_class_posts
  FOR ALL USING (school_id = get_current_school_id());

DROP TRIGGER IF EXISTS update_teacher_class_posts_modtime ON teacher_class_posts;
CREATE TRIGGER update_teacher_class_posts_modtime
  BEFORE UPDATE ON teacher_class_posts
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
