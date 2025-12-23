import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemeContext } from '../context/MemeContext';
import TemplateSelector from '../components/Meme/TemplateSelector';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Upload, ArrowRight } from 'lucide-react';

const UploadTemplate = () => {
    const navigate = useNavigate();
    const { selectedTemplate, setSelectedTemplate } = useMemeContext();
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const customTemplate = {
                    id: `custom-${Date.now()}`,
                    name: file.name,
                    url: reader.result,
                    box_count: 2,
                    isCustom: true
                };
                setUploadedImage(customTemplate);
                setSelectedTemplate(customTemplate);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProceed = () => {
        if (selectedTemplate || uploadedImage) {
            navigate('/create');
        }
    };

    const currentTemplate = uploadedImage || selectedTemplate;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-violet-400 mb-2">Choose Your Meme Template</h1>
                <p className="text-slate-400">Upload your own image or select from popular templates</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-slate-300 flex items-center gap-2">
                            <Upload size={20} />
                            Upload Custom Image
                        </h3>

                        <label className="flex flex-col items-center justify-center w-full min-h-[250px] border-2 border-dashed border-slate-700 rounded-lg cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 hover:border-violet-500/50 group">
                            {uploadedImage ? (
                                <div className="relative w-full h-full p-4">
                                    <img
                                        src={uploadedImage.url}
                                        alt="Uploaded template"
                                        className="w-full h-full object-contain rounded"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setUploadedImage(null);
                                            if (selectedTemplate?.isCustom) {
                                                setSelectedTemplate(null);
                                            }
                                        }}
                                        className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200 hover:scale-110 shadow-lg"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg
                                        className="w-12 h-12 mb-4 text-slate-500 group-hover:text-violet-400 transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <p className="mb-2 text-base text-slate-400 group-hover:text-violet-300 transition-colors font-semibold">
                                        Upload Your Image
                                    </p>
                                    <p className="text-sm text-slate-500">Click or drag and drop</p>
                                    <p className="text-xs text-slate-600 mt-1">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </label>

                        {currentTemplate && (
                            <div className="mt-6">
                                <Button
                                    variant="primary"
                                    className="w-full flex items-center justify-center gap-2"
                                    onClick={handleProceed}
                                >
                                    Continue to Editor
                                    <ArrowRight size={18} />
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Template Gallery */}
                <div className="lg:col-span-2">
                    <Card>
                        <TemplateSelector
                            onSelect={handleTemplateSelect}
                            selectedTemplate={selectedTemplate}
                        />
                    </Card>
                </div>
            </div>

            {/* Selected Template Info */}
            {currentTemplate && (
                <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-violet-300 font-semibold">Selected Template:</p>
                            <p className="text-lg text-slate-200">{currentTemplate.name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-violet-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium">Ready</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadTemplate;
