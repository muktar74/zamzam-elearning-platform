
import React, { useState, useEffect, useRef } from 'react';
import { Course, Module, QuizQuestion, Toast, CourseCategory } from '../types';
import { generateCourseContent, generateQuiz, generateCourseFromText } from '../services/geminiService';
import { SparklesIcon, PlusIcon, TrashIcon, ArrowUpTrayIcon, VideoCameraIcon, BookOpenIcon as TextbookIcon } from './icons';
import { supabase } from '../services/supabaseClient';
import ConfirmModal from './ConfirmModal';

// This library is loaded from a CDN script in index.html
declare const pdfjsLib: any;

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => Promise<void>;
  course: Course | null;
  addToast: (message: string, type: Toast['type']) => void;
  courseCategories: CourseCategory[];
}

type EditableModule = Module & { file?: File };

const CourseFormModal: React.FC<CourseFormModalProps> = ({ isOpen, onClose, onSave, course, addToast, courseCategories }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(courseCategories.length > 0 ? courseCategories[0].name : '');
  const [passingScore, setPassingScore] = useState(70);
  const [modules, setModules] = useState<EditableModule[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [textbookFile, setTextbookFile] = useState<File | null>(null);
  const [textbookUrl, setTextbookUrl] = useState<string | undefined>();
  const [textbookName, setTextbookName] = useState<string | undefined>();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: () => {}, message: '' });
  
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const pdfGeneratorInputRef = useRef<HTMLInputElement>(null);
  const textbookInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    // Clean up any temporary blob URLs to prevent memory leaks
    modules.forEach(module => {
        if (module.content && module.content.startsWith('blob:')) {
            URL.revokeObjectURL(module.content);
        }
    });
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (course) {
        setTitle(course.title);
        setDescription(course.description);
        setCategory(course.category || (courseCategories.length > 0 ? courseCategories[0].name : ''));
        setPassingScore(course.passingScore || 70);
        setModules(course.modules);
        setQuiz(course.quiz);
        setTextbookUrl(course.textbookUrl);
        setTextbookName(course.textbookName);
      } else {
        // Reset form for new course
        setTitle('');
        setDescription('');
        setCategory(courseCategories.length > 0 ? courseCategories[0].name : '');
        setPassingScore(70);
        setModules([]);
        setQuiz([]);
        setTextbookUrl(undefined);
        setTextbookName(undefined);
      }
      setTextbookFile(null);
      setIsSaving(false);
      setIsGenerating(false);
    }
  }, [isOpen, course, courseCategories]);
  
  const confirmAndRunGenerator = (generatorFn: () => Promise<void>) => {
      const hasContent = description.trim() || modules.length > 0 || quiz.length > 0;
      if (hasContent) {
          setConfirmModal({
              isOpen: true,
              onConfirm: generatorFn,
              message: 'This will replace any existing description, modules, and quiz questions. Are you sure you want to proceed?'
          });
      } else {
          generatorFn();
      }
  };

  const handleGenerateWithAI = async () => {
    if (!title) {
        addToast("Please enter a course title to generate content with AI.", 'error');
        return;
    }
    setIsGenerating(true);
    addToast("Generating AI content... This may take a moment.", 'info');
    try {
        const content = await generateCourseContent(title);
        const allModuleContent = content.modules.map(m => m.content).join('\n\n');
        const quizQuestions = await generateQuiz(allModuleContent);

        setDescription(content.description);
        setModules(content.modules.map((m, i) => ({...m, id: `m-${Date.now()}-${i}`, type: 'text'})));
        setQuiz(quizQuestions);
        addToast("AI content and quiz generated successfully!", 'success');

    } catch (error: any) {
        console.error("Error generating content:", error);
        addToast(error.message || "Failed to generate content. Please try again.", 'error');
    } finally {
        setIsGenerating(false);
    }
  };

  const handleGenerateFromPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        addToast('Invalid file type. Please upload a PDF.', 'error');
        return;
    }

    setIsGenerating(true);
    addToast("Processing PDF and generating course... This may take several moments.", 'info');

    try {
        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => {
            try {
                const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                
                if (typeof pdfjsLib.GlobalWorkerOptions.workerSrc === 'undefined') {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
                }

                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ');
                }

                if (!fullText.trim()) {
                    throw new Error("Could not extract text from the PDF.");
                }

                setTitle(file.name.replace('.pdf', ''));
                const content = await generateCourseFromText(fullText);
                const allModuleContent = content.modules.map(m => m.content).join('\n\n');
                const quizQuestions = await generateQuiz(allModuleContent);

                setDescription(content.description);
                setModules(content.modules.map((m, i) => ({...m, id: `m-${Date.now()}-${i}`, type: 'text'})));
                setQuiz(quizQuestions);
                addToast("Course successfully generated from PDF!", 'success');

            } catch (err: any) {
                 console.error("Error during PDF processing/AI generation:", err);
                 addToast(err.message || "An error occurred. Please try again.", 'error');
            } finally {
                setIsGenerating(false);
                if(pdfGeneratorInputRef.current) pdfGeneratorInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    } catch (error: any) {
        console.error("File Reader Error:", error);
        addToast(error.message || "Could not read the selected file.", 'error');
        setIsGenerating(false);
    }
  }
  
  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
        addToast("Invalid file type. Please upload a video file.", 'error');
        return;
    }
    
    // 50MB limit
    if (file.size > 50 * 1024 * 1024) { 
        addToast("Video file is too large. Please use a file smaller than 50MB.", 'error');
        return;
    }

    const newModules = [...modules];
    const oldModule = newModules[index];

    // If there was a previously staged file, revoke its object URL to prevent memory leaks
    if (oldModule.file && oldModule.content.startsWith('blob:')) {
        URL.revokeObjectURL(oldModule.content);
    }

    const objectUrl = URL.createObjectURL(file);
    newModules[index] = { ...oldModule, content: objectUrl, videoType: 'upload', file: file };
    setModules(newModules);
    
    // Reset file input to allow selecting the same file again
    if (event.target) event.target.value = "";
  };


  const handleModuleChange = (index: number, changes: Partial<EditableModule>) => {
    const newModules = [...modules];
    const oldModule = newModules[index];

    // If type is changing, reset content and videoType
    if (changes.type && oldModule.type !== changes.type) {
        changes.content = '';
        if (oldModule.file && oldModule.content.startsWith('blob:')) {
            URL.revokeObjectURL(oldModule.content);
        }
        changes.file = undefined;

        if (changes.type === 'video') {
            changes.videoType = 'embed';
        } else {
            delete changes.videoType;
        }
    }

    newModules[index] = { ...oldModule, ...changes };
    setModules(newModules);
  };


  const addModule = () => {
    setModules([...modules, { id: `m-new-${Date.now()}`, title: '', content: '', type: 'text' }]);
    setTimeout(() => modalBodyRef.current?.scrollTo({ top: modalBodyRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };
  
  const addVideoModule = () => {
    setModules([...modules, { id: `m-new-${Date.now()}`, title: '', content: '', type: 'video', videoType: 'embed' }]);
    setTimeout(() => modalBodyRef.current?.scrollTo({ top: modalBodyRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  const removeModule = (index: number) => {
    const moduleToRemove = modules[index];

    if (moduleToRemove.file && moduleToRemove.content.startsWith('blob:')) {
        URL.revokeObjectURL(moduleToRemove.content);
    }
    
    addToast("Module removed. Changes will be saved when you submit the form.", "info");

    setModules(modules.filter((_, i) => i !== index));
  };


  const handleQuizChange = (qIndex: number, field: keyof QuizQuestion, value: any, optIndex?: number) => {
    const newQuiz = [...quiz];
    if (field === 'options' && optIndex !== undefined) {
      newQuiz[qIndex].options[optIndex] = value;
    } else {
      // @ts-ignore
      newQuiz[qIndex][field] = value;
    }
    setQuiz(newQuiz);
  };
  
  const addQuizQuestion = () => {
    setQuiz([...quiz, { question: '', options: ['True', 'False'], correctAnswer: '' }]);
     setTimeout(() => modalBodyRef.current?.scrollTo({ top: modalBodyRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  const removeQuizQuestion = (index: number) => {
    setQuiz(quiz.filter((_, i) => i !== index));
  };
  
  const addQuizOption = (qIndex: number) => {
    const newQuiz = [...quiz];
    if (newQuiz[qIndex].options.length >= 6) {
        addToast("A maximum of 6 options are allowed per question.", "info");
        return;
    }
    newQuiz[qIndex].options.push('');
    setQuiz(newQuiz);
  };

  const removeQuizOption = (qIndex: number, optIndex: number) => {
      const newQuiz = [...quiz];
      const question = newQuiz[qIndex];
      
      if (question.options.length <= 2) {
          addToast("A question must have at least 2 options.", "error");
          return;
      }
      
      const removedOption = question.options[optIndex];
      if (question.correctAnswer === removedOption) {
          question.correctAnswer = '';
      }
      
      question.options = question.options.filter((_, i) => i !== optIndex);
      setQuiz(newQuiz);
  };

  const handleTextbookSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        addToast('Invalid file type. Please upload a PDF.', 'error');
        return;
    }
    // 50MB limit
    if (file.size > 50 * 1024 * 1024) { 
        addToast("PDF file is too large. Please use a file smaller than 50MB.", 'error');
        return;
    }
    setTextbookFile(file);
    setTextbookName(file.name);
    setTextbookUrl(URL.createObjectURL(file)); // For preview purposes
  };

  const handleRemoveTextbook = () => {
      setTextbookFile(null);
      setTextbookName(undefined);
      setTextbookUrl(undefined);
      if(textbookInputRef.current) textbookInputRef.current.value = "";
  };
  
  const uploadFile = async (file: File, oldUrl: string | undefined): Promise<{url: string; name: string}> => {
      // 1. Delete the old file if it exists and is a Supabase storage URL
      if (oldUrl && oldUrl.includes(supabase.storage.from('assets').getPublicUrl('').data.publicUrl)) {
          try {
              const pathName = new URL(oldUrl).pathname;
              const bucketName = 'assets';
              const searchString = `/storage/v1/object/public/${bucketName}/`;
              if (pathName.includes(searchString)) {
                  const path = decodeURIComponent(pathName.substring(pathName.indexOf(searchString) + searchString.length));
                  await supabase.storage.from(bucketName).remove([path]);
              }
          } catch(e) {
              console.error("Could not parse or delete old file URL:", oldUrl, e);
          }
      }

      // 2. Upload the new file
      addToast(`Uploading ${file.name}...`, 'info');
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `public/${Date.now()}-${safeFileName}`;
      const { data, error } = await supabase.storage.from('assets').upload(filePath, file);
      if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);
      
      const { data: urlData } = supabase.storage.from('assets').getPublicUrl(data.path);
      return { url: urlData.publicUrl, name: file.name };
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
        addToast("Title and Description are required.", 'error');
        return;
    }
    if (passingScore < 0 || passingScore > 100) {
        addToast("Passing score must be between 0 and 100.", 'error');
        return;
    }
    if (courseCategories.length > 0 && !category) {
        addToast("Please select a category for the course.", "error");
        return;
    }

    setIsSaving(true);
    addToast("Saving course... please wait.", "info");

    try {
        let finalTbookUrl = course?.textbookUrl;
        let finalTbookName = course?.textbookName;

        if (textbookFile) {
            const { url, name } = await uploadFile(textbookFile, course?.textbookUrl);
            finalTbookUrl = url;
            finalTbookName = name;
        } else if (!textbookUrl && course?.textbookUrl) {
            // This case means the user removed the textbook without adding a new one.
            await uploadFile(new File([], ""), course.textbookUrl); // Dummy file to trigger deletion
            finalTbookUrl = undefined;
            finalTbookName = undefined;
        }

        const finalModules: Module[] = await Promise.all(
            modules.map(async (mod): Promise<Module> => {
                const { file, ...baseModule } = mod;

                if (baseModule.type === 'video' && baseModule.videoType === 'upload' && file) {
                    const { url } = await uploadFile(file, mod.id.startsWith('m-new-') ? undefined : course?.modules.find(m => m.id === mod.id)?.content);
                    return { ...baseModule, content: url };
                }
                
                return baseModule;
            })
        );

        const finalCourse: Course = {
            id: course?.id || '',
            title,
            description,
            category,
            passingScore,
            modules: finalModules,
            quiz,
            imageUrl: course?.imageUrl || `https://picsum.photos/seed/${title.replace(/\s/g, '')}/600/400`,
            reviews: course?.reviews || [],
            discussion: course?.discussion || [],
            textbookUrl: finalTbookUrl, 
            textbookName: finalTbookName,
        };
        
        await onSave(finalCourse);
        handleClose();
    } catch (error: any) {
        addToast(error.message || 'An error occurred while saving the course.', 'error');
    } finally {
        setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col h-[90vh]">
          <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">{course ? 'Edit Course' : 'Create New Course'}</h2>
          </div>

          <div ref={modalBodyRef} className="p-6 flex-grow overflow-y-auto">
              <form id="courseForm" onSubmit={handleSubmit}>
                <div className="p-4 bg-slate-50 rounded-lg border mb-6">
                  <h3 className="font-bold text-slate-800 mb-3">AI Content Tools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="courseTitleForAI" className="block text-sm font-medium text-slate-700 mb-1">1. Generate from a title</label>
                          <div className="flex items-center gap-2">
                              <input
                              type="text"
                              id="courseTitleForAI"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full text-base p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                              placeholder="e.g., Introduction to Takaful"
                              />
                              <button
                                  type="button"
                                  onClick={() => confirmAndRunGenerator(handleGenerateWithAI)}
                                  disabled={isGenerating || !title || isSaving}
                                  className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-zamzam-teal-600 rounded-md hover:bg-zamzam-teal-700 transition disabled:bg-slate-400"
                              >
                                  <SparklesIcon className="h-5 w-5 mr-2" />
                                  Generate
                              </button>
                          </div>
                      </div>
                      <div>
                          <label htmlFor="pdfUpload" className="block text-sm font-medium text-slate-700 mb-1">2. Or, generate from a textbook</label>
                          <input type="file" accept=".pdf" ref={pdfGeneratorInputRef} onChange={(e) => confirmAndRunGenerator(() => handleGenerateFromPdf(e))} className="hidden" disabled={isGenerating || isSaving} id="pdfUpload"/>
                          <button
                              type="button"
                              onClick={() => pdfGeneratorInputRef.current?.click()}
                              disabled={isGenerating || isSaving}
                              className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-zamzam-teal-700 bg-zamzam-teal-100 rounded-md hover:bg-zamzam-teal-200 transition disabled:bg-slate-300"
                          >
                              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                              {isGenerating ? 'Processing...' : 'Upload PDF & Generate Course'}
                          </button>
                      </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="mb-4">
                  <label htmlFor="courseTitle" className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                  <input type="text" id="courseTitle" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white" required />
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white" required ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white">
                        {courseCategories.length === 0 && <option disabled>No categories available</option>}
                        {courseCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="passingScore" className="block text-sm font-medium text-slate-700 mb-1">Passing Score (%)</label>
                    <input type="number" id="passingScore" value={passingScore} onChange={e => setPassingScore(parseInt(e.target.value))} min="0" max="100" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white" required />
                  </div>
                </div>

                {/* Textbook Upload */}
                 <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">Course Textbook (Optional)</h3>
                     <div className="p-4 bg-slate-50 rounded-lg border">
                        <input type="file" accept=".pdf" ref={textbookInputRef} onChange={handleTextbookSelect} className="hidden" id="textbookUpload"/>
                        {!textbookName ? (
                             <button
                                type="button"
                                onClick={() => textbookInputRef.current?.click()}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-100 transition"
                            >
                                <TextbookIcon className="h-5 w-5 mr-2" />
                                Upload Textbook PDF
                            </button>
                        ) : (
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                                <div className="flex items-center space-x-3">
                                    <TextbookIcon className="h-5 w-5 text-zamzam-teal-600"/>
                                    <span className="text-sm font-medium text-slate-800">{textbookName}</span>
                                </div>
                                <button type="button" onClick={handleRemoveTextbook} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        )}
                    </div>
                </div>


                {/* Modules */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">Modules</h3>
                    <div className="space-y-4">
                        {modules.map((mod, index) => (
                            <div key={index} className="bg-slate-50 p-4 rounded-lg border">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="font-semibold">Module {index + 1}</label>
                                    <button type="button" onClick={() => removeModule(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                                <input type="text" value={mod.title} onChange={e => handleModuleChange(index, { title: e.target.value })} placeholder="Module Title" className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-md bg-white"/>
                                <select value={mod.type} onChange={e => handleModuleChange(index, { type: e.target.value as 'text' | 'video' })} className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-md bg-white">
                                  <option value="text">Text / HTML</option>
                                  <option value="video">Video</option>
                                </select>
                                
                                {mod.type === 'video' ? (
                                  <div className="mt-2 space-y-3 p-3 bg-slate-100 rounded-md">
                                      <div className="flex items-center space-x-4">
                                          <label className="flex items-center space-x-2 text-sm font-medium">
                                              <input type="radio" name={`videoType-${index}`} value="embed" checked={mod.videoType !== 'upload'} onChange={() => handleModuleChange(index, { videoType: 'embed', content: '' })} className="h-4 w-4 text-zamzam-teal-600 focus:ring-zamzam-teal-500"/>
                                              <span>Embed URL</span>
                                          </label>
                                          <label className="flex items-center space-x-2 text-sm font-medium">
                                              <input type="radio" name={`videoType-${index}`} value="upload" checked={mod.videoType === 'upload'} onChange={() => handleModuleChange(index, { videoType: 'upload', content: '' })} className="h-4 w-4 text-zamzam-teal-600 focus:ring-zamzam-teal-500"/>
                                              <span>Upload File</span>
                                          </label>
                                      </div>
                                      {mod.videoType === 'upload' ? (
                                          <div>
                                              <input type="file" accept="video/*" onChange={(e) => handleVideoSelect(e, index)} disabled={isSaving} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zamzam-teal-50 file:text-zamzam-teal-700 hover:file:bg-zamzam-teal-100"/>
                                              {mod.content && (
                                                  <div className="mt-2">
                                                      <p className="text-xs text-slate-500 mb-1">Current video:</p>
                                                      <video src={mod.content} controls className="w-full max-w-xs rounded shadow"></video>
                                                  </div>
                                              )}
                                          </div>
                                      ) : (
                                          <input type="url" value={mod.content} onChange={e => handleModuleChange(index, { content: e.target.value, videoType: 'embed' })} placeholder="Video Embed URL (e.g., from YouTube, Vimeo)" className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"/>
                                      )}
                                  </div>
                                ) : (
                                  <textarea value={mod.content} onChange={e => handleModuleChange(index, { content: e.target.value })} placeholder="Module Content (Use HTML for formatting)" rows={6} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"/>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-4">
                      <button type="button" onClick={addModule} className="mt-4 flex items-center px-4 py-2 text-sm font-semibold text-zamzam-teal-700 bg-zamzam-teal-100 rounded-md hover:bg-zamzam-teal-200 transition"><PlusIcon className="h-5 w-5 mr-1"/> Add Text Module</button>
                      <button type="button" onClick={addVideoModule} className="mt-4 flex items-center px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition"><VideoCameraIcon className="h-5 w-5 mr-1"/> Add Video Module</button>
                    </div>
                </div>

                {/* Quiz */}
                <div>
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">Quiz Questions</h3>
                    <div className="space-y-4">
                        {quiz.map((q, qIndex) => (
                            <div key={qIndex} className="bg-slate-50 p-4 rounded-lg border">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="font-semibold">Question {qIndex + 1}</label>
                                    <button type="button" onClick={() => removeQuizQuestion(qIndex)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                                <textarea value={q.question} onChange={e => handleQuizChange(qIndex, 'question', e.target.value)} placeholder="Question Text" rows={2} className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-md bg-white"/>
                                <div className="space-y-2">
                                  {q.options.map((opt, optIndex) => (
                                      <div key={optIndex} className="flex items-center space-x-2">
                                          <input 
                                              type="radio" 
                                              name={`correct-${qIndex}`} 
                                              checked={q.correctAnswer === opt && opt.trim() !== ''} 
                                              onChange={() => handleQuizChange(qIndex, 'correctAnswer', opt)} 
                                              className="h-4 w-4 text-zamzam-teal-600 focus:ring-zamzam-teal-500 flex-shrink-0"
                                              disabled={opt.trim() === ''}
                                          />
                                          <input 
                                              type="text" 
                                              value={opt} 
                                              onChange={e => handleQuizChange(qIndex, 'options', e.target.value, optIndex)} 
                                              placeholder={`Option ${optIndex + 1}`} 
                                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                                          />
                                          <button 
                                              type="button" 
                                              onClick={() => removeQuizOption(qIndex, optIndex)} 
                                              disabled={q.options.length <= 2}
                                              className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition disabled:text-slate-300 disabled:hover:bg-transparent"
                                              aria-label="Remove option"
                                          >
                                              <TrashIcon className="h-5 w-5"/>
                                          </button>
                                      </div>
                                  ))}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => addQuizOption(qIndex)} 
                                    className="mt-3 flex items-center px-3 py-1 text-xs font-semibold text-zamzam-teal-700 bg-zamzam-teal-100 rounded-md hover:bg-zamzam-teal-200 transition"
                                >
                                    <PlusIcon className="h-4 w-4 mr-1"/> Add Option
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addQuizQuestion} className="mt-4 flex items-center px-4 py-2 text-sm font-semibold text-zamzam-teal-700 bg-zamzam-teal-100 rounded-md hover:bg-zamzam-teal-200 transition"><PlusIcon className="h-5 w-5 mr-1"/> Add Question</button>
                </div>
              </form>
          </div>

          <div className="p-4 bg-slate-50 border-t flex justify-end items-center space-x-4">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition">
                  Cancel
              </button>
              <button type="submit" form="courseForm" disabled={isSaving || isGenerating} className="px-6 py-2 text-sm font-semibold text-white bg-zamzam-teal-600 rounded-md hover:bg-zamzam-teal-700 transition disabled:bg-slate-400">
                  {isSaving ? 'Saving...' : (course ? 'Save Changes' : 'Create Course')}
              </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, onConfirm: () => {}, message: '' })}
        onConfirm={confirmModal.onConfirm}
        title="Confirm AI Generation"
        message={confirmModal.message}
      />
    </>
  );
};

export default CourseFormModal;
