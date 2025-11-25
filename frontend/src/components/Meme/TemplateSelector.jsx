import React from 'react';
import memesData from '../../../meme.json';

const TemplateSelector = ({ onSelect, selectedTemplate }) => {
  const memes = memesData.data.memes;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-300">Choose Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {memes.map((meme) => (
          <div
            key={meme.id}
            onClick={() => onSelect(meme)}
            className={`
              cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 relative group
              ${selectedTemplate?.id === meme.id 
                ? 'border-violet-500 shadow-glow scale-[1.02]' 
                : 'border-transparent hover:border-slate-600 hover:scale-[1.02]'
              }
            `}
          >
            <img 
              src={meme.url} 
              alt={meme.name} 
              className="w-full h-32 object-cover bg-slate-800"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <p className="text-xs text-white font-medium truncate">{meme.name}</p>
            </div>
            {selectedTemplate?.id === meme.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
