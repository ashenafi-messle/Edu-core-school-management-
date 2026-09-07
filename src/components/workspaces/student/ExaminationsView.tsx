/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, Award, ShieldAlert, CheckCircle, 
  ChevronRight, ArrowRight, X, AlertTriangle, ChevronLeft, Upload, FileText
} from 'lucide-react';
import { Examination, ExamQuestion } from './StudentMockData';

interface ExaminationsViewProps {
  exams: Examination[];
  onCompleteExam: (examId: string, finalScore: number, grade: string) => void;
}

export const ExaminationsView: React.FC<ExaminationsViewProps> = ({ exams, onCompleteExam }) => {
  const [activeExam, setActiveExam] = useState<Examination | null>(null);
  
  // Interactive Exam Flow States
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [isReviewing, setIsReviewing] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleExitClick = () => {
    if (examFinished) {
      setActiveExam(null);
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setActiveExam(null);
  };

  // Auto-submit simulation on clock zero
  useEffect(() => {
    if (activeExam && !examFinished) {
      setTimeRemaining(activeExam.durationMinutes * 60);
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeExam]);

  const handleStartExam = (exam: Examination) => {
    setActiveExam(exam);
    setCurrentQIndex(0);
    setAnswers({});
    setIsReviewing(false);
    setExamFinished(false);
  };

  const handleAnswerInput = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextQuestion = () => {
    if (activeExam && currentQIndex < activeExam.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setIsReviewing(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  // Automated/manual grading simulation
  const calculateScoreAndGrade = () => {
    if (!activeExam) return { score: 0, grade: 'F' };
    
    // Simple mock grade calculation based on questions answered
    let correctCount = 0;
    activeExam.questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (q.type === 'MultipleChoice' || q.type === 'TrueFalse') {
        if (studentAns === q.correctAnswer) correctCount++;
      } else if (q.type === 'ShortAnswer') {
        if (studentAns?.trim().toLowerCase() === q.correctAnswer?.toLowerCase()) correctCount++;
      } else {
        // Essay/Matching/Upload always marked correct/completed in simulation
        if (studentAns) correctCount++;
      }
    });

    const finalScore = Math.min(activeExam.totalMarks, Math.round((correctCount / activeExam.questions.length) * activeExam.totalMarks));
    let grade = 'B';
    if (finalScore >= 55) grade = 'A+';
    else if (finalScore >= 48) grade = 'A';
    else if (finalScore >= 40) grade = 'B+';
    else if (finalScore >= 30) grade = 'C';

    return { score: finalScore, grade };
  };

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const { score, grade } = calculateScoreAndGrade();
    onCompleteExam(activeExam!.id, score, grade);
    setExamFinished(true);
  };

  const handleSubmitFinal = () => {
    handleAutoSubmit();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const answeredQuestionsCount = activeExam ? activeExam.questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length : 0;

  return (
    <div className="space-y-6 text-left">
      
      {!activeExam ? (
        
        // 1. Dashboard View of Exam categories
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Categorized blocks */}
            {['Ongoing', 'Upcoming', 'Completed'].map((cat) => {
              const matches = exams.filter(e => e.status === cat);
              return (
                <div key={cat} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">{cat} Examinations</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/40 font-bold">{matches.length}</span>
                  </div>

                  <div className="space-y-3">
                    {matches.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-4">No exams registered under {cat.toLowerCase()}.</p>
                    ) : (
                      matches.map((exam) => (
                        <div key={exam.id} className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-250/50 dark:border-slate-850 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold bg-brand-blue/10 text-brand-blue px-1.5 py-0.2 rounded uppercase">{exam.subject}</span>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{exam.title}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">Date: {new Date(exam.date).toLocaleString()} • Dur: {exam.durationMinutes}m</p>
                          </div>

                          {cat === 'Ongoing' && (
                            <button
                              onClick={() => handleStartExam(exam)}
                              className="w-full h-8 rounded-lg bg-brand-blue hover:bg-brand-indigo text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            >
                              <span>Launch Exam Desk</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {cat === 'Completed' && (
                            <div className="flex justify-between items-center text-[10px] border-t pt-2 border-dashed">
                              <span className="text-emerald-500 font-bold font-mono">Grade: {exam.grade || 'A'} ({exam.score}/{exam.totalMarks})</span>
                              <span className="text-slate-400 font-mono">Completed</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      ) : (

        // 2. Active Immersive Examination environment
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
          
          {/* Main Question Arena */}
          <div className="flex-1 flex flex-col max-h-screen overflow-y-auto">
            
            {/* Top Examination Status Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExitClick}
                  className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                  title="Exit Examination"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="space-y-0.5 text-left">
                  <span className="text-[9.5px] font-mono text-brand-blue uppercase font-bold">EDUCATIONAL PROTOCOL • EXAM SCREEN</span>
                  <h2 className="text-xs font-black text-slate-900 dark:text-white truncate">{activeExam.title}</h2>
                </div>
              </div>

              {/* Progress and Timer */}
              <div className="flex items-center gap-6">
                <div className="text-right font-mono">
                  <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Time Remaining</span>
                  <span className={`text-sm font-black flex items-center gap-1.5 ${timeRemaining < 180 ? 'text-rose-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                    <Clock className="w-4 h-4 text-brand-indigo" />
                    <span>{formatTimer(timeRemaining)}</span>
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Progress</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {answeredQuestionsCount} / {activeExam.questions.length} answered
                  </span>
                </div>
              </div>
            </div>

            {/* Questions area / Review Screen */}
            <div className="p-6 md:p-10 max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center">
              
              <AnimatePresence mode="wait">
                {examFinished ? (
                  
                  // Finished confirmation screen
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
                  >
                    <Award className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Assessment Successfully Lodged</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Your examination answer papers have been encrypted and submitted onto the central gradebook ledger. Results and feedbacks are updated immediately below.
                    </p>
                    <button
                      onClick={() => setActiveExam(null)}
                      className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Exit Examination Desk
                    </button>
                  </motion.div>

                ) : isReviewing ? (
                  
                  // Review prior to submission
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white font-mono uppercase tracking-wider">Review Exam Answers</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Review all questions and matching pairs prior to grading synchronization.</p>
                    </div>

                    <div className="space-y-4 divide-y">
                      {activeExam.questions.map((q, idx) => {
                        const answer = answers[q.id];
                        return (
                          <div key={q.id} className="pt-3 first:pt-0 space-y-1.5">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{idx + 1}. {q.question}</p>
                            <p className="text-[11px] font-mono text-brand-blue">
                              Answer: <span className="text-slate-600 dark:text-slate-400">{answer !== undefined ? String(answer) : <span className="text-rose-500 italic">No Answer Registered</span>}</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t flex justify-between">
                      <button
                        onClick={() => setIsReviewing(false)}
                        className="h-9 px-4 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer"
                      >
                        Back to Questions
                      </button>
                      <button
                        onClick={handleSubmitFinal}
                        className="h-9 px-5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Examination</span>
                      </button>
                    </div>
                  </motion.div>

                ) : (

                  // Question Rendering templates based on question types
                  <motion.div 
                    key={currentQIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                  >
                    {/* Progress indicators */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase">Question {currentQIndex + 1} of {activeExam.questions.length}</span>
                      <span className="text-[9.5px] font-mono bg-indigo-500/10 text-brand-indigo font-bold px-2 py-0.5 rounded-full">{activeExam.questions[currentQIndex].type}</span>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-normal">
                        {activeExam.questions[currentQIndex].question}
                      </p>

                      {/* MULTIPLE CHOICE / TRUE-FALSE */}
                      {(activeExam.questions[currentQIndex].type === 'MultipleChoice' || activeExam.questions[currentQIndex].type === 'TrueFalse') && (
                        <div className="space-y-2.5">
                          {activeExam.questions[currentQIndex].options?.map((opt, oIdx) => {
                            const isSelected = answers[activeExam.questions[currentQIndex].id] === opt;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleAnswerInput(activeExam.questions[currentQIndex].id, opt)}
                                className={`w-full h-11 px-4 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                                  isSelected ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-slate-200 hover:border-slate-350 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <CheckCircle className="w-4 h-4 text-brand-blue" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* SHORT ANSWER */}
                      {activeExam.questions[currentQIndex].type === 'ShortAnswer' && (
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Type your brief answer here..."
                            value={answers[activeExam.questions[currentQIndex].id] || ''}
                            onChange={(e) => handleAnswerInput(activeExam.questions[currentQIndex].id, e.target.value)}
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none"
                          />
                        </div>
                      )}

                      {/* ESSAY */}
                      {activeExam.questions[currentQIndex].type === 'Essay' && (
                        <div className="space-y-1">
                          <textarea
                            rows={6}
                            placeholder="Type your comprehensive essay argument here (supports detailed reactions and synthesis descriptions)..."
                            value={answers[activeExam.questions[currentQIndex].id] || ''}
                            onChange={(e) => handleAnswerInput(activeExam.questions[currentQIndex].id, e.target.value)}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none leading-relaxed"
                          />
                        </div>
                      )}

                      {/* MATCHING */}
                      {activeExam.questions[currentQIndex].type === 'Matching' && (
                        <div className="space-y-3">
                          <p className="text-[10.5px] text-slate-400 font-mono">Map key items to corresponding chemical/scientific functions:</p>
                          <div className="space-y-2">
                            {activeExam.questions[currentQIndex].matchingPairs?.map((pair, pIdx) => (
                              <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">{pair.key}</span>
                                <select
                                  onChange={(e) => handleAnswerInput(activeExam.questions[currentQIndex].id, `${pair.key} maps to ${e.target.value}`)}
                                  className="h-9 px-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 text-[10.5px] focus:outline-none"
                                >
                                  <option value="">-- Choose Function --</option>
                                  {activeExam.questions[currentQIndex].matchingPairs?.map((option, oIdx) => (
                                    <option key={oIdx} value={option.val}>{option.val}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FILL IN THE BLANK */}
                      {activeExam.questions[currentQIndex].type === 'FillBlank' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-slate-400">[BLANK] = </span>
                            <input
                              type="text"
                              placeholder="Fill in the missing conceptual parameter..."
                              value={answers[activeExam.questions[currentQIndex].id] || ''}
                              onChange={(e) => handleAnswerInput(activeExam.questions[currentQIndex].id, e.target.value)}
                              className="h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 text-xs focus:outline-none flex-1"
                            />
                          </div>
                        </div>
                      )}

                      {/* FILE & IMAGE UPLOAD */}
                      {(activeExam.questions[currentQIndex].type === 'FileUpload' || activeExam.questions[currentQIndex].type === 'ImageUpload') && (
                        <div className="space-y-2 border border-dashed p-6 rounded-2xl text-center bg-slate-50 dark:bg-slate-950/20">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto animate-bounce" />
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Upload Scientific Formula / Image</h4>
                          <p className="text-[10px] text-slate-400">Supported format details: PDF, PNG, JPEG up to 50MB</p>
                          <input
                            type="file"
                            onChange={() => handleAnswerInput(activeExam.questions[currentQIndex].id, 'Formula_Snapshot.png')}
                            className="hidden"
                            id="exam-file-up"
                          />
                          <label
                            htmlFor="exam-file-up"
                            className="mt-3 inline-flex h-8 px-4 rounded-lg bg-white border text-[11px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer items-center justify-center"
                          >
                            Select File
                          </label>
                          {answers[activeExam.questions[currentQIndex].id] && (
                            <span className="block text-[10px] font-mono text-emerald-500 font-bold mt-2">✓ Loaded: {answers[activeExam.questions[currentQIndex].id]}</span>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Navigation Buttons */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrevQuestion}
                        disabled={currentQIndex === 0}
                        className="h-9 px-4 rounded-xl border hover:bg-slate-50 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="h-9 px-5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
                      >
                        <span>{currentQIndex === activeExam.questions.length - 1 ? 'Go to Review' : 'Next Question'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Sidebar Question Navigator */}
          {!examFinished && (
            <div className="w-full md:w-64 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between max-h-screen">
              <div className="space-y-4 text-left">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono">Question Map</h3>
                  <p className="text-[10px] text-slate-500">Jump directly to specific questions</p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {activeExam.questions.map((q, idx) => {
                    const answered = answers[q.id] !== undefined && answers[q.id] !== '';
                    const isCurrent = idx === currentQIndex;
                    let btnColor = 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border';
                    if (answered) btnColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold';
                    if (isCurrent) btnColor = 'bg-brand-blue text-white border-brand-blue font-bold';

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setIsReviewing(false);
                          setCurrentQIndex(idx);
                        }}
                        className={`h-9 rounded-lg text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${btnColor}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  onClick={() => setIsReviewing(true)}
                  className="w-full h-9 rounded-xl bg-slate-50 border hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Review Answers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Exit Confirmation Modal */}
          <AnimatePresence>
            {showExitConfirm && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-2xl space-y-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Exit Examination?</h3>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Your current progress will not be submitted or saved. Are you sure you want to return to the dashboard?
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(false)}
                      className="h-8 px-3 rounded-lg border text-[11px] font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Keep Answering
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmExit}
                      className="h-8 px-3.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Exit & Lose Progress
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
};
