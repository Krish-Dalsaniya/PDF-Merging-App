import React, { useState } from 'react';
import { Merge, Loader2, Download } from 'lucide-react';
import { usePDF } from '../context/PDFContext';

export default function MergeButton() {
    const { pages, pdfs, clearAll } = usePDF();
    const [merging, setMerging] = useState(false);
    const [error, setError] = useState(null);

    const handleMerge = async () => {
        if (pages.length === 0 || pdfs.length === 0) return;

        setMerging(true);
        setError(null);

        try {
            const formData = new FormData();

            pdfs.forEach((pdf) => {
                formData.append('pdfs', new Blob([pdf.data], { type: 'application/pdf' }));
            });

            const pageOrder = pages.map(page => ({
                pdfIndex: page.pdfIndex,
                pageIndex: page.pageIndex,
            }));
            formData.append('pageOrder', JSON.stringify(pageOrder));

            const response = await fetch('/api/merge', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Merge failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            clearAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setMerging(false);
        }
    };

    const totalPages = pages.length;

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <button
                onClick={handleMerge}
                disabled={merging || totalPages === 0}
                className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-white
                    flex items-center justify-center gap-3 transition-all
                    ${merging || totalPages === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    }
                `}
            >
                {merging ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Merging...
                    </>
                ) : (
                    <>
                        <Merge className="w-5 h-5" />
                        Merge {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
                    </>
                )}
            </button>

            {totalPages > 0 && (
                <p className="text-center text-sm text-gray-500">
                    The pages will be merged in the order shown above
                </p>
            )}
        </div>
    );
}
