import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemeCanvas from '../components/Meme/MemeCanvas';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import { Download, Save, RefreshCw, Upload, PlusCircle } from 'lucide-react';
import { saveMeme } from '../utils/memeStorage';
import { api } from '../services/api';
import { useMemeContext } from '../context/MemeContext';
import { useAuth } from '../context/AuthContext';

const CreateMeme = () => {
  const navigate = useNavigate();
  const { selectedTemplate, refreshMemes } = useMemeContext();
  const { user } = useAuth();
  const [textFields, setTextFields] = useState([

    { id: 1, text: '', x: 50, y: 15, fontSize: 32, color: '#FFFFFF' }
  ]);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [saveStatus, setSaveStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Redirect to upload if no template selected
  useEffect(() => {
    if (!selectedTemplate) {
      navigate('/upload');
    }
  }, [selectedTemplate, navigate]);

  const addTextField = () => {
    const newId = textFields.length > 0 ? Math.max(...textFields.map(f => f.id)) + 1 : 1;
    setTextFields([
      ...textFields,
      {
        id: newId,
        text: '',
        x: 50,
        y: 50,
        fontSize: 32,
        color: '#FFFFFF'
      }
    ]);
  };

  const removeTextField = (id) => {
    if (textFields.length > 1) {
      setTextFields(textFields.filter(f => f.id !== id));
    }
  };

  const updateField = (id, updates) => {
    setTextFields(textFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDownload = () => {
    const container = document.querySelector('.relative.inline-block');
    if (container && container.exportMeme) {
      const exportCanvas = container.exportMeme();
      if (exportCanvas) {
        const link = document.createElement('a');
        link.download = `meme-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL();
        link.click();
      }
    }
  };

  const handleSave = async () => {
    if (isUploading) return;

    if (!user) {
      if (confirm("You need to be logged in to save/upload memes. Go to login?")) {
        navigate('/login');
      }
      return;
    }

    const container = document.querySelector('.relative.inline-block');
    if (container && container.exportMeme) {
      const exportCanvas = container.exportMeme();
      if (exportCanvas) {
        setIsUploading(true);
        setSaveStatus('Uploading...');

        const imageData = exportCanvas.toDataURL('image/png');
        const memeData = {
          url: imageData,
          name: textFields[0]?.text || 'Untitled Meme',
          template: selectedTemplate.name,
          captions: textFields.map(f => f.text),
        };

        try {
          await api.uploadMeme(memeData, user.accessToken);
          setSaveStatus('Saved to Cloud!');
          refreshMemes();
          // Also save locally as backup
          saveMeme(memeData);
        } catch (error) {
          console.error('Failed to upload to server:', error);
          setSaveStatus('Upload Failed');
        } finally {
          setIsUploading(false);
          setTimeout(() => setSaveStatus(''), 3000);
        }
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-8rem)] min-h-[calc(100vh-8rem)] h-auto">
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
        {/* Template Info Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-300">Current Template</h3>
              <p className="text-sm text-slate-400 mt-1">{selectedTemplate?.name}</p>
            </div>
            <Button
              variant="secondary"
              className="px-3 py-1.5 flex items-center gap-2 text-sm"
              onClick={() => navigate('/upload')}
            >
              <Upload size={16} />
              Change
            </Button>
          </div>
        </Card>

        {selectedTemplate && (
          <div className="space-y-6 animate-slide-up">
            {/* Global Settings */}
            <Card>
              <h3 className="text-sm font-semibold mb-4 text-violet-300 uppercase tracking-wider">Global Settings</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Global Font Size: {fontSizeMultiplier.toFixed(1)}x</label>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={fontSizeMultiplier}
                    onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase">
                    <span>Smaller</span>
                    <span>Larger</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Text Captions */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-300">Text Captions</h3>
                <Button
                  variant="primary"
                  className="px-3 py-1.5 text-xs flex items-center gap-1.5"
                  onClick={addTextField}
                >
                  <PlusCircle size={14} />
                  Add Text
                </Button>
              </div>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {textFields.map((field, index) => (
                  <div key={field.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Caption {index + 1}</span>
                      {textFields.length > 1 && (
                        <button
                          onClick={() => removeTextField(field.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          title="Remove caption"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <Input
                      value={field.text}
                      onChange={(e) => updateField(field.id, { text: e.target.value })}
                      placeholder="Type something..."
                      className="bg-slate-900/50"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Size: {field.fontSize}px</label>
                        <input
                          type="range"
                          min="16"
                          max="72"
                          value={field.fontSize}
                          onChange={(e) => updateField(field.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.color}
                            onChange={(e) => updateField(field.id, { color: e.target.value })}
                            className="w-full h-7 rounded focus:outline-none bg-transparent cursor-pointer border border-slate-700 p-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-3 mt-auto">
              <Button
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2 h-12"
                onClick={handleSave}
                disabled={isUploading}
              >
                <Save size={18} />
                {saveStatus || 'Save to Gallery'}
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-green-600 hover:bg-green-700 border-green-500/50 flex items-center justify-center gap-2 h-12"
                onClick={handleDownload}
              >
                <Download size={18} />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Preview */}
      <div className="w-full lg:w-2/3 flex items-center justify-center bg-slate-900/30 rounded-2xl border border-slate-800/50 p-4 lg:p-8 overflow-auto min-h-[400px] lg:min-h-0">
        <MemeCanvas
          template={selectedTemplate}
          textFields={textFields}
          onUpdateField={updateField}
          fontSizeMultiplier={fontSizeMultiplier}
        />
      </div>
    </div>
  );
};

export default CreateMeme;
