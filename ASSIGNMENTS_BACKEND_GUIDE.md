# Assignments Grader and Publisher Backend Implementation Guide

## Overview
This document describes the backend implementation for the assignments grader and publisher functionality in the teacher workspace. The system provides a complete backend infrastructure for creating, managing, and grading assignments.

## Database Schema

### Tables Created

#### 1. `assignments`
Stores published assignments and homework tasks created by teachers.

**Key Fields:**
- `id`: UUID primary key
- `school_id`: Multi-tenant isolation
- `teacher_id`: Reference to teacher who created the assignment
- `subject_id`: Reference to subject (optional)
- `title`: Assignment title
- `description`: Assignment description
- `assignment_type`: 'homework', 'assignment', or 'project'
- `instructions`: Detailed instructions for students
- `academic_year_id`: Reference to academic year
- `grade_level`: Target grade level (e.g., 'Grade 10')
- `section_name`: Target section (e.g., 'Section A')
- `max_marks`: Maximum possible score
- `due_date`: Assignment deadline
- `status`: 'draft', 'published', or 'archived'
- `attachments`: JSON array of file metadata

#### 2. `assignment_submissions`
Stores student submissions for assignments.

**Key Fields:**
- `id`: UUID primary key
- `school_id`: Multi-tenant isolation
- `assignment_id`: Reference to assignment
- `student_id`: Reference to student
- `submission_status`: 'draft', 'submitted', 'late', or 'graded'
- `submitted_date`: When the student submitted
- `student_answer`: Text response from student
- `student_comments`: Additional notes from student
- `file_attachments`: JSON array of submitted files

#### 3. `assignment_grades`
Stores grading information for assignment submissions.

**Key Fields:**
- `id`: UUID primary key
- `school_id`: Multi-tenant isolation
- `submission_id`: Reference to submission
- `assignment_id`: Reference to assignment
- `student_id`: Reference to student
- `score`: Numerical score awarded
- `max_score`: Maximum possible score
- `letter_grade`: Auto-calculated letter grade (A, B, C, D, F)
- `teacher_feedback`: Feedback from teacher
- `graded_by`: User ID of teacher who graded
- `graded_date`: When grading was completed

## API Endpoints

### Assignment Management

#### POST `/api/assignments`
Create a new assignment/homework.

**Request Body:**
```json
{
  "teacher_id": "uuid",
  "subject_id": "uuid (optional)",
  "title": "Assignment Title",
  "description": "Assignment description",
  "assignment_type": "homework|assignment|project",
  "instructions": "Detailed instructions",
  "academic_year_id": "uuid (optional)",
  "grade_level": "Grade 10 (optional)",
  "section_name": "Section A (optional)",
  "max_marks": 100,
  "due_date": "2026-08-25T23:59:00Z",
  "status": "published (optional)",
  "attachments": [
    {
      "name": "file.pdf",
      "size": "2.4 MB",
      "type": "application/pdf",
      "url": "/path/to/file.pdf"
    }
  ]
}
```

#### GET `/api/assignments`
List assignments with optional filters.

**Query Parameters:**
- `teacher_id`: Filter by teacher
- `subject_id`: Filter by subject
- `assignment_type`: Filter by type
- `status`: Filter by status
- `grade_level`: Filter by grade level
- `section_name`: Filter by section
- `academic_year_id`: Filter by academic year

#### GET `/api/assignments/[id]`
Get a specific assignment with teacher and subject details.

#### PUT `/api/assignments/[id]`
Update an assignment.

#### DELETE `/api/assignments/[id]`
Delete an assignment.

### Submission Management

#### POST `/api/assignments/[id]/submissions`
Create or update a student submission.

**Request Body:**
```json
{
  "student_id": "uuid",
  "student_answer": "Student's text response",
  "student_comments": "Additional notes",
  "file_attachments": [
    {
      "name": "submission.pdf",
      "size": "1.8 MB",
      "type": "application/pdf",
      "url": "/path/to/submission.pdf"
    }
  ],
  "submission_status": "submitted (optional)"
}
```

#### GET `/api/assignments/[id]/submissions`
List all submissions for an assignment.

**Query Parameters:**
- `status`: Filter by submission status

#### GET `/api/assignments/[id]/submissions/[submissionId]`
Get a specific submission with student details and grade (if graded).

### Grading

#### POST `/api/assignments/[id]/submissions/[submissionId]/grade`
Grade a submission.

**Request Body:**
```json
{
  "score": 85,
  "teacher_feedback": "Excellent work on the calculations",
  "graded_by": "uuid (optional)"
}
```

#### GET `/api/assignments/[id]/submissions/[submissionId]/grade`
Get the grade for a specific submission.

#### GET `/api/assignments/pending-grading`
Get all submissions pending grading for a teacher.

**Query Parameters:**
- `teacher_id`: Required - filter by teacher
- `subject_id`: Optional - filter by subject
- `grade_level`: Optional - filter by grade level
- `section_name`: Optional - filter by section

## API Client Methods

The `api` client in `src/lib/api.ts` includes the following methods:

### Assignment Management
- `createAssignment(assignment)` - Create new assignment
- `getAssignments(filters)` - List assignments with filters
- `getAssignment(id)` - Get specific assignment
- `updateAssignment(id, updates)` - Update assignment
- `deleteAssignment(id)` - Delete assignment

### Submission Management
- `createSubmission(assignmentId, submission)` - Create/update submission
- `getAssignmentSubmissions(assignmentId, status)` - List submissions
- `getSubmission(assignmentId, submissionId)` - Get specific submission

### Grading
- `gradeSubmission(assignmentId, submissionId, grade)` - Grade submission
- `getSubmissionGrade(assignmentId, submissionId)` - Get grade
- `getPendingGrading(filters)` - Get pending submissions for teacher

## Database Features

### Helper Functions

#### `calculate_letter_grade(score, max_score)`
Automatically calculates letter grade based on percentage:
- A: 90%+
- B: 80-89%
- C: 70-79%
- D: 60-69%
- F: <60%

#### `check_late_submission(assignment_id, submitted_date)`
Checks if a submission was submitted after the due date.

### Triggers

#### Auto Letter Grade Trigger
Automatically calculates and sets the letter grade when a grade is created or updated.

#### Timestamp Triggers
Automatically update `updated_at` timestamps on all tables.

### Row Level Security (RLS)
All tables have RLS policies ensuring multi-tenant isolation based on `school_id`.

## Integration with Frontend

### Teacher Workspace Integration

The existing teacher workspace frontend in `src/components/workspaces/TeacherWorkspace.tsx` can be updated to use the new backend:

1. **Replace localStorage with API calls:**
   - Replace `submissions` state management with `api.getPendingGrading()`
   - Replace `publishedHomework` state with `api.getAssignments()`
   - Replace `handlePublishNewTask` with `api.createAssignment()`
   - Replace `handlePublishGrade` with `api.gradeSubmission()`

2. **Update data structures:**
   - The backend uses UUIDs instead of string IDs
   - File attachments are stored as JSON arrays
   - Status values match the backend enum values

### Example Integration

```typescript
// Load pending submissions for grading
const loadPendingSubmissions = async () => {
  try {
    const submissions = await api.getPendingGrading({
      teacher_id: currentTeacherId,
      grade_level: 'Grade 10',
      section_name: 'Section A'
    });
    setSubmissions(submissions);
  } catch (error) {
    console.error('Failed to load submissions:', error);
  }
};

// Create new assignment
const handlePublishNewTask = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const newAssignment = await api.createAssignment({
      teacher_id: currentTeacherId,
      subject_id: selectedSubjectId,
      title: newTaskTitle,
      description: newTaskDesc,
      assignment_type: newTaskType,
      max_marks: newTaskMarks,
      due_date: newTaskDueDate,
      grade_level: 'Grade 10',
      section_name: 'Section A',
      attachments: newTaskFiles
    });
    
    setPublishedHomework(prev => [newAssignment, ...prev]);
    setPublishSuccess(true);
  } catch (error) {
    console.error('Failed to create assignment:', error);
  }
};

// Grade a submission
const handlePublishGrade = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedSubmission) return;

  try {
    const grade = await api.gradeSubmission(
      selectedSubmission.assignment_id,
      selectedSubmission.id,
      {
        score: gradeInputScore,
        teacher_feedback: gradeInputFeedback,
        graded_by: currentTeacherId
      }
    );

    // Update local state
    setSubmissions(prev => prev.map(s => {
      if (s.id === selectedSubmission.id) {
        return {
          ...s,
          grading_status: 'graded',
          grade: grade
        };
      }
      return s;
    }));

    setGradeActionSuccess(true);
  } catch (error) {
    console.error('Failed to grade submission:', error);
  }
};
```

## Migration and Seeding

### Running Migrations

1. **Create the assignments tables:**
   ```bash
   # Run the migration in Supabase SQL editor or via CLI
   psql -U postgres -d your_database -f backend/supabase/migrations/create_assignments_system.sql
   ```

2. **Seed sample data (optional):**
   ```bash
   psql -U postgres -d your_database -f backend/supabase/migrations/seed_assignments_data.sql
   ```

### Sample Data

The seed migration creates:
- 3 sample assignments (Chemistry lab report, Math homework, History essay)
- 4 sample student submissions
- 1 sample graded submission

## Testing

### Manual Testing with cURL

#### Create an assignment:
```bash
curl -X POST http://localhost:3000/api/assignments \
  -H "Content-Type: application/json" \
  -H "X-School-ID: your-school-id" \
  -d '{
    "teacher_id": "teacher-uuid",
    "title": "Test Assignment",
    "assignment_type": "homework",
    "max_marks": 100,
    "due_date": "2026-09-01T23:59:00Z"
  }'
```

#### Get pending grading:
```bash
curl -X GET "http://localhost:3000/api/assignments/pending-grading?teacher_id=teacher-uuid" \
  -H "X-School-ID: your-school-id"
```

#### Grade a submission:
```bash
curl -X POST http://localhost:3000/api/assignments/assignment-uuid/submissions/submission-uuid/grade \
  -H "Content-Type: application/json" \
  -H "X-School-ID: your-school-id" \
  -d '{
    "score": 85,
    "teacher_feedback": "Good work"
  }'
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request (validation errors)
- `404`: Not found
- `500`: Internal server error

Error responses follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

## Security Considerations

1. **Multi-tenant isolation:** All queries are scoped to the school ID from the `X-School-ID` header
2. **Row Level Security:** Database-level policies ensure data isolation
3. **Input validation:** All endpoints validate required fields and data types
4. **Teacher authorization:** Teachers can only grade their own assignments
5. **Score validation:** Scores are validated against assignment max marks

## Performance Considerations

1. **Indexing:** All foreign keys and common filter fields are indexed
2. **Query optimization:** Submissions are ordered by submission date
3. **Pagination:** Consider adding pagination for large datasets
4. **Caching:** The API client includes built-in caching for GET requests

## Future Enhancements

1. **File upload integration:** Connect with existing curriculum upload system
2. **Bulk grading:** Add endpoint for grading multiple submissions at once
3. **Rubric support:** Add rubric-based grading functionality
4. **Plagiarism detection:** Integration with plagiarism detection services
5. **Analytics:** Add assignment performance analytics
6. **Notifications:** Real-time notifications for new submissions
7. **Version history:** Track changes to assignments and grades
8. **Export functionality:** Export grades to various formats

## Troubleshooting

### Common Issues

1. **"School ID is required" error:**
   - Ensure the `X-School-ID` header is set in API requests
   - Check that a school is selected in the frontend

2. **"Assignment not found" error:**
   - Verify the assignment ID is correct
   - Check that the assignment belongs to the current school

3. **"Score must be between 0 and X" error:**
   - Ensure the score is within the valid range for the assignment
   - Check the assignment's `max_marks` value

4. **Database connection errors:**
   - Verify Supabase connection settings in `.env.local`
   - Check that the database migrations have been run

## Support

For issues or questions about the assignments backend:
1. Check the Supabase logs for detailed error messages
2. Review the database schema in the migration files
3. Test endpoints using the API client methods
4. Consult the existing codebase patterns in other API routes