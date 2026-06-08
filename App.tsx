
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HEADSHOT_STYLES, BACKGROUNDS } from './constants';
import { GeneratedImage, HeadshotStyle, FaceDetectionResult, BackgroundOption } from './types';
import { generateProfessionalHeadshot, editImageWithPrompt } from './services/geminiService';
import { detectFaces, loadFaceModels } from './services/faceDetectionService';
import Button from './components/Button';
import { User, Users, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LIGHTING_PRESETS = [
  { label: '☀️ Brighten', prompt: 'Increase the overall exposure and brighten the lighting for a clean, high-key look.' },
  { label: '🌅 Golden Hour', prompt: 'Add warm, golden-hour sunlight coming from the side for a flattering, natural glow.' },
  { label: '📸 Studio Pro', prompt: 'Apply professional 3-point studio lighting with soft shadows and high clarity.' },
  { label: '🌘 Dramatic', prompt: 'Apply dramatic low-key lighting with high contrast and one-sided shadows.' },
];

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption | null>(BACKGROUNDS[0]);
  const [croppedFaceUrl, setCroppedFaceUrl] = useState<string | null>(null);
  const [backgroundFilter, setBackgroundFilter] = useState<'all' | 'solid' | 'scenic' | 'textured' | 'creative'>('all');
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Face detection state
  const [detectedFaces, setDetectedFaces] = useState<FaceDetectionResult[]>([]);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
  const [isDetectingFaces, setIsDetectingFaces] = useState(false);
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSourceImage(dataUrl);
        setSelectedStyle(null);
        setError(null);
        processImageForFaces(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageForFaces = useCallback(async (imageUrl: string) => {
    setIsDetectingFaces(true);
    setDetectedFaces([]);
    setSelectedFaceIndex(null);
    
    try {
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for face detection'));
      });
      
      const faces = await detectFaces(img, 8000); // 8 second timeout
      setDetectedFaces(faces);
      
      if (faces.length === 1) {
        setSelectedFaceIndex(0);
      } else if (faces.length > 1) {
        // Sort by size to pick the largest as default
        const sorted = [...faces].sort((a, b) => (b.box.width * b.box.height) - (a.box.width * a.box.height));
        const primaryIndex = faces.indexOf(sorted[0]);
        setSelectedFaceIndex(primaryIndex);
      }
    } catch (err) {
      console.warn('Face detection skipped or timed out:', err);
      // We don't block the user if detection fails or times out
      setDetectedFaces([]);
      setSelectedFaceIndex(null);
    } finally {
      setIsDetectingFaces(false);
    }
  }, []);

  const cropImageToFace = async (imageUrl: string, face: FaceDetectionResult): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Add some padding around the face (e.g., 50% of face size)
        const padding = face.box.width * 0.5;
        const x = Math.max(0, face.box.x - padding);
        const y = Math.max(0, face.box.y - padding);
        const width = Math.min(img.width - x, face.box.width + padding * 2);
        const height = Math.min(img.height - y, face.box.height + padding * 2);

        // Make it square
        const size = Math.max(width, height);
        canvas.width = size;
        canvas.height = size;

        // Fill background with white (in case of transparent images or edges)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);

        // Center the crop
        const offsetX = (size - width) / 2;
        const offsetY = (size - height) / 2;

        ctx.drawImage(img, x, y, width, height, offsetX, offsetY, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror the image for selfie mode
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setSourceImage(dataUrl);
        stopCamera();
        setSelectedStyle(null);
        processImageForFaces(dataUrl);
      }
    }
  };

  // Load models on mount
  useEffect(() => {
    loadFaceModels().catch(console.error);
  }, []);

  // Update cropped face preview URL for Composition Preview
  useEffect(() => {
    if (sourceImage && selectedFaceIndex !== null && detectedFaces[selectedFaceIndex]) {
      cropImageToFace(sourceImage, detectedFaces[selectedFaceIndex])
        .then(url => setCroppedFaceUrl(url))
        .catch(err => {
          console.error('Error generating cropped face:', err);
          setCroppedFaceUrl(null);
        });
    } else {
      setCroppedFaceUrl(null);
    }
  }, [sourceImage, selectedFaceIndex, detectedFaces]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage || !selectedStyle) return;

    setIsGenerating(true);
    setError(null);
    try {
      let imageToProcess = sourceImage;
      
      // If a face is selected and detection is finished, crop to it
      if (!isDetectingFaces && selectedFaceIndex !== null && detectedFaces[selectedFaceIndex]) {
        try {
          imageToProcess = await cropImageToFace(sourceImage, detectedFaces[selectedFaceIndex]);
        } catch (cropErr) {
          console.warn('Cropping failed, using original image:', cropErr);
        }
      }

      let promptToSend = selectedStyle.prompt;
      let displayPromptUsed = selectedStyle.name;
      if (selectedBackground) {
        promptToSend = `${selectedStyle.prompt}\n\nSTRICT BACKGROUND CUSTOMIZATION OVERRIDE: Please customize the background elements of this headshot to be: ${selectedBackground.promptSnippet}`;
        displayPromptUsed = `${selectedStyle.name} (${selectedBackground.name})`;
      }

      const resultUrl = await generateProfessionalHeadshot(imageToProcess, promptToSend);
      const newResult: GeneratedImage = {
        id: Date.now().toString(),
        url: resultUrl,
        timestamp: Date.now(),
        promptUsed: displayPromptUsed,
        type: 'headshot',
      };
      setResults(prev => [newResult, ...prev]);
    } catch (err) {
      console.error(err);
      setError('Failed to generate headshot. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async (targetImageUrl: string, customPrompt?: string) => {
    const finalPrompt = customPrompt || editPrompt.trim();
    if (!finalPrompt) return;

    setIsGenerating(true);
    setError(null);
    try {
      const resultUrl = await editImageWithPrompt(targetImageUrl, finalPrompt);
      const newResult: GeneratedImage = {
        id: Date.now().toString(),
        url: resultUrl,
        timestamp: Date.now(),
        promptUsed: customPrompt ? `Lighting: ${customPrompt.split('.')[0]}` : finalPrompt,
        type: 'edit',
      };
      setResults(prev => [newResult, ...prev]);
      if (!customPrompt) setEditPrompt('');
    } catch (err) {
      console.error(err);
      setError('Failed to edit image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setSourceImage(null);
    setSelectedStyle(null);
    setSelectedBackground(BACKGROUNDS[0]);
    setResults([]);
    setError(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ProShot AI</h1>
          </div>
          <Button variant="outline" size="sm" onClick={resetAll}>New Session</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Options */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4">1. Get your photo</h2>
            
            {isCameraActive ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={capturePhoto}>
                    Capture
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : !sourceImage ? (
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Upload photo</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 font-semibold tracking-wider">or</span>
                  </div>
                </div>

                <Button variant="secondary" className="w-full" onClick={startCamera}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Photo Now
                </Button>
                
                <p className="text-xs text-slate-400 mt-1 text-center">A clear, well-lit portrait works best.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden group bg-slate-100 flex items-center justify-center min-h-[200px]">
                  <div className="relative inline-block">
                    <img 
                      src={sourceImage} 
                      alt="Source" 
                      className="block w-full h-auto max-h-[500px] object-contain" 
                      id="source-image-preview" 
                    />
                    
                    {/* Face Bounding Boxes Overlay */}
                    {!isDetectingFaces && detectedFaces.map((face, index) => {
                      const imgElement = document.getElementById('source-image-preview') as HTMLImageElement;
                      if (!imgElement) return null;
                      
                      const rect = imgElement.getBoundingClientRect();
                      const scaleX = rect.width / imgElement.naturalWidth;
                      const scaleY = rect.height / imgElement.naturalHeight;
                      
                      return (
                        <div 
                          key={index}
                          onClick={() => setSelectedFaceIndex(index)}
                          className={cn(
                            "absolute border-2 cursor-pointer transition-all duration-200 z-10",
                            selectedFaceIndex === index 
                              ? "border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/20" 
                              : "border-white/50 bg-white/5 hover:border-white hover:bg-white/10"
                          )}
                          style={{
                            left: `${face.box.x * scaleX}px`,
                            top: `${face.box.y * scaleY}px`,
                            width: `${face.box.width * scaleX}px`,
                            height: `${face.box.height * scaleY}px`,
                          }}
                        >
                          {selectedFaceIndex === index && (
                            <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center whitespace-nowrap shadow-sm">
                              <Check className="w-3 h-3 mr-1" /> Primary Subject
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isDetectingFaces && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                      <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                      <p className="text-xs font-medium">Detecting faces...</p>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setSourceImage(null);
                      setDetectedFaces([]);
                      setSelectedFaceIndex(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Face Selection Prompt */}
                {!isDetectingFaces && detectedFaces.length > 1 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-3">
                    <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900">Multiple faces detected</p>
                      <p className="text-[11px] text-amber-700">Click a box on the image to select the main subject for your headshot.</p>
                    </div>
                  </div>
                )}

                {!isDetectingFaces && detectedFaces.length === 0 && sourceImage && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600">No faces detected</p>
                      <p className="text-[11px] text-slate-500">The AI might struggle if it can't find a face. Try a clearer photo for better results.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {sourceImage && !isCameraActive && (
            <>
              {/* Style Selection */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-1">2. Pick a Vestimentary Style</h2>
                <p className="text-xs text-slate-500 mb-4">Select the overall outfit, apparel, lighting mood, and physical demeanor.</p>
                <div className="grid grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1">
                  {HEADSHOT_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all duration-200 ${
                        selectedStyle?.id === style.id ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md' : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <img src={style.previewUrl} alt={style.name} className="w-full h-16 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-1.5 pt-3">
                        <p className="text-[10px] text-white font-semibold uppercase tracking-wider leading-none text-center">{style.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Background Selection Section */}
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold">3. Choose Background</h2>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">New Feature</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 font-medium">Allows you to preview and fully customize the scenery backdrop before producing.</p>
                
                {/* Background Categories Tabs */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(['all', 'solid', 'scenic', 'textured', 'creative'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBackgroundFilter(cat)}
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border transition-all uppercase tracking-wider ${
                        backgroundFilter === cat 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Background Selection Grid */}
                <div className="grid grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1">
                  {BACKGROUNDS.filter(b => backgroundFilter === 'all' || b.category === backgroundFilter).map(bg => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSelectedBackground(bg)}
                      className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all duration-200 ${
                        selectedBackground?.id === bg.id ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md' : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <img src={bg.previewUrl} alt={bg.name} className="w-full h-16 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-1.5 pt-3">
                        <p className="text-[10px] text-white font-semibold uppercase tracking-wider leading-none text-center">{bg.name}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Live Real-Time Composition Preview */}
                {selectedBackground && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1 text-indigo-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Real-Time Composition Preview
                    </h3>
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-slate-300 bg-slate-900 flex items-center justify-center">
                      <img 
                        src={selectedBackground.previewUrl} 
                        alt="Background Composition Preview" 
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.8]"
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-sm text-[8px] text-slate-200 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {selectedBackground.name} Backdrop
                      </span>

                      {/* Overlaid Primary Subject Crop badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {croppedFaceUrl ? (
                          <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-indigo-500/20 blur animate-pulse" />
                            <img 
                              src={croppedFaceUrl} 
                              alt="Cropped Face Badge" 
                              className="relative w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover"
                            />
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-[6px] text-white font-extrabold px-1 py-0.5 rounded shadow-sm whitespace-nowrap">
                              SUBJECT CO-PILOT
                            </div>
                          </div>
                        ) : sourceImage ? (
                          <div className="relative flex flex-col items-center">
                            <img 
                              src={sourceImage} 
                              alt="Whole Subject" 
                              className="w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover"
                            />
                            <span className="mt-1 bg-amber-600 text-[6px] text-white font-extrabold px-1 py-0.5 rounded shadow-sm">
                              WHOLE PORTRAIT
                            </span>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center bg-black/40 text-slate-300">
                            <User className="w-6 h-6 animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedStyle && (
                      <div className="mt-2 text-[10px] text-slate-600 space-y-0.5 font-medium">
                        <p>👔 <strong className="text-slate-800">Style Theme:</strong> {selectedStyle.name}</p>
                        <p>🎨 <strong className="text-slate-800">Custom Backing:</strong> {selectedBackground.description}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  className="w-full mt-5 py-2.5 font-semibold text-xs uppercase tracking-wider" 
                  onClick={handleGenerate} 
                  disabled={!selectedStyle || !selectedBackground} 
                  isLoading={isGenerating}
                >
                  Generate Headshot
                </Button>
              </section>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Results & AI Editor */}
        <div className="lg:col-span-8 space-y-6">
          {!results.length && !isGenerating ? (
            <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-white/50 text-slate-400">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">Your generated headshots will appear here</p>
            </div>
          ) : (
            <div className="space-y-8">
              {isGenerating && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center animate-pulse">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-600 font-medium">The AI is crafting your masterpiece...</p>
                  <p className="text-sm text-slate-400 mt-2 text-center">This usually takes a few seconds.</p>
                </div>
              )}

              {results.map((result, idx) => (
                <div key={result.id} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-200">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{result.type === 'headshot' ? 'Style' : 'Edit'}</span>
                      <h3 className="text-slate-900 font-medium">{result.promptUsed}</h3>
                    </div>
                    <a 
                      href={result.url} 
                      download={`headshot-${idx}.png`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                  
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-2">
                      <img src={result.url} alt="Generated result" className="w-full h-auto max-h-[600px] object-contain bg-slate-100 rounded-lg" />
                    </div>
                    
                    <div className="w-full md:w-80 p-6 border-t md:border-t-0 md:border-l border-slate-200 space-y-6">
                      {/* Lighting Presets */}
                      <div>
                        <h4 className="font-semibold text-slate-900 flex items-center mb-3">
                          <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                          </svg>
                          Quick Lighting
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {LIGHTING_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => handleEdit(result.url, preset.prompt)}
                              disabled={isGenerating}
                              className="px-2 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-200 text-slate-600 transition-colors disabled:opacity-50"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-6">
                        <h4 className="font-semibold text-slate-900 flex items-center mb-3">
                          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Custom AI Edit
                        </h4>
                        <p className="text-xs text-slate-500 mb-3">Describe any other changes you'd like to see.</p>
                        <textarea
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder='e.g., "Change tie color to blue", "Add a retro film filter"'
                          className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none h-24 resize-none mb-3"
                        />
                        <Button 
                          className="w-full" 
                          variant="secondary"
                          onClick={() => handleEdit(result.url)}
                          disabled={!editPrompt.trim()}
                          isLoading={isGenerating}
                        >
                          Apply Custom Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-24 border-t border-slate-200 pt-12 text-center text-slate-500">
        <p className="text-sm font-medium">&copy; 2026 AI Shot AI by R.G. Powered by your credit ard, not mine..</p>
      </footer>
    </div>
  );
};

export default App;
