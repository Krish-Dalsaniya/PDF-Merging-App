import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFContext = createContext(null);

const initialState = {
    pdfs: [],
    pages: [],
    loading: false,
    error: null,
};

function pdfReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload, error: null };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'ADD_PDF': {
            const newPdf = action.payload;
            const newPages = [...state.pages];
            for (let i = 0; i < newPdf.pageCount; i++) {
                newPages.push({
                    id: `${newPdf.id}-page-${i}`,
                    pdfId: newPdf.id,
                    pdfIndex: state.pdfs.length,
                    pageIndex: i,
                    thumbnail: null,
                });
            }
            return {
                ...state,
                pdfs: [...state.pdfs, newPdf],
                pages: newPages,
                loading: false,
            };
        }
        case 'SET_PDF_THUMBNAIL': {
            const { pageId, thumbnail } = action.payload;
            return {
                ...state,
                pages: state.pages.map(p =>
                    p.id === pageId ? { ...p, thumbnail } : p
                ),
            };
        }
        case 'REORDER_PAGES':
            return { ...state, pages: action.payload };
        case 'DELETE_PAGE':
            return { ...state, pages: state.pages.filter(p => p.id !== action.payload) };
        case 'DELETE_PDF': {
            const pdfId = action.payload;
            return {
                ...state,
                pdfs: state.pdfs.filter(p => p.id !== pdfId),
                pages: state.pages.filter(p => p.pdfId !== pdfId),
            };
        }
        case 'CLEAR_ALL':
            return initialState;
        case 'RESET_LOADING':
            return { ...state, loading: false };
        default:
            return state;
    }
}

export function PDFProvider({ children }) {
    const [state, dispatch] = useReducer(pdfReducer, initialState);

    const processPDF = useCallback(async (file) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pageCount = pdfDoc.getPageCount();

            const newPdf = {
                id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                pageCount,
                data: arrayBuffer,
            };

            dispatch({ type: 'ADD_PDF', payload: newPdf });
            return newPdf.id;
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: `Failed to process ${file.name}` });
            return null;
        }
    }, []);

    const generateThumbnail = useCallback(async (pdfId, pdfData, pageIndex, pageId) => {
        try {
            const loadingTask = pdfjsLib.getDocument({ data: pdfData.slice(0) });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(pageIndex + 1);

            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;

            const thumbnail = canvas.toDataURL('image/png');
            dispatch({ type: 'SET_PDF_THUMBNAIL', payload: { pageId, thumbnail } });
        } catch (error) {
            console.error('Thumbnail generation failed:', error);
        }
    }, []);

    const reorderPages = useCallback((activeId, overId) => {
        const oldIndex = state.pages.findIndex(p => p.id === activeId);
        const newIndex = state.pages.findIndex(p => p.id === overId);

        if (oldIndex === -1 || newIndex === -1) return;

        const newPages = [...state.pages];
        const [removed] = newPages.splice(oldIndex, 1);
        newPages.splice(newIndex, 0, removed);

        dispatch({ type: 'REORDER_PAGES', payload: newPages });
    }, [state.pages]);

    const deletePage = useCallback((pageId) => {
        dispatch({ type: 'DELETE_PAGE', payload: pageId });
    }, []);

    const deletePdf = useCallback((pdfId) => {
        dispatch({ type: 'DELETE_PDF', payload: pdfId });
    }, []);

    const clearAll = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' });
    }, []);

    const value = {
        ...state,
        processPDF,
        generateThumbnail,
        reorderPages,
        deletePage,
        deletePdf,
        clearAll,
    };

    return (
        <PDFContext.Provider value={value}>
            {children}
        </PDFContext.Provider>
    );
}

export function usePDF() {
    const context = useContext(PDFContext);
    if (!context) {
        throw new Error('usePDF must be used within a PDFProvider');
    }
    return context;
}
