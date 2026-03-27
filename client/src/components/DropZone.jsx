import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FolderOpen } from 'lucide-react';

export default function DropZone({ onFilesAdded }) {
    const fileInputRef = useRef(null);
    
    const onDrop = useCallback((acceptedFiles) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length > 0) {
            onFilesAdded(pdfFiles);
        }
    }, [onFilesAdded]);

    const { isDragActive, getRootProps } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: true,
        noClick: true,
    });

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            onFilesAdded(files);
        }
        event.target.value = '';
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-xl p-8 md:p-12 text-center
                    transition-all duration-200 ease-in-out
                    ${isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                    <div className={`
                        p-4 rounded-full transition-colors
                        ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}
                    `}>
                        {isDragActive ? (
                            <FileText className="w-12 h-12 text-blue-500" />
                        ) : (
                            <Upload className="w-12 h-12 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-700">
                            {isDragActive ? 'Drop your PDFs here' : 'Drag & drop PDF files here'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            or use the button below
                        </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Supports multiple PDF files
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={handleBrowseClick}
                className="
                    w-full py-4 px-6 rounded-xl font-semibold text-white
                    bg-gradient-to-r from-blue-600 to-indigo-600 
                    hover:from-blue-700 hover:to-indigo-700 
                    shadow-lg hover:shadow-xl transition-all
                    flex items-center justify-center gap-3
                "
            >
                <FolderOpen className="w-5 h-5" />
                Browse Files
            </button>
        </div>
    );
}
