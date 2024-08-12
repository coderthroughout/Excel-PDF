import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudUploadIcon, DocumentDownloadIcon, RefreshIcon } from '@heroicons/react/outline';

function Dashboard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [excelUrl, setExcelUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const fetchRecentFiles = async () => {
    try {
      const response = await axios.get('/api/recent-files');
      setRecentFiles(response.data);
    } catch (error) {
      console.error('Error fetching recent files:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setExcelUrl(url);
      fetchRecentFiles();
    } catch (error) {
      console.error('Error converting file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="mb-4">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Bank Statement (PDF)
              </label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CloudUploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                  </div>
                  <input id="file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={!file || isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshIcon className="animate-spin h-5 w-5 mr-3 inline-block" />
              ) : (
                <DocumentDownloadIcon className="h-5 w-5 mr-3 inline-block" />
              )}
              Convert to Excel
            </button>
          </form>

          {excelUrl && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Download Excel</h2>
              <a
                href={excelUrl}
                download="bank_statement.xlsx"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                Download Excel File
              </a>
            </div>
          )}
        </div>

        <div>
          {preview && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Preview</h2>
              <iframe src={preview} className="w-full h-96 border border-gray-300 rounded-md" title="PDF Preview" />
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-2">Recent Conversions</h2>
            <ul className="divide-y divide-gray-200">
              {recentFiles.map((file, index) => (
                <li key={index} className="py-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <a
                    href={file.url}
                    download={file.name}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;