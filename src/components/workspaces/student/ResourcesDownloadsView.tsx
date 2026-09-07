/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Download, Search, Filter, BookOpen, Video, FileText, 
  Award, Play, CheckCircle2, ChevronRight, HardDrive, RefreshCw
} from 'lucide-react';
import { Resource } from './StudentMockData';
import { api } from '../../../lib/api';

interface ResourcesDownloadsViewProps {
  resources: Resource[];
  curriculumDocuments?: any[];
  loadingCurriculum?: boolean;
}

export const ResourcesDownloadsView: React.FC<ResourcesDownloadsViewProps> = ({ 
  resources, 
  curriculumDocuments = [], 
  loadingCurriculum = false 
}) => {
  // Resources States
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('All');

  // Simulator State
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);

  const simulateDownload = (name: string, format: string) => {
    setDownloadingItem(name);
    setDownloadProgress(10);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadProgress(null);
            setDownloadingItem(null);
            alert(`SUCCESS: "${name}.${format.toLowerCase()}" successfully saved to downloads folder!`);
          }, 600);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleCurriculumDownload = async (documentId: string, fileName: string) => {
    try {
      setDownloadingItem(fileName);
      setDownloadProgress(10);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev === null) return null;
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 20;
        });
      }, 200);

      const fileBlob = await api.downloadCurriculumDocument(documentId);
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      const downloadUrl = URL.createObjectURL(fileBlob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = 'none';
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      
      setTimeout(() => {
        setDownloadProgress(null);
        setDownloadingItem(null);
      }, 1000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadProgress(null);
      setDownloadingItem(null);
      alert('Failed to download document. Please try again.');
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            res.teacher.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = subjectFilter === 'All' || res.subject === subjectFilter;
      const matchesType = resourceTypeFilter === 'All' || res.type === resourceTypeFilter;
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [resources, searchQuery, subjectFilter, resourceTypeFilter]);

  const filteredCurriculumDocuments = useMemo(() => {
    return curriculumDocuments.filter(doc => {
      const title = String(doc.title || '');
      const description = String(doc.description || '');
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = subjectFilter === 'All' || (doc.subject?.subject_name === subjectFilter);
      const documentType = String(doc.document_type || '').toLowerCase();
      const matchesType = resourceTypeFilter === 'All' || documentType === resourceTypeFilter.toLowerCase() ||
                          (resourceTypeFilter === 'Document' && ['teaching_material', 'lesson_plan', 'reference'].includes(documentType));
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [curriculumDocuments, searchQuery, subjectFilter, resourceTypeFilter]);

  const uniqueSubjects = useMemo(() => {
    const resourceSubjects = resources.map(r => r.subject);
    const curriculumSubjects = curriculumDocuments.map(d => d.subject?.subject_name).filter(Boolean);
    const allSubjects = [...new Set([...resourceSubjects, ...curriculumSubjects])];
    return ['All', ...allSubjects];
  }, [resources, curriculumDocuments]);

  const resourceTypes = ['All', 'PDF', 'Book', 'Slide', 'Video', 'Practice', 'Document'];

  return (
    <div className="space-y-6 text-left">
      
      {/* 2. Content Sections */}
      <div className="space-y-6">
          
          {/* Filtering bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={subjectFilter} 
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="text-xs font-mono font-bold focus:outline-none bg-transparent"
                >
                  {uniqueSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
                <select 
                  value={resourceTypeFilter} 
                  onChange={(e) => setResourceTypeFilter(e.target.value)}
                  className="text-xs font-mono font-bold focus:outline-none bg-transparent"
                >
                  {resourceTypes.map(t => <option key={t} value={t}>{t} Formats</option>)}
                </select>
              </div>

            </div>

            {/* Search bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources or instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCurriculumDocuments.map((doc) => {
              const isDownloading = downloadingItem === doc.file_name && downloadProgress !== null;
              return (
                <div key={doc.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-blue/25 hover:scale-[1.01] transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">{doc.subject?.subject_name || 'General'}</span>
                      <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase">{String(doc.document_type || 'document').replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-start gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 flex items-center justify-center text-brand-indigo flex-shrink-0 mt-0.5"><FileText className="w-5 h-5" /></div>
                      <div>
                        <h4 className="text-xs font-black text-slate-850 dark:text-white leading-snug line-clamp-2">{doc.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">By {doc.teacher?.full_name || 'Teacher'} • {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recently added'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {doc.file_name || 'No file'}
                    </span>
                    
                    {doc.file_url ? (
                      <button
                        onClick={() => handleCurriculumDownload(doc.id, doc.file_name || doc.title)}
                        disabled={isDownloading}
                        className="h-8 px-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-blue" />
                            <span>{downloadProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">No file attached</span>
                    )}
                  </div>
                </div>
              );
            })}

            {loadingCurriculum && (
              <div className="col-span-full flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-blue" />
                <span className="ml-3 text-sm text-slate-600">Loading curriculum documents...</span>
              </div>
            )}

            {!loadingCurriculum && filteredResources.length === 0 && filteredCurriculumDocuments.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No resources found</p>
              </div>
            )}
          </div>
        </div>

    </div>
  );
};
