import { PublishedWorld } from "@/components/published/PublishedWorld";

export default function PublishedPage({ params }: { params: { slug: string } }) {
  return <PublishedWorld slug={params.slug} />;
}
