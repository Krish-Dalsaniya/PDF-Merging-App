import React from 'react';
import { FileText, Trash2, X } from 'lucide-react';
import { usePDF } from '../context/PDFContext';

export default function PDFList() {
    const { pdfs, deletePdf } = usePDF();

    if (pdfs.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
                Uploaded Files ({pdfs.length})
            </h3>
            <div className="space-y-2">
                {pdfs.map((pdf) => (
                    <div
                        key={pdf.id}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <FileText className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-gray-800 truncate" title={pdf.name}>
                                    {pdf.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {pdf.pageCount} {pdf.pageCount === 1 ? 'page' : 'pages'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => deletePdf(pdf.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete file"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
