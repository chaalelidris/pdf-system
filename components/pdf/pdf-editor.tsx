"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Category, PdfType, PdfOrigin, type PdfDocument } from "@/lib/types";

interface PdfEditorProps {
  pdf: PdfDocument;
}

export function PdfEditor({ pdf }: PdfEditorProps) {
  const [title, setTitle] = useState(pdf.title);
  const [category, setCategory] = useState<Category>(pdf.category as Category);
  const [type, setType] = useState<PdfType>(pdf.type as PdfType);
  const [origin, setOrigin] = useState<PdfOrigin>(pdf.origin as PdfOrigin);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/pdfs/${pdf.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
          type,
          origin,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update PDF");
      }

      toast({
        title: "Success",
        description: "PDF updated successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update PDF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Edit PDF Metadata
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
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
          <div className="space-y-2">
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
                <SelectItem value={PdfType.General}>General</SelectItem>
                <SelectItem value={PdfType.Confidential}>
                  Confidential
                </SelectItem>
                <SelectItem value={PdfType.Restricted}>Restricted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
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
                <SelectItem value={PdfOrigin.Internal}>Internal</SelectItem>
                <SelectItem value={PdfOrigin.External}>External</SelectItem>
                <SelectItem value={PdfOrigin.Classified}>Classified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
