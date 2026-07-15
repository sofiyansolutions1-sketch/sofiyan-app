const fs = require('fs');
let content = fs.readFileSync('components/BlogManager.tsx', 'utf8');

const oldButton = `<div className="flex justify-end pt-4 border-t">
                        <button type="submit" disabled={isPublishing} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-50">
                            {isPublishing ? 'Publishing...' : (editingId ? 'Update Article' : 'Publish Article')}
                        </button>
                    </div>`;

const newButton = `<div className="flex justify-end pt-4 border-t">
                        <button type="submit" disabled={isPublishing} className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-indigo-700 transition shadow-lg disabled:opacity-50">
                            {isPublishing ? 'Publishing...' : (editingId ? 'Update Article' : 'Publish Article')}
                        </button>
                    </div>`;

content = content.replace(oldButton, newButton);
fs.writeFileSync('components/BlogManager.tsx', content);
