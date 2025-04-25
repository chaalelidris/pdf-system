"use client";

import type React from "react";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Category, PdfType, PdfOrigin } from "@/lib/types";

interface PdfUploadDialogProps {
  onSuccess?: () => void;
}

export function PdfUploadDialog({ onSuccess }: PdfUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [type, setType] = useState<PdfType | "">("");
  const [origin, setOrigin] = useState<PdfOrigin>(PdfOrigin.CENTRAL);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setType("");
    setOrigin(PdfOrigin.CENTRAL);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title || !category || !type) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("origin", origin);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload PDF");
      }

      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });

      // Reset form and close dialog
      resetForm();
      setOpen(false);

      // Trigger refresh of PDF list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <FileUp className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload PDF Document</DialogTitle>
          <DialogDescription>
            Upload a new PDF document to the system. Fill in all required
            fields.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as Category)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Category.FinancialSeries}>
                    {Category.FinancialSeries}
                  </SelectItem>
                  <SelectItem value={Category.GeneralAdministration}>
                    {Category.GeneralAdministration}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as PdfType)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PdfType).map((pdfType) => (
                    <SelectItem key={pdfType} value={pdfType}>
                      {pdfType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="origin">Document Origin</Label>
              <Select
                value={origin}
                onValueChange={(value) => setOrigin(value as PdfOrigin)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PdfOrigin).map((pdfOrigin) => (
                    <SelectItem key={pdfOrigin} value={pdfOrigin}>
                      {pdfOrigin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">PDF File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB. Only PDF files are allowed.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload PDF"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
