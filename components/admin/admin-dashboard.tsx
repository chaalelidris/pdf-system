"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/lib/types"
import { CreateUserForm } from "@/components/admin/create-user-form"
import { UploadPdfForm } from "@/components/admin/upload-pdf-form"
import { AdminPdfList } from "@/components/admin/admin-pdf-list"

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [refreshPdfList, setRefreshPdfList] = useState(0)

  const handlePdfUploaded = () => {
    setRefreshPdfList((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="pdfs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pdfs">PDFs</TabsTrigger>
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          <TabsTrigger value="users">Create User</TabsTrigger>
        </TabsList>

        <TabsContent value="pdfs" className="mt-6">
          <AdminPdfList refreshTrigger={refreshPdfList} />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <UploadPdfForm onSuccess={handlePdfUploaded} />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <CreateUserForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
