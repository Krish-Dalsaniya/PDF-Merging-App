import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { PDFProvider, usePDF } from './context/PDFContext';
import DropZone from './components/DropZone';
import PagePreview from './components/PagePreview';
import PDFList from './components/PDFList';
import MergeButton from './components/MergeButton';
import { FileText, Trash2, Layers } from 'lucide-react';

function AppContent() {
    const { pages, processPDF, reorderPages, clearAll, loading } = usePDF();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFilesAdded = async (files) => {
        for (const file of files) {
            await processPDF(file);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            reorderPages(active.id, over.id);
        }
    };

    const hasContent = pages.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Layers className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">PDF Merger</h1>
                                <p className="text-sm text-gray-500">Combine your PDFs effortlessly</p>
                            </div>
                        </div>
                        {hasContent && (
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {!hasContent ? (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <DropZone onFilesAdded={handleFilesAdded} />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Add More PDFs
                                    </h2>
                                </div>
                                <DropZone onFilesAdded={handleFilesAdded} />
                                <PDFList />
                            </div>
                        )}

                        {hasContent && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={pages.map(p => p.id)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <PagePreview pages={pages} />
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}

                        {hasContent && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <MergeButton />
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                How to Use
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                                    <span>Upload your PDF files by dragging or clicking</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                                    <span>Drag pages to reorder them in the desired sequence</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                                    <span>Remove unwanted pages by clicking the X button</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                                    <span>Click merge to download your combined PDF</span>
                                </li>
                            </ul>
                        </div>

                        {hasContent && (
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <FileText className="w-8 h-8" />
                                    <div>
                                        <p className="font-semibold">Summary</p>
                                        <p className="text-sm text-blue-100">
                                            Ready to merge
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-white/10 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold">{pages.length}</p>
                                        <p className="text-xs text-blue-100">Total Pages</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold">{Math.max(...pages.map(p => p.pdfIndex + 1), 0) || 0}</p>
                                        <p className="text-xs text-blue-100">PDF Files</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="border-t border-gray-200 mt-12 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    PDF Merger - Built with Node.js, React, and pdf-lib
                </div>
            </footer>
        </div>
    );
}

function App() {
    return (
        <PDFProvider>
            <AppContent />
        </PDFProvider>
    );
}

export default App;
