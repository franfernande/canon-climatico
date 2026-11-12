import { VistaAlquiler } from "@/components/flujo/VistaAlquiler";

export default async function PaginaAlquiler({ params }: PageProps<"/alquiler/[id]">) {
  const { id } = await params;
  return <VistaAlquiler id={Number(id)} />;
}
