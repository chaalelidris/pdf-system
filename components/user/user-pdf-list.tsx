"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Download, FileText, LogOut, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Category, type PdfDocument } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface UserPdfListProps {
  user: {
    name: string
    email: string
  }
}

export function UserPdfList({ user }: UserPdfListProps) {
  const [pdfs, setPdfs] = useState<PdfDocument[]>([])
  const [filteredPdfs, setFilteredPdfs] = useState<PdfDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchPdfs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/pdfs")
        if (!response.ok) {
          throw new Error("Failed to fetch PDFs")
        }
        const data = await response.json()
        setPdfs(data.pdfs)
        setFilteredPdfs(data.pdfs)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load PDF documents",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdfs()
  }, [toast])

  useEffect(() => {
    // Filter PDFs based on search query and category
    let filtered = pdfs

    if (searchQuery) {
      filtered = filtered.filter((pdf) => pdf.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((pdf) => pdf.category === categoryFilter)
    }

    setFilteredPdfs(filtered)
  }, [searchQuery, categoryFilter, pdfs])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-xl font-bold">Military PDF System</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Documents
            </CardTitle>
            <CardDescription>Browse and download available PDF documents</CardDescription>
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
                  <SelectItem value={Category.FinancialSeries}>{Category.FinancialSeries}</SelectItem>
                  <SelectItem value={Category.GeneralAdministration}>{Category.GeneralAdministration}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading documents...</div>
            ) : filteredPdfs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No PDF documents found</div>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/pdfs/${pdf.filename}`, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
