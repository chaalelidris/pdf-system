import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PdfEditor } from "@/components/pdf/pdf-editor";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { AppLayout } from "@/components/layout/app-layout";

interface PdfEditPageProps {
  params: {
    id: string;
  };
}

export default async function PdfEditPage({ params }: PdfEditPageProps) {
  const user = await requireAdmin();
  const { id } = params;

  // Fetch PDF details
  const pdf = await db.pdf.findUnique({
    where: { id },
  });

  if (!pdf) {
    notFound();
  }

  const fileUrl = `/api/pdfs/${id}?download=true`;

  const userData = {
    id: user.id,
    name: user.name ?? "Unknown User",
    email: user.email ?? "None",
    role: user.role,
    image: user.image ?? null,
  };

  return (
    <AppLayout user={userData}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Edit PDF Document</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PdfEditor
            pdf={{
              id: pdf.id,
              title: pdf.title,
              filename: pdf.filename,
              category: pdf.category,
              type: pdf.type || "general",
              origin: pdf.origin || "internal",
              createdAt: pdf.createdAt.toISOString(),
            }}
          />
          <PdfViewer fileUrl={fileUrl} filename={pdf.filename} />
        </div>
      </div>
    </AppLayout>
  );
}
