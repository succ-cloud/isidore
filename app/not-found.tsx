import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <h1>That page is not in the catalogue</h1>
      <p className="lede">The address may have changed. Head back to the shop or the homepage.</p>
      <p>
        <Link className="btn-navy" href="/">
          Back home
        </Link>
      </p>
    </div>
  );
}
