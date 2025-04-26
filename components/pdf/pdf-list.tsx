"use client";

import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Eye, Edit, Trash2, Search } from "lucide-react";

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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Category,
  PdfType,
  PdfOrigin,
  type PdfDocument,
  type PaginationParams,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PdfUploadDialog } from "@/components/pdf/pdf-upload-dialog";

interface PdfListProps {
  isAdmin?: boolean;
}

export function PdfList({ isAdmin = false }: PdfListProps) {
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [originFilter, setOriginFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    (value: string) => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1"); // Reset to first page when searching
        params.set("search", value);
        router.push(`?${params.toString()}`);
      }, 300); // 300ms debounce
    },
    [searchParams, router]
  );

  useEffect(() => {
    // Get filters from URL if present
    const page = Number.parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const origin = searchParams.get("origin") || "";

    setSearchQuery(search);
    setCategoryFilter(category);
    setTypeFilter(type);
    setOriginFilter(origin);
    setPagination((prev) => ({ ...prev, page }));

    fetchPdfs(page, search, category, type, origin);
  }, [searchParams]);

  const fetchPdfs = async (
    page = 1,
    search: string = searchQuery,
    category: string = categoryFilter,
    type: string = typeFilter,
    origin: string = originFilter
  ) => {
    setIsLoading(true);
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.set("page", page.toString());
      queryParams.set("limit", pagination.limit.toString());
      if (search) queryParams.set("search", search);
      if (category) queryParams.set("category", category);
      if (type) queryParams.set("type", type);
      if (origin) queryParams.set("origin", origin);

      const response = await fetch(`/api/pdfs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch PDFs");
      }
      const data = await response.json();
      setPdfs(data.pdfs);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
      });
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (
    type: "category" | "type" | "origin",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to first page when filtering

    if (type === "category") {
      setCategoryFilter(value);
      if (value === "all") {
        params.delete("category");
      } else {
        params.set("category", value);
      }
    } else if (type === "type") {
      setTypeFilter(value);
      if (value === "all") {
        params.delete("type");
      } else {
        params.set("type", value);
      }
    } else if (type === "origin") {
      setOriginFilter(value);
      if (value === "all") {
        params.delete("origin");
      } else {
        params.set("origin", value);
      }
    }

    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

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
      fetchPdfs(pagination.page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PDF",
        variant: "destructive",
      });
    }
  };

  const handleView = (pdf: PdfDocument) => {
    router.push(`/pdfs/${pdf.id}`);
  };

  const handleEdit = (pdf: PdfDocument) => {
    router.push(`/admin/pdfs/${pdf.id}/edit`);
  };

  const handleDownload = (pdf: PdfDocument) => {
    window.open(`/api/pdfs/${pdf.id}?download=true`, "_blank");
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const getTypeColor = (type: string) => {
    switch (type) {
      case PdfType.ORDER:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case PdfType.OFFICIAL_DECREE:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case PdfType.OFFICIAL_GAZETTE:
        return "bg-red-100 text-red-800 border-red-200";
      case PdfType.MEMORANDUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case PdfType.DECISION:
        return "bg-amber-100 text-amber-800 border-amber-200";
      case PdfType.PUBLICATION:
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case PdfType.REGULATION:
        return "bg-teal-100 text-teal-800 border-teal-200";
      case PdfType.DIRECTIVE:
        return "bg-lime-100 text-lime-800 border-lime-200";
      case PdfType.INSTRUCTION:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case PdfType.BYLAW:
        return "bg-violet-100 text-violet-800 border-violet-200";
      case PdfType.DISPATCH:
        return "bg-pink-100 text-pink-800 border-pink-200";
      case PdfType.OTHERS:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getOriginColor = (origin: string) => {
    switch (origin) {
      case PdfOrigin.REGIONAL:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case PdfOrigin.BRIGADE_COMMANDER:
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>PDF Documents</CardTitle>
          {isAdmin && (
            <PdfUploadDialog onSuccess={() => fetchPdfs(pagination.page)} />
          )}
        </div>
        <CardDescription>Browse and manage PDF documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
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
          <Select
            value={typeFilter}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(PdfType).map((pdfType) => (
                <SelectItem key={pdfType} value={pdfType}>
                  {pdfType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={originFilter}
            onValueChange={(value) => handleFilterChange("origin", value)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Origins" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Origins</SelectItem>
              {Object.values(PdfOrigin).map((pdfOrigin) => (
                <SelectItem key={pdfOrigin} value={pdfOrigin}>
                  {pdfOrigin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading documents...</div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No PDF documents found
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">
                      File Number
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Origin
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pdfs.map((pdf) => (
                    <TableRow key={pdf.id}>
                      <TableCell className="font-medium">{pdf.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pdf.fileNumber}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pdf.category}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={getTypeColor(pdf.type)}
                        >
                          {pdf.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={getOriginColor(pdf.origin)}
                        >
                          {pdf.origin}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(pdf.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(pdf)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">
                              View
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(pdf)}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">
                              Download
                            </span>
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(pdf)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">
                                  Edit
                                </span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(pdf.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">
                                  Delete
                                </span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pagination.page > 1 &&
                        handlePageChange(pagination.page - 1)
                      }
                      className={
                        pagination.page <= 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page and pages around current page
                      const current = pagination.page;
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= current - 1 && page <= current + 1)
                      );
                    })
                    .map((page, i, array) => {
                      // Add ellipsis
                      const prevPage = array[i - 1];
                      const showEllipsisBefore =
                        prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsisBefore && (
                            <PaginationItem>
                              <span className="px-2">...</span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={page === pagination.page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        pagination.page < totalPages &&
                        handlePageChange(pagination.page + 1)
                      }
                      className={
                        pagination.page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
