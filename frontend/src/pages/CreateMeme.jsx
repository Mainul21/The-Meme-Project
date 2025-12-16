import React, { useState } from 'react';
import TemplateSelector from '../components/Meme/TemplateSelector';
import MemeCanvas from '../components/Meme/MemeCanvas';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import { Download, Save, RefreshCw } from 'lucide-react';
import { saveMeme } from '../utils/memeStorage';
import { api } from '../services/api';
import { useMemeContext } from '../context/MemeContext';

const CreateMeme = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [saveStatus, setSaveStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { refreshMemes } = useMemeContext();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCaptions(new Array(template.box_count).fill(''));
  };

  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
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
    
    const container = document.querySelector('.relative.inline-block');
    if (container && container.exportMeme) {
      const exportCanvas = container.exportMeme();
      if (exportCanvas) {
        setIsUploading(true);
        setSaveStatus('Uploading...');
        
        const imageData = exportCanvas.toDataURL('image/png');
        const memeData = {
          url: imageData,
          name: captions[0] || 'Untitled Meme',
          template: selectedTemplate.name,
          captions: captions,
        };
        
        try {
          // Try to save to MongoDB first
          await api.uploadMeme(memeData);
          setSaveStatus('Saved to Cloud!');
          
          // Refresh gallery cache
          refreshMemes();
          
          // Also save to localStorage as backup
          saveMeme(memeData);
        } catch (error) {
          console.error('Failed to upload to server:', error);
          // Fallback to localStorage only
          const saved = saveMeme(memeData);
          if (saved) {
            setSaveStatus('Saved Locally');
          } else {
            setSaveStatus('Save Failed');
          }
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
        <Card>
          <TemplateSelector 
            onSelect={handleTemplateSelect} 
            selectedTemplate={selectedTemplate} 
          />
        </Card>

        {selectedTemplate && (
          <Card className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Customize</h3>
            <div className="space-y-4">
              {captions.map((caption, index) => (
                <Input
                  key={index}
                  label={`Caption ${index + 1}`}
                  value={caption}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  placeholder={`Enter text for box ${index + 1}`}
                />
              ))}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Text Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer bg-slate-800 border border-slate-700"
                  />
                  <span className="text-sm text-slate-400">{textColor}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="primary" 
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleSave}
                disabled={isUploading}
              >
                <Save size={18} />
                {saveStatus || 'Save'}
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleDownload}
              >
                <Download size={18} />
                Download
              </Button>
              <Button 
                variant="secondary"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  setSelectedTemplate(null);
                  setCaptions([]);
                }}
              >
                <RefreshCw size={18} />
                Reset
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Right Panel: Preview */}
      <div className="w-full lg:w-2/3 flex items-center justify-center bg-slate-900/30 rounded-2xl border border-slate-800/50 p-4 lg:p-8 overflow-auto min-h-[400px] lg:min-h-0">
        <MemeCanvas template={selectedTemplate} captions={captions} textColor={textColor} />
      </div>
    </div>
  );
};

export default CreateMeme;
