'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [url, setUrl] = useState('');
  const [clonedHtml, setClonedHtml] = useState('');
  const [originalHtml, setOriginalHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHtml, setShowHtml] = useState(false);

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
      setShowHtml(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([clonedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cloned-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-300 to-pink-200 font-sans transition-all">
      <div className="flex flex-col items-center w-full max-w-2xl gap-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full flex flex-col items-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Website<span className="text-blue-600">Cloner</span></h1>
          <p className="text-lg text-gray-600 max-w-xl text-center">Clone any website's design using AI. Enter a URL and get a clean, reusable HTML/CSS preview.</p>
        </div>

        {/* Search Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col sm:flex-row gap-4 items-center border border-gray-200 w-full">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a website URL (e.g. https://example.com)"
              className="flex-1 px-5 py-3 bg-gray-50 text-lg text-gray-900 placeholder-gray-400 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-colors text-white font-semibold text-lg rounded-lg shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? 'Cloning...' : 'Clone'}
            </button>
          </div>
        </motion.form>

        {/* Download & View HTML Section */}
        <AnimatePresence>
          {clonedHtml && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col items-center w-full p-8">
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={downloadHtml}
                    className="px-6 py-2 rounded-lg font-medium transition-colors text-base bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg"
                  >
                    Download HTML
                  </button>
                  <button
                    onClick={() => setShowHtml((v) => !v)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors text-base shadow-lg ${showHtml ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {showHtml ? 'Hide HTML' : 'View HTML'}
                  </button>
                </div>
                {showHtml && (
                  <div className="w-full h-[60vh] overflow-auto bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <pre className="text-sm font-mono whitespace-pre-wrap text-blue-700">
                      <code>{formatHTML(clonedHtml)}</code>
                    </pre>
                  </div>
                )}
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
    </div>
  );
}
