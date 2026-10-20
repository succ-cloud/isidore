import { photoFor } from "@/lib/images";

export function ProductArt({
  category,
  seed = "",
  image,
  alt = "",
}: {
  category: string;
  seed?: string;
  image?: string;
  alt?: string;
}) {
  return (
    <span className="art art-photo">
      <img src={image || photoFor(category, seed)} alt={alt} />
    </span>
  );
}
