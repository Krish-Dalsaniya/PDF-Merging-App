import React, { useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import { usePDF } from '../context/PDFContext';

function SortablePage({ page, pdfName }) {
    const { deletePage, generateThumbnail, pdfs } = usePDF();
    const pdf = pdfs.find(p => p.id === page.pdfId);

    useEffect(() => {
        if (!page.thumbnail && pdf?.data) {
            generateThumbnail(page.pdfId, pdf.data, page.pageIndex, page.id);
        }
    }, [page.id, page.pageIndex, page.pdfId, page.thumbnail, pdf?.data, generateThumbnail]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    const pageNumber = page.pageIndex + 1;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                relative group bg-white rounded-lg shadow-md overflow-hidden
                border border-gray-200 hover:shadow-lg transition-all duration-200
                ${isDragging ? 'ring-2 ring-blue-500' : ''}
            `}
        >
            <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center relative">
                {page.thumbnail ? (
                    <img
                        src={page.thumbnail}
                        alt={`Page ${pageNumber}`}
                        className="max-w-full max-h-full object-contain"
                    />
                ) : (
                    <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg font-semibold">
                                {pageNumber}
                            </span>
                        </div>
                    </div>
                )}
                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {pageNumber}
                </div>
            </div>
            <div className="p-2 flex items-center justify-between bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-1 min-w-0">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing touch-none"
                    >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-xs text-gray-500 truncate" title={pdfName}>
                        {pdfName}
                    </span>
                </div>
                <button
                    onClick={() => deletePage(page.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove page"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function PagePreview({ pages }) {
    const { pdfs } = usePDF();

    if (pages.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                    Pages ({pages.length})
                </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {pages.map((page) => {
                    const pdf = pdfs.find(p => p.id === page.pdfId);
                    return (
                        <SortablePage
                            key={page.id}
                            page={page}
                            pdfName={pdf?.name || 'Unknown'}
                        />
                    );
                })}
            </div>
        </div>
    );
}
