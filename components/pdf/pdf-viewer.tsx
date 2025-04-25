"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Use the CDN version of the worker file:
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  fileUrl: string;
  filename: string;
}

export function PdfViewer({ fileUrl, filename }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const { toast } = useToast();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    toast({
      title: "PDF loaded successfully",
      description: `Document has ${numPages} pages`,
    });
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    toast({
      title: "Error loading PDF",
      description: "Could not load the PDF document. Please try again later.",
      variant: "destructive",
    });
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return newPageNumber >= 1 && newPageNumber <= (numPages || 1)
        ? newPageNumber
        : prevPageNumber;
    });
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {pageNumber} of {numPages || "--"}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(1)}
              disabled={!numPages || pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span>{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="icon" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(fileUrl, "_blank")}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-center border rounded-lg p-4 bg-white">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="text-center py-10">Loading PDF...</div>}
            error={
              <div className="text-center py-10 text-red-500">
                Failed to load PDF. Please try again.
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </CardContent>
    </Card>
  );
}
