"use client";

import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Eye, Edit, Trash2, Search, Filter } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Category,
  PdfType,
  PdfOrigin,
  type PdfDocument,
  type PaginationParams,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";

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

  const applyFilters = () => {
    // Update URL with filters
    const params = new URLSearchParams();
    params.set("page", "1"); // Reset to first page when filtering
    if (searchQuery) params.set("search", searchQuery);
    if (categoryFilter) params.set("category", categoryFilter);
    if (typeFilter) params.set("type", typeFilter);
    if (originFilter) params.set("origin", originFilter);

    router.push(`?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setTypeFilter("");
    setOriginFilter("");
    router.push("?page=1");
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
      case PdfType.Confidential:
        return "bg-red-100 text-red-800 border-red-200";
      case PdfType.Restricted:
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getOriginColor = (origin: string) => {
    switch (origin) {
      case PdfOrigin.External:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case PdfOrigin.Classified:
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>PDF Documents</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Documents</SheetTitle>
                <SheetDescription>
                  Apply filters to narrow down the document list
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value={PdfType.General}>General</SelectItem>
                      <SelectItem value={PdfType.Confidential}>
                        Confidential
                      </SelectItem>
                      <SelectItem value={PdfType.Restricted}>
                        Restricted
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin</Label>
                  <Select value={originFilter} onValueChange={setOriginFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Origins" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Origins</SelectItem>
                      <SelectItem value={PdfOrigin.Internal}>
                        Internal
                      </SelectItem>
                      <SelectItem value={PdfOrigin.External}>
                        External
                      </SelectItem>
                      <SelectItem value={PdfOrigin.Classified}>
                        Classified
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <SheetClose asChild>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </CardTitle>
        <CardDescription>Browse and manage PDF documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Quick search by title..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(pdf)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownload(pdf)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(pdf)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(pdf.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
