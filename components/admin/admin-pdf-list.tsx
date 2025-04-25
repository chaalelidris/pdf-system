"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Category, type PdfDocument } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface AdminPdfListProps {
  refreshTrigger?: number;
}

export function AdminPdfList({ refreshTrigger = 0 }: AdminPdfListProps) {
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [filteredPdfs, setFilteredPdfs] = useState<PdfDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { toast } = useToast();

  const fetchPdfs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pdfs");
      if (!response.ok) {
        throw new Error("Failed to fetch PDFs");
      }
      console.log("Response:", response);
      const data = await response.json();
      setPdfs(data.pdfs);
      setFilteredPdfs(data.pdfs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load PDF documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, [refreshTrigger]);

  useEffect(() => {
    // Filter PDFs based on search query and category
    let filtered = pdfs;

    if (searchQuery) {
      filtered = filtered.filter((pdf) =>
        pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((pdf) => pdf.category === categoryFilter);
    }

    setFilteredPdfs(filtered);
  }, [searchQuery, categoryFilter, pdfs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this PDF?")) {
      return;
    }

    try {
      const response = await fetch(`/api/pdfs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete PDF");
      }

      toast({
        title: "Success",
        description: "PDF deleted successfully",
      });

      // Refresh the list
      fetchPdfs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Documents
        </CardTitle>
        <CardDescription>Manage uploaded PDF documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value={Category.FinancialSeries}>
                {Category.FinancialSeries}
              </SelectItem>
              <SelectItem value={Category.GeneralAdministration}>
                {Category.GeneralAdministration}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading documents...</div>
        ) : filteredPdfs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No PDF documents found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPdfs.map((pdf) => (
                  <TableRow key={pdf.id}>
                    <TableCell className="font-medium">{pdf.title}</TableCell>
                    <TableCell>{pdf.category}</TableCell>
                    <TableCell>{formatDate(pdf.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(`/api/pdfs/${pdf.filename}`, "_blank")
                          }
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(pdf.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
