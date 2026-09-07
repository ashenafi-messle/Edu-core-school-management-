// Test curriculum and plans backend APIs
const TEACHER_ID = '56652d7a-9ddf-492c-bb4b-26ab672ef9c8';
const SCHOOL_ID = 'a7b3c29d-4e8f-4d91-bd30-4e123456789a';
const BASE_URL = 'http://localhost:3001';

async function testCurriculumBackend() {
  console.log('Testing Curriculum and Plans Backend...');
  console.log('Teacher ID:', TEACHER_ID);
  console.log('School ID:', SCHOOL_ID);
  console.log('Base URL:', BASE_URL);
  console.log('');

  try {
    // Test 1: Get curriculum documents
    console.log('Test 1: Get curriculum documents...');
    const documentsResponse = await fetch(`${BASE_URL}/api/teachers/${TEACHER_ID}/curriculum/documents`, {
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': SCHOOL_ID
      }
    });

    if (!documentsResponse.ok) {
      throw new Error(`Documents endpoint failed: ${documentsResponse.status}`);
    }

    const documentsData = await documentsResponse.json();
    console.log('✓ Documents fetched successfully');
    console.log('  Total documents:', documentsData.total_documents);
    console.log('  Total shared:', documentsData.total_shared);
    console.log('');

    // Test 2: Create a curriculum folder
    console.log('Test 2: Create curriculum folder...');
    const folderPayload = {
      folder_name: 'Test Curriculum Folder',
      description: 'Test folder for curriculum documents',
      folder_type: 'general'
    };

    const folderResponse = await fetch(`${BASE_URL}/api/teachers/${TEACHER_ID}/curriculum/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': SCHOOL_ID
      },
      body: JSON.stringify(folderPayload)
    });

    if (!folderResponse.ok) {
      const errorData = await folderResponse.json();
      console.log('⚠ Folder creation failed (might be schema not applied yet):', errorData.error);
    } else {
      const folderData = await folderResponse.json();
      console.log('✓ Folder created successfully');
      console.log('  Folder ID:', folderData.folder.id);
      console.log('  Folder name:', folderData.folder.folder_name);
      console.log('');
    }

    // Test 3: Create a curriculum document (without file)
    console.log('Test 3: Create curriculum document...');
    const documentPayload = {
      title: 'Test Syllabus Document',
      description: 'Test syllabus for Physics',
      document_type: 'syllabus',
      grade_level: 'Grade 12',
      section_name: 'Section A',
      status: 'draft'
    };

    const documentResponse = await fetch(`${BASE_URL}/api/teachers/${TEACHER_ID}/curriculum/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': SCHOOL_ID
      },
      body: JSON.stringify(documentPayload)
    });

    if (!documentResponse.ok) {
      const errorData = await documentResponse.json();
      console.log('⚠ Document creation failed (might be schema not applied yet):', errorData.error);
    } else {
      const documentData = await documentResponse.json();
      console.log('✓ Document created successfully');
      console.log('  Document ID:', documentData.document.id);
      console.log('  Document title:', documentData.document.title);
      console.log('  Document type:', documentData.document.document_type);
      console.log('');
    }

    // Test 4: Get lesson plans
    console.log('Test 4: Get lesson plans...');
    const lessonPlansResponse = await fetch(`${BASE_URL}/api/teachers/${TEACHER_ID}/curriculum/lesson-plans`, {
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': SCHOOL_ID
      }
    });

    if (!lessonPlansResponse.ok) {
      throw new Error(`Lesson plans endpoint failed: ${lessonPlansResponse.status}`);
    }

    const lessonPlansData = await lessonPlansResponse.json();
    console.log('✓ Lesson plans fetched successfully');
    console.log('  Total plans:', lessonPlansData.total_plans);
    console.log('');

    // Test 5: Create a lesson plan
    console.log('Test 5: Create lesson plan...');
    const lessonPlanPayload = {
      subject_id: '19734492-1669-4c02-b3b3-db5732c542b7', // Physics subject ID
      grade_level: 'Grade 12',
      section_name: 'Section A',
      title: 'Introduction to Quantum Mechanics',
      description: 'Basic concepts of quantum physics',
      lesson_date: '2026-08-20',
      week_number: 1,
      day_of_week: 'Monday',
      duration_minutes: 45,
      learning_objectives: [
        'Understand basic quantum concepts',
        'Learn about wave-particle duality',
        'Introduction to Schrödinger equation'
      ],
      topics_covered: [
        'Quantum mechanics basics',
        'Wave functions',
        'Probability distributions'
      ],
      teaching_methods: [
        'Lecture',
        'Demonstration',
        'Group discussion'
      ],
      materials_needed: [
        'Projector',
        'Whiteboard',
        'Quantum simulation software'
      ],
      activities: [
        'Interactive demonstration',
        'Problem-solving exercises',
        'Group presentations'
      ],
      assessment_methods: [
        'Class participation',
        'Homework assignment',
        'Quiz'
      ],
      homework_assignment: 'Chapter 1 problems 1-10',
      notes: 'First lesson of the semester',
      status: 'draft'
    };

    const lessonPlanResponse = await fetch(`${BASE_URL}/api/teachers/${TEACHER_ID}/curriculum/lesson-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': SCHOOL_ID
      },
      body: JSON.stringify(lessonPlanPayload)
    });

    if (!lessonPlanResponse.ok) {
      const errorData = await lessonPlanResponse.json();
      console.log('⚠ Lesson plan creation failed (might be schema not applied yet):', errorData.error);
    } else {
      const lessonPlanData = await lessonPlanResponse.json();
      console.log('✓ Lesson plan created successfully');
      console.log('  Lesson plan ID:', lessonPlanData.lesson_plan.id);
      console.log('  Title:', lessonPlanData.lesson_plan.title);
      console.log('  Lesson date:', lessonPlanData.lesson_plan.lesson_date);
      console.log('  Duration:', lessonPlanData.lesson_plan.duration_minutes, 'minutes');
      console.log('');
    }

    // Test 6: Get folders
    console.log('Test 6: Get curriculum folders...');
    const foldersResponse = await fetch(`${BASE_URL}/api/teachers/${TEACHER_ID}/curriculum/folders`, {
      headers: {
        'Content-Type': 'application/json',
        'X-School-ID': SCHOOL_ID
      }
    });

    if (!foldersResponse.ok) {
      const errorData = await foldersResponse.json();
      console.log('⚠ Folders endpoint failed (might be schema not applied yet):', errorData.error);
    } else {
      const foldersData = await foldersResponse.json();
      console.log('✓ Folders fetched successfully');
      console.log('  Total folders:', foldersData.total_folders);
      console.log('');
    }

    console.log('✅ Curriculum and plans backend tests completed!');
    console.log('');
    console.log('NOTE: Some tests may have failed if the database schema has not been applied yet.');
    console.log('Please run the migration: create_curriculum_lesson_plans_schema.sql');
    console.log('And create the Supabase storage bucket: curriculum-documents');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCurriculumBackend();
