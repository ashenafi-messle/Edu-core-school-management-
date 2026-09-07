/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Save, Eye, Edit, CheckCircle, XCircle, 
  FileText, HelpCircle, Type, LayoutTemplate, Upload,
  ChevronDown, ChevronUp, AlertCircle, Clock, Calendar
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useTeacherData } from '../../../context/TeacherDataContext';
import { GenericSkeleton } from './SkeletonLoaders';

interface ExamQuestion {
  id?: string;
  question_number: number;
  question_text: string;
  question_type: 'choice' | 'workout' | 'true_false' | 'fill_blank' | 'essay';
  points: number;
  is_required: boolean;
  explanation?: string;
  choices?: Array<{ id: string; text: string; is_correct?: boolean }>;
  correct_answer?: string | string[];
  answer_places?: Array<{ id: number; type: 'text' | 'number' | 'date'; label: string; placeholder?: string }>;
  expected_answer?: string;
  question_image_url?: string;
  attachments?: Array<{ name: string; type: string; size: number; data_url: string }>;
}

interface ExamFormData {
  title: string;
  exam_code?: string;
  description?: string;
  exam_type: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project' | 'practical' | 'oral';
  exam_category?: string;
  term?: string;
  academic_year_id?: string;
  grade_level: string;
  section_name?: string;
  max_score: number;
  passing_score?: number;
  duration_minutes?: number;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  instructions?: string;
  subject_id?: string;
  question_paper_url?: string;
  grading_scale?: Record<string, number>;
  questions: ExamQuestion[];
}

interface AssignedAllocation {
  grade_level: string;
  section_name: string;
  subject_id: string;
  subject_name: string;
  subject_code?: string;
  academic_year_id: string;
  academic_year?: string;
}

interface ExamManagementProps {
  teacherId?: string;
  schoolId?: string;
  onClose?: () => void;
  onExamCreated?: (exam: any) => void;
}

export const ExamManagement: React.FC<ExamManagementProps> = ({ teacherId, schoolId, onClose, onExamCreated }) => {
  const { data, error: dataError, refreshData } = useTeacherData();
  
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    exam_type: 'quiz',
    exam_category: 'formative',
    term: 'Term 1',
    start_time: '09:00',
    end_time: '10:00',
    question_paper_url: '',
    grading_scale: { A: 90, B: 80, C: 70, D: 60, F: 0 },
    grade_level: '',
    max_score: 100,
    passing_score: 40,
    exam_date: new Date().toISOString().split('T')[0],
    questions: [],
  });

  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [assignedClasses, setAssignedClasses] = useState<AssignedAllocation[]>([]);

  // Load classes data on mount
  useEffect(() => {
    if (teacherId && schoolId && !data.classes) {
      refreshData('classes');
    }
  }, [teacherId, schoolId]);

  // Process classes data when available
  useEffect(() => {
    if (data.classes) {
      const classesData = data.classes as any;
      const classes: AssignedAllocation[] = (classesData.classes_and_divisions || []).flatMap((grade: any) =>
        (grade.sections || []).flatMap((section: any) =>
          (section.subjects || []).map((subject: any) => ({
            grade_level: grade.grade_level,
            section_name: section.section_name,
            subject_id: subject.id,
            subject_name: subject.subject_name,
            subject_code: subject.subject_code,
            academic_year_id: subject.academic_year_id || classesData.academic_year_id,
            academic_year: subject.academic_year,
          }))
        )
      );
      setAssignedClasses(classes);
      if (classes.length > 0) {
        setFormData((current) => ({
            ...current,
            grade_level: current.grade_level || classes[0].grade_level,
            section_name: current.section_name || classes[0].section_name,
            subject_id: current.subject_id || classes[0].subject_id,
            academic_year_id: current.academic_year_id || classes[0].academic_year_id,
          }));
        }
    }
  }, [data.classes]);

  const fetchExams = async (classes = assignedClasses) => {
    try {
      setLoading(true);
      const responses = await Promise.all(classes.map((assignedClass) => api.get('/exams', {
        grade_level: assignedClass.grade_level,
        section_name: assignedClass.section_name,
        teacher_id: teacherId || '',
      })));
      setExams(responses.flatMap((response: any) => response || []));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.classes) {
      fetchExams(assignedClasses);
    }
  }, [data.classes, assignedClasses]);

  const handleCreateExam = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!teacherId || !schoolId) {
        throw new Error('Teacher and school information is not ready. Please reload the page.');
      }
      if (!formData.section_name) {
        throw new Error('Select an assigned division before creating the exam.');
      }
      const allocation = assignedClasses.find((item) =>
        item.grade_level === formData.grade_level &&
        item.section_name === formData.section_name &&
        item.subject_id === formData.subject_id
      );
      if (!allocation) {
        throw new Error('Select a subject assigned to this class and division.');
      }

      // Create exam first
      const examResponse = await api.post('/exams', {
        title: formData.title,
        exam_type: formData.exam_type,
        grade_level: formData.grade_level,
        section_name: formData.section_name,
        subject_id: allocation.subject_id,
        academic_year_id: allocation.academic_year_id,
        max_score: formData.max_score,
        passing_score: formData.passing_score,
        exam_date: formData.exam_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        duration_minutes: formData.duration_minutes,
        venue: formData.venue,
        instructions: formData.instructions,
        teacher_id: teacherId,
        description: formData.description,
        exam_code: formData.exam_code,
        term: formData.term,
        exam_category: formData.exam_category,
        question_paper_url: formData.question_paper_url,
        grading_scale: formData.grading_scale,
      });

      const examId = examResponse.id;

      // Create questions if any
      if (formData.questions.length > 0) {
        const questionsPayload = formData.questions.map((q, index) => ({
          ...q,
          question_number: index + 1,
          exam_id: examId,
        }));

        await api.post(`/exams/${examId}/questions/bulk`, {
          exam_id: examId,
          questions: questionsPayload,
        });
      }

      onExamCreated?.(examResponse);
      setSuccessMessage(`Exam "${formData.title}" was saved successfully.`);
      setActiveTab('list');
      resetForm();
      await fetchExams();
    } catch (err: any) {
      setError(err.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: 'choice' | 'workout' | 'true_false' | 'fill_blank' | 'essay') => {
    const newQuestion: ExamQuestion = {
      question_number: formData.questions.length + 1,
      question_text: '',
      question_type: type,
      points: 1,
      is_required: true,
      choices: type === 'choice' || type === 'true_false' 
        ? type === 'true_false'
          ? [
              { id: 'a', text: 'True', is_correct: false },
              { id: 'b', text: 'False', is_correct: false }
            ]
          : [
              { id: 'a', text: '', is_correct: false },
              { id: 'b', text: '', is_correct: false },
              { id: 'c', text: '', is_correct: false },
              { id: 'd', text: '', is_correct: false }
            ]
        : undefined,
      answer_places: type === 'workout' || type === 'fill_blank'
        ? [
            { id: 1, type: 'text', label: 'Answer 1', placeholder: 'Enter your answer' }
          ]
        : undefined,
    };

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });

    setExpandedQuestions(new Set([...expandedQuestions, formData.questions.length]));
  };

  const updateQuestion = (index: number, updates: Partial<ExamQuestion>) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
    
    // Update question numbers
    const renumberedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      question_number: i + 1,
    }));
    setFormData({ ...formData, questions: renumberedQuestions });
  };

  const addChoice = (questionIndex: number) => {
    const question = formData.questions[questionIndex];
    const newChoiceId = String.fromCharCode(97 + (question.choices?.length || 0));
    updateQuestion(questionIndex, {
      choices: [...(question.choices || []), { id: newChoiceId, text: '', is_correct: false }],
    });
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, text: string) => {
    const question = formData.questions[questionIndex];
    const updatedChoices = [...(question.choices || [])];
    updatedChoices[choiceIndex] = { ...updatedChoices[choiceIndex], text };
    updateQuestion(questionIndex, { choices: updatedChoices });
  };

  const setCorrectChoice = (questionIndex: number, choiceId: string) => {
    const question = formData.questions[questionIndex];
    const updatedChoices = (question.choices || []).map(choice => ({
      ...choice,
      is_correct: choice.id === choiceId,
    }));
    updateQuestion(questionIndex, { 
      choices: updatedChoices,
      correct_answer: [choiceId],
    });
  };

  const addAnswerPlace = (questionIndex: number) => {
    const question = formData.questions[questionIndex];
    const newPlaceId = (question.answer_places?.length || 0) + 1;
    updateQuestion(questionIndex, {
      answer_places: [
        ...(question.answer_places || []),
        { id: newPlaceId, type: 'text', label: `Answer ${newPlaceId}`, placeholder: 'Enter your answer' }
      ],
    });
  };

  const updateAnswerPlace = (questionIndex: number, placeIndex: number, updates: any) => {
    const question = formData.questions[questionIndex];
    const updatedPlaces = [...(question.answer_places || [])];
    updatedPlaces[placeIndex] = { ...updatedPlaces[placeIndex], ...updates };
    updateQuestion(questionIndex, { answer_places: updatedPlaces });
  };

  const uploadQuestionAnswers = (questionIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFiles = Array.from(files);
    if (selectedFiles.some((file) => file.size > 5 * 1024 * 1024)) {
      setError('Each answer file must be smaller than 5 MB.');
      return;
    }

    Promise.all(selectedFiles.map((file) => new Promise<ExamQuestion['attachments'][number]>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data_url: String(reader.result),
      });
      reader.readAsDataURL(file);
    }))).then((newAttachments) => {
      const currentAttachments = formData.questions[questionIndex].attachments || [];
      updateQuestion(questionIndex, { attachments: [...currentAttachments, ...newAttachments] });
    });
  };

  const toggleQuestionExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const resetForm = () => {
    const firstAllocation = assignedClasses[0];
    setFormData({
      title: '',
      exam_type: 'quiz',
      exam_category: 'formative',
      term: 'Term 1',
      start_time: '09:00',
      end_time: '10:00',
      grade_level: '',
      max_score: 100,
      passing_score: 40,
      exam_date: new Date().toISOString().split('T')[0],
      subject_id: firstAllocation?.subject_id,
      academic_year_id: firstAllocation?.academic_year_id,
      question_paper_url: '',
      grading_scale: { A: 90, B: 80, C: 70, D: 60, F: 0 },
      questions: [],
    });
    setExpandedQuestions(new Set());
  };

  const renderQuestionForm = (question: ExamQuestion, index: number) => {
    const isExpanded = expandedQuestions.has(index);

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4"
      >
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
          onClick={() => toggleQuestionExpanded(index)}
        >
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Q{question.question_number}
            </span>
            <span className="font-medium text-gray-700">
              {question.question_type.charAt(0).toUpperCase() + question.question_type.slice(1)} Question
            </span>
            <span className="text-gray-500 text-sm">
              {question.points} point{question.points !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); removeQuestion(index); }}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
            >
              <Trash2 size={18} />
            </button>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 border-t border-gray-100"
            >
              <div className="space-y-4 pt-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your question here..."
                  />
                </div>

                {/* Points */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(index, { points: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={question.is_required}
                      onChange={(e) => updateQuestion(index, { is_required: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`required-${index}`} className="text-sm text-gray-700">
                      Required
                    </label>
                  </div>
                </div>

                {/* Choice Question Options */}
                {(question.question_type === 'choice' || question.question_type === 'true_false') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Choices
                    </label>
                    <div className="space-y-2">
                      {question.choices?.map((choice, choiceIndex) => (
                        <div key={choice.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={choice.is_correct}
                            onChange={() => setCorrectChoice(index, choice.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="font-medium text-gray-600 w-6">{choice.id.toUpperCase()}.</span>
                          <input
                            type="text"
                            value={choice.text}
                            onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Choice text"
                          />
                          {question.question_type === 'choice' && question.choices!.length > 2 && (
                            <button
                              onClick={() => {
                                const updatedChoices = question.choices!.filter((_, i) => i !== choiceIndex);
                                updateQuestion(index, { choices: updatedChoices });
                              }}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {question.question_type === 'choice' && (
                      <button
                        onClick={() => addChoice(index)}
                        className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Plus size={16} />
                        Add Choice
                      </button>
                    )}
                  </div>
                )}

                {/* Workout/Fill-in-blank Answer Places */}
                {(question.question_type === 'workout' || question.question_type === 'fill_blank') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Places
                    </label>
                    <div className="space-y-2">
                      {question.answer_places?.map((place, placeIndex) => (
                        <div key={place.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-600">{place.label}:</span>
                          <select
                            value={place.type}
                            onChange={(e) => updateAnswerPlace(index, placeIndex, { type: e.target.value as any })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                          </select>
                          <input
                            type="text"
                            value={place.placeholder || ''}
                            onChange={(e) => updateAnswerPlace(index, placeIndex, { placeholder: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Placeholder text"
                          />
                          {question.answer_places!.length > 1 && (
                            <button
                              onClick={() => {
                                const updatedPlaces = question.answer_places!.filter((_, i) => i !== placeIndex);
                                updateQuestion(index, { answer_places: updatedPlaces });
                              }}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addAnswerPlace(index)}
                      className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Plus size={16} />
                      Add Answer Place
                    </button>
                  </div>
                )}

                {/* Expected Answer for Workout/Essay */}
                {(question.question_type === 'workout' || question.question_type === 'essay') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Answer (for reference)
                    </label>
                    <textarea
                      value={question.expected_answer || ''}
                      onChange={(e) => updateQuestion(index, { expected_answer: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the expected answer for grading reference..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Answer Key or Worked Solution
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    multiple
                    onChange={(e) => uploadQuestionAnswers(index, e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {question.attachments?.map((attachment) => (
                    <p key={attachment.name} className="mt-1 text-xs text-green-700">
                      Uploaded: {attachment.name}
                    </p>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add an explanation for the correct answer..."
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (activeTab === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exam History</h2>
            <p className="text-sm text-gray-600 mt-1">Created exams for your allocated classes and subjects</p>
          </div>
          <button
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Exam
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {(error || dataError.exams || dataError.classes) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-800">{error || dataError.exams || dataError.classes}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams yet</h3>
            <p className="text-gray-600 mb-4">Create your first exam to get started</p>
            <button
              onClick={() => setActiveTab('create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Exam
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {Array.from(new Map(exams.map((exam) => [exam.id, exam])).values()).map((exam) => {
              const subject = assignedClasses.find((item) =>
                item.subject_id === exam.subject_id &&
                item.grade_level === exam.grade_level &&
                item.section_name === exam.section_name
              );
              return (
              <div key={exam.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {exam.exam_type} • {exam.grade_level} • {exam.section_name || 'All divisions'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {subject?.subject_name || 'Assigned subject'} • {exam.exam_code || 'Code pending'} • {exam.exam_category || 'formative'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {exam.exam_date}
                      </span>
                      {exam.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {exam.duration_minutes} min
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <HelpCircle size={16} />
                        {exam.max_score} points
                      </span>
                      <span>{exam.academic_year_id ? 'Academic year assigned' : 'Academic year pending'}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Created {exam.created_at ? new Date(exam.created_at).toLocaleString() : 'recently'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exam.status === 'published' ? 'bg-green-100 text-green-800' :
                      exam.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Create New Exam</h2>
        <button
          onClick={() => { setActiveTab('list'); resetForm(); }}
          className="text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <span className="text-red-800">{error || dataError.exams || dataError.classes}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter exam title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type *
              </label>
              <select
                value={formData.exam_type}
                onChange={(e) => setFormData({ ...formData, exam_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
                <option value="practical">Practical</option>
                <option value="oral">Oral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level *
              </label>
              <select
                value={formData.grade_level}
                onChange={(e) => {
                  const allocation = assignedClasses.find((item) => item.grade_level === e.target.value);
                  setFormData({
                    ...formData,
                    grade_level: e.target.value,
                    section_name: allocation?.section_name,
                    subject_id: allocation?.subject_id,
                    academic_year_id: allocation?.academic_year_id,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an assigned grade</option>
                {Array.from(new Set(assignedClasses.map((item) => item.grade_level))).map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section (optional)
              </label>
              <select
                value={formData.section_name || ''}
                onChange={(e) => {
                  const allocation = assignedClasses.find((item) =>
                    item.grade_level === formData.grade_level && item.section_name === e.target.value
                  );
                  setFormData({
                    ...formData,
                    section_name: e.target.value,
                    subject_id: allocation?.subject_id,
                    academic_year_id: allocation?.academic_year_id || formData.academic_year_id,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an assigned division</option>
                {assignedClasses.filter((item) => item.grade_level === formData.grade_level).map((item) => (
                  <option key={`${item.grade_level}-${item.section_name}`} value={item.section_name}>{item.section_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Subject *
              </label>
              <select
                value={formData.subject_id || ''}
                onChange={(e) => {
                  const allocation = assignedClasses.find((item) =>
                    item.grade_level === formData.grade_level &&
                    item.section_name === formData.section_name &&
                    item.subject_id === e.target.value
                  );
                  setFormData({
                    ...formData,
                    subject_id: e.target.value,
                    academic_year_id: allocation?.academic_year_id || formData.academic_year_id,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an assigned subject</option>
                {assignedClasses
                  .filter((item) => item.grade_level === formData.grade_level && item.section_name === formData.section_name)
                  .map((item) => (
                    <option key={item.subject_id} value={item.subject_id}>
                      {item.subject_name}{item.subject_code ? ` (${item.subject_code})` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date *
              </label>
              <input
                type="date"
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Score *
              </label>
              <input
                type="number"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score
              </label>
              <input
                type="number"
                value={formData.passing_score || ''}
                onChange={(e) => setFormData({ ...formData, passing_score: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions (optional)
              </label>
              <textarea
                value={formData.instructions || ''}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add instructions for students..."
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{formData.questions.length} questions</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => addQuestion('choice')}
              className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
            >
              <HelpCircle size={16} />
              Choice Question
            </button>
            <button
              onClick={() => addQuestion('workout')}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
            >
              <Type size={16} />
              Workout Question
            </button>
            <button
              onClick={() => addQuestion('true_false')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
            >
              <CheckCircle size={16} />
              True/False
            </button>
            <button
              onClick={() => addQuestion('fill_blank')}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium"
            >
              <LayoutTemplate size={16} />
              Fill in Blank
            </button>
            <button
              onClick={() => addQuestion('essay')}
              className="flex items-center gap-2 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 text-sm font-medium"
            >
              <FileText size={16} />
              Essay
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {formData.questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No questions added yet. Click a button above to add questions.
              </div>
            ) : (
              formData.questions.map((question, index) => renderQuestionForm(question, index))
            )}
          </div>
        </div>

        <div className="p-6 flex justify-end gap-3">
          <button
            onClick={() => { setActiveTab('list'); resetForm(); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateExam}
            disabled={loading || !formData.title || !formData.grade_level || !formData.section_name || assignedClasses.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={20} />
                Create Exam
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
