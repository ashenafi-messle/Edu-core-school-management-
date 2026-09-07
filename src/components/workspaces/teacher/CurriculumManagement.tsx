/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Folder, Plus, Search, Upload, Download, Share2, 
  Trash2, Edit, Eye, Filter, Calendar, BookOpen, 
  ChevronDown, ChevronUp, X, Check, AlertCircle,
  FolderOpen, File, FileText as FileIcon
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useTeacherData } from '../../../context/TeacherDataContext';
import { CurriculumSkeleton } from './SkeletonLoaders';

interface CurriculumDocument {
  id: string;
  title: string;
  description?: string;
  document_type: 'syllabus' | 'teaching_material' | 'assessment' | 'reference';
  status: 'draft' | 'published' | 'archived';
  file_name?: string;
  file_size?: number;
  file_type?: string;
  file_url?: string;
  storage_path?: string;
  created_at: string;
  updated_at: string;
  folder_id?: string;
  subject_id?: string;
  grade_level?: string;
  section_name?: string;
}

interface CurriculumFolder {
  id: string;
  folder_name: string;
  description?: string;
  folder_type: 'general' | 'subject_specific' | 'grade_specific';
  parent_folder_id?: string;
  sort_order: number;
}

interface Subject {
  id: string;
  subject_name: string;
  subject_code: string;
}

export const CurriculumManagement: React.FC<{ teacherId: string }> = ({ teacherId }) => {
  const { data, loading, error: dataError, refreshData } = useTeacherData();
  
  // State management
  const [documents, setDocuments] = useState<CurriculumDocument[]>([]);
  const [folders, setFolders] = useState<CurriculumFolder[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // UI state
  const [view, setView] = useState<'documents' | 'folders'>('documents');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CurriculumDocument | null>(null);
  const [editingFolder, setEditingFolder] = useState<CurriculumFolder | null>(null);
  
  // File upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'teaching_material' as const,
    subject_id: '',
    grade_level: '',
    section_name: '',
    folder_id: '',
    is_public: false,
    file_url: '',
    file_name: '',
    file_size: 0,
    file_type: '',
    storage_path: ''
  });
  
  const [folderFormData, setFolderFormData] = useState({
    folder_name: '',
    description: '',
    folder_type: 'general' as const,
    parent_folder_id: '',
    subject_id: '',
    grade_level: '',
    section_name: ''
  });

  // Load data
  useEffect(() => {
    if (teacherId && !data.curriculum) {
      refreshData('curriculum');
    }
  }, [teacherId]);

  useEffect(() => {
    // Process curriculum data when it loads
    if (data.curriculum) {
      const curriculumData = data.curriculum as any;
      if (Array.isArray(curriculumData)) {
        setDocuments(curriculumData);
      } else if (curriculumData.documents) {
        setDocuments(curriculumData.documents);
      }
      
      // Load folders and subjects using API
      api.getCurriculumFolders(teacherId).then(setFolders).catch(console.error);
      api.getSubjects().then(setSubjects).catch(() => setSubjects([]));
    }
  }, [data.curriculum, teacherId]);

  const loadData = async () => {
    await refreshData('curriculum');
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handlers
  const handleCreateDocument = async () => {
    try {
      let finalFormData = { ...formData };

      // If there's a selected file that hasn't been uploaded yet, upload it first
      if (selectedFile && !formData.file_url) {
        console.log('File selected but not uploaded yet, uploading now...');
        const fileData = await handleFileUpload();
        // Use the returned file data directly instead of relying on state
        finalFormData = {
          ...formData,
          ...fileData
        };
        console.log('Using uploaded file data:', fileData);
      }

      // Ensure file information is included
      const documentData = {
        ...finalFormData,
        teacher_id: teacherId,
        subject_id: finalFormData.subject_id || undefined,
        folder_id: finalFormData.folder_id || undefined,
        // Ensure file fields are properly set - don't use null, use empty strings or actual values
        file_url: finalFormData.file_url || '',
        file_name: finalFormData.file_name || '',
        file_size: finalFormData.file_size || 0,
        file_type: finalFormData.file_type || '',
        storage_path: finalFormData.storage_path || ''
      };

      console.log('Creating curriculum document with data:', documentData);
      console.log('File data:', {
        file_url: documentData.file_url,
        file_name: documentData.file_name,
        file_size: documentData.file_size,
        file_type: documentData.file_type,
        storage_path: documentData.storage_path
      });
      
      await api.createCurriculumDocument(documentData);
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document');
    }
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument) return;
    try {
      // Ensure file information is included
      const documentData = {
        ...formData,
        // Ensure file fields are properly set - don't use null, use empty strings or actual values
        file_url: formData.file_url || '',
        file_name: formData.file_name || '',
        file_size: formData.file_size || 0,
        file_type: formData.file_type || '',
        storage_path: formData.storage_path || ''
      };

      console.log('Updating curriculum document with data:', documentData);
      console.log('File data:', {
        file_url: documentData.file_url,
        file_name: documentData.file_name,
        file_size: documentData.file_size,
        file_type: documentData.file_type,
        storage_path: documentData.storage_path
      });
      
      await api.updateCurriculumDocument(editingDocument.id, documentData);
      setEditingDocument(null);
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteCurriculumDocument(id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const handleCreateFolder = async () => {
    try {
      await api.createCurriculumFolder({
        ...folderFormData,
        teacher_id: teacherId,
        parent_folder_id: folderFormData.parent_folder_id || undefined
      });
      setShowFolderModal(false);
      resetFolderForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this folder?')) return;
    try {
      await api.deleteCurriculumFolder(id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      document_type: 'teaching_material',
      subject_id: '',
      grade_level: '',
      section_name: '',
      folder_id: '',
      is_public: false,
      file_url: '',
      file_name: '',
      file_size: 0,
      file_type: '',
      storage_path: ''
    });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploadingFile(true);
      setUploadProgress(0);
      
      console.log('Starting file upload for:', selectedFile.name);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const uploadResult = await api.uploadCurriculumFile(selectedFile, teacherId);
      
      console.log('Upload result received:', uploadResult);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Always update form data with file information, even if storage upload fails
      const fileData = {
        file_name: uploadResult.file_name || selectedFile.name,
        file_size: uploadResult.file_size || selectedFile.size,
        file_type: uploadResult.file_type || selectedFile.type,
        storage_path: uploadResult.path || '',
        file_url: uploadResult.url || ''
      };

      console.log('File data prepared:', fileData);

      // If storage upload failed, create a temporary local URL for preview
      if (uploadResult.fallback || !uploadResult.url) {
        const localUrl = URL.createObjectURL(selectedFile);
        fileData.file_url = localUrl;
        fileData.storage_path = `local://${selectedFile.name}`;
        console.log('Using local URL:', localUrl);
        setError('Storage is not configured. File attached locally for preview. Configure Supabase Storage for permanent storage.');
      }

      // Update form data with file information - use a promise to ensure state update completes
      await new Promise<void>((resolve) => {
        setFormData(prevFormData => {
          const updated = {
            ...prevFormData,
            ...fileData
          };
          console.log('FormData updated:', updated);
          resolve();
          return updated;
        });
      });
      
      // Return the file data so it can be used
      return fileData;
      
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setUploadProgress(0);
      throw err; // Re-throw so the caller knows it failed
    } finally {
      setUploadingFile(false);
      setSelectedFile(null);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDownload = async (document: CurriculumDocument) => {
    if (document.file_url) {
      // Check if it's a local blob URL (created when storage is not configured)
      if (document.file_url.startsWith('blob:')) {
        // For blob URLs, create a download link
        const link = document.createElement('a');
        link.href = document.file_url;
        link.download = document.file_name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For regular URLs, open in new tab
        window.open(document.file_url, '_blank');
      }
    } else if (document.storage_path) {
      // If there's a storage path but no URL, try to generate a download URL
      try {
        const fileBlob = await api.downloadCurriculumDocument(document.id);
        const downloadUrl = URL.createObjectURL(fileBlob);
        const link = window.document.createElement('a');
        link.href = downloadUrl;
        link.download = document.file_name || 'download';
        link.style.display = 'none';
        window.document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      } catch (err) {
        setError('Failed to generate download URL');
      }
    } else {
      setError('No file available for download');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const resetFolderForm = () => {
    setFolderFormData({
      folder_name: '',
      description: '',
      folder_type: 'general',
      parent_folder_id: '',
      subject_id: '',
      grade_level: '',
      section_name: ''
    });
  };

  const openEditModal = (doc: CurriculumDocument) => {
    setEditingDocument(doc);
    setFormData({
      title: doc.title,
      description: doc.description || '',
      document_type: doc.document_type,
      subject_id: doc.subject_id || '',
      grade_level: doc.grade_level || '',
      section_name: doc.section_name || '',
      folder_id: doc.folder_id || '',
      is_public: false,
      // Preserve file information with proper defaults
      file_url: doc.file_url || '',
      file_name: doc.file_name || '',
      file_size: doc.file_size || 0,
      file_type: doc.file_type || '',
      storage_path: doc.storage_path || ''
    });
    setShowCreateModal(true);
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'syllabus': return <BookOpen className="w-4 h-4" />;
      case 'assessment': return <FileIcon className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading.curriculum || !data.curriculum) {
    return <CurriculumSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Curriculum Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage your teaching materials and educational resources</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Folder className="w-4 h-4" />
            New Folder
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingDocument(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Error Message */}
      {(error || dataError.curriculum) && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error || dataError.curriculum}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="syllabus">Syllabus</option>
          <option value="teaching_material">Teaching Material</option>
          <option value="assessment">Assessment</option>
          <option value="reference">Reference</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Folder Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedFolder(null)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedFolder === null 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          All Documents
        </button>
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedFolder === folder.id 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Folder className="w-4 h-4" />
            {folder.folder_name}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map(doc => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  {getDocumentTypeIcon(doc.document_type)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{doc.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                {(doc.file_url || doc.storage_path) && (
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                )}
                <button
                  onClick={() => openEditModal(doc)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
            
            {doc.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                {doc.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
              <div className="flex flex-col">
                <span className="font-medium">{doc.file_name || 'No file'}</span>
                {doc.file_size && (
                  <span className="text-[10px]">{formatFileSize(doc.file_size)}</span>
                )}
              </div>
              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
            
            {/* File status indicator */}
            {doc.storage_path && (
              <div className="mt-2 text-[10px]">
                {doc.storage_path.startsWith('local://') ? (
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Local Preview (Storage not configured)
                  </span>
                ) : (
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    Stored in Cloud
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No documents found</p>
          <button
            onClick={() => {
              resetForm();
              setEditingDocument(null);
              setShowCreateModal(true);
            }}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Upload your first document
          </button>
        </div>
      )}

      {/* Create/Edit Document Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingDocument ? 'Edit Document' : 'Upload Document'}
                </h3>
                <button onClick={() => setShowCreateModal(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document Type *
                  </label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="teaching_material">Teaching Material</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="assessment">Assessment</option>
                    <option value="reference">Reference</option>
                  </select>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    File Upload
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                          </div>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                        
                        {uploadingFile ? (
                          <div className="space-y-2">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-600">Uploading... {uploadProgress}%</p>
                          </div>
                        ) : (
                          <button
                            onClick={handleFileUpload}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Upload File
                          </button>
                        )}
                        
                        {/* Auto-upload message */}
                        {!uploadingFile && formData.file_url && (
                          <div className="text-xs text-green-600 text-center">
                            ✓ File uploaded successfully
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Drag and drop a file here, or click to select
                        </p>
                        <label
                          htmlFor="file-upload"
                          className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer transition-colors"
                        >
                          Browse Files
                        </label>
                        <p className="text-xs text-slate-500">
                          PDF, Word, PowerPoint, Excel, text, and images (max 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {formData.file_url && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">
                          File uploaded: {formData.file_name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            file_url: '',
                            file_name: '',
                            file_size: 0,
                            file_type: '',
                            storage_path: ''
                          });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.subject_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Folder
                    </label>
                    <select
                      value={formData.folder_id}
                      onChange={(e) => setFormData({ ...formData, folder_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Folder</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>
                          {folder.folder_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Grade Level
                    </label>
                    <input
                      type="text"
                      value={formData.grade_level}
                      onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Grade 10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      value={formData.section_name}
                      onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Section A"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-slate-700 dark:text-slate-300">
                    Make public to all teachers
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Create button clicked, current formData:', formData);
                    console.log('File data in formData:', {
                      file_url: formData.file_url,
                      file_name: formData.file_name,
                      file_size: formData.file_size,
                      file_type: formData.file_type,
                      storage_path: formData.storage_path
                    });
                    if (editingDocument) {
                      handleUpdateDocument();
                    } else {
                      handleCreateDocument();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingDocument ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create New Folder
                </h3>
                <button onClick={() => setShowFolderModal(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    value={folderFormData.folder_name}
                    onChange={(e) => setFolderFormData({ ...folderFormData, folder_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={folderFormData.description}
                    onChange={(e) => setFolderFormData({ ...folderFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Folder Type
                  </label>
                  <select
                    value={folderFormData.folder_type}
                    onChange={(e) => setFolderFormData({ ...folderFormData, folder_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="subject_specific">Subject Specific</option>
                    <option value="grade_specific">Grade Specific</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={folderFormData.subject_id}
                      onChange={(e) => setFolderFormData({ ...folderFormData, subject_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.subject_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Parent Folder
                    </label>
                    <select
                      value={folderFormData.parent_folder_id}
                      onChange={(e) => setFolderFormData({ ...folderFormData, parent_folder_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Parent</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>
                          {folder.folder_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
