'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [url, setUrl] = useState('');
  const [clonedHtml, setClonedHtml] = useState('');
  const [originalHtml, setOriginalHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/v1/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error('Failed to clone website');
      }
      const data = await response.json();
      setClonedHtml(data.html);
      setOriginalHtml(data.original_html);
      setViewMode('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format HTML for readability
  const formatHTML = (html: string) => {
    let formatted = '';
    let indent = '';
    const tab = '  ';
    html.split(/>\s*</).forEach(function(node) {
      if (node.match(/^\/\w/)) {
        indent = indent.substring(tab.length);
      }
      formatted += indent + '<' + node + '>' + '\n';
      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input')) {
        indent += tab;
      }
    });
    return formatted.substring(1, formatted.length - 1);
  };

  // Write the cloned HTML to the iframe when it changes
  useEffect(() => {
    if (viewMode === 'preview' && iframeRef.current && clonedHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        // Universal CSS override to force full width/height
        const style = `
          <style>
            html, body, #root, #app, main, .container, .main, .content {
              width: 100vw !important;
              height: 100vh !important;
              min-width: 100vw !important;
              min-height: 100vh !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              overflow: auto !important;
            }
            * {
              box-sizing: border-box !important;
              max-width: 100vw !important;
            }
          </style>
        `;
        doc.write(style + clonedHtml);
        doc.close();
      }
    }
  }, [clonedHtml, viewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-900 flex flex-col items-center px-4 py-10">
      {/* Header Card */}
      <div className="w-full max-w-3xl mb-8">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Website<span className="text-blue-500">Cloner</span></h1>
          <p className="mt-2 text-lg text-gray-600 text-center max-w-2xl">
            Transform any website into clean, reusable code with our powerful cloning tool
          </p>
        </div>
      </div>

      {/* Search Bar Card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl mb-8"
      >
        <div className="bg-white rounded-2xl shadow-md p-6 flex gap-4 items-center">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL to clone"
            className="flex-1 px-4 py-3 bg-gray-50 text-lg text-gray-900 placeholder-gray-400 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold text-lg rounded-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cloning...
              </span>
            ) : (
              'Clone'
            )}
          </button>
        </div>
      </motion.form>

      {/* Results Card */}
      <AnimatePresence>
        {clonedHtml && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full flex justify-center"
          >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg flex flex-col gap-4 w-[90vw] h-[80vh] p-6">
              {/* Toggle Buttons */}
              <div className="flex justify-center gap-4 mb-2">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors text-base ${viewMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('html')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors text-base ${viewMode === 'html' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  View HTML
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 min-h-0 max-h-full overflow-auto rounded-xl bg-gray-50 p-2">
                <AnimatePresence mode="wait">
                  {viewMode === 'preview' ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex justify-center items-center"
                    >
                      <iframe
                        ref={iframeRef}
                        title="Cloned Website Preview"
                        className="w-full h-full border-0 rounded-xl bg-white"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="html"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full overflow-auto"
                    >
                      <pre className="text-sm font-mono whitespace-pre-wrap text-blue-700">
                        <code>{formatHTML(originalHtml)}</code>
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 max-w-md z-50"
          >
            <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
