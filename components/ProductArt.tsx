import { photoFor } from "@/lib/images";

export function ProductArt({
  category,
  seed = "",
  alt = "",
}: {
  category: string;
  seed?: string;
  alt?: string;
}) {
  return (
    <span className="art art-photo">
      <img src={photoFor(category, seed)} alt={alt} />
    </span>
  );
}
