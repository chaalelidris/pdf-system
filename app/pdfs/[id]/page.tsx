import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { AppLayout } from "@/components/layout/app-layout";

interface PdfViewPageProps {
  params: {
    id: string;
  };
}

export default async function PdfViewPage({ params }: PdfViewPageProps) {
  const user = await requireAuth();
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
    image: null,
  };

  return (
    <AppLayout user={userData}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{pdf.title}</h1>
          <p className="text-muted-foreground">
            {pdf.category} • {pdf.type} • {pdf.origin}
          </p>
        </div>
        <PdfViewer fileUrl={fileUrl} filename={pdf.filename} />
      </div>
    </AppLayout>
  );
}
