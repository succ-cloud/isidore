"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { branches, categories, products } from "@/lib/catalog";
import { formatRand, site } from "@/lib/site";

const infoLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/blog", label: "Blog" },
  { href: "/delivery", label: "Delivery & Returns" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, subtotal } = useCart();
  const { user, logout } = useAuth();
  const { branchId, setBranchId } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [stuck, setStuck] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const searchId = useId();
  const branch = branches.find((item) => item.id === branchId);
  const remaining = Math.max(0, site.freeDelivery - subtotal);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setLocationOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    const locked = menuOpen || locationOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, locationOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setLocationOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    return products
      .filter((product) => `${product.name} ${product.brand} ${product.summary}`.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [query]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const needle = query.trim();
    if (!needle) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(needle)}`);
  }

  return (
    <header className={`site-header${stuck ? " is-stuck" : ""}`}>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="promo-bar">
        <TruckIcon />
        <p>
          {remaining === 0
            ? "You qualify for free delivery"
            : `You are only ${formatRand(remaining)} away from free delivery`}
        </p>
      </div>

      <div className="header-main">
        <Link href="/" className="logo-link" aria-label={`${site.name} home`}>
          <Logo />
        </Link>

        <button className="location-btn" type="button" onClick={() => setLocationOpen(true)}>
          <PinIcon />
          <span>{branch ? branch.city : "Select location"}</span>
        </button>

        <nav className="quick-nav" aria-label="Quick links">
          <Link className="quick-link" href="/">
            <HomeIcon />
            Home
          </Link>
          <button className="quick-link" type="button" onClick={() => setSearchOpen((open) => !open)} aria-expanded={searchOpen}>
            <SearchIcon />
            Search
          </button>
          <Link className="quick-link" href={user ? "/account" : "/login"}>
            <UserIcon />
            {user ? "Account" : "Login"}
          </Link>
          {user ? (
            <button
              className="quick-link"
              type="button"
              onClick={() => {
                void logout();
                router.push("/");
              }}
            >
              <RegisterIcon />
              Sign out
            </button>
          ) : (
            <Link className="quick-link" href="/register">
              <RegisterIcon />
              Register
            </Link>
          )}
          <Link className="quick-link cart-link" href="/cart" aria-label={`Cart, ${count} items`}>
            <span className="cart-icon-wrap">
              <CartIcon />
              {count > 0 ? <span className="badge">{count}</span> : null}
            </span>
            Cart
          </Link>
        </nav>

        <button className="menu-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <MenuIcon />
          <span>Menu</span>
        </button>
      </div>

      <nav className="main-nav" aria-label="Primary">
        <Link className={pathname === "/" ? "is-active" : ""} href="/">
          Home
        </Link>
        <Link className={pathname.startsWith("/promotions") ? "is-active" : ""} href="/promotions">
          Promotions
        </Link>
        <div className="nav-drop">
          <Link className={pathname.startsWith("/shop") ? "is-active" : ""} href="/shop">
            Shop by Product <Caret />
          </Link>
          <div className="drop-panel mega">
            {categories.map((category) => (
              <Link key={category.slug} href={`/shop/${category.slug}`}>
                <strong>{category.name}</strong>
                <span>{category.summary}</span>
              </Link>
            ))}
          </div>
        </div>
        <Link className={pathname.startsWith("/brands") ? "is-active" : ""} href="/brands">
          Shop by Brand
        </Link>
        <div className="nav-drop">
          <Link className={pathname.startsWith("/stores") ? "is-active" : ""} href="/stores">
            Store Locator <Caret />
          </Link>
          <div className="drop-panel">
            <Link href="/stores">Find a branch</Link>
            <Link href="/stores#hours">Branch hours</Link>
          </div>
        </div>
        <div className="nav-drop">
          <Link href="/about">
            Info <Caret />
          </Link>
          <div className="drop-panel">
            {infoLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <Link className={pathname.startsWith("/careers") ? "is-active" : ""} href="/careers">
          Careers
        </Link>
      </nav>

      {searchOpen ? (
        <div className="search-pop">
          <form onSubmit={submitSearch} role="search">
            <label className="sr-only" htmlFor={searchId}>
              Search products
            </label>
            <input
              id={searchId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cable, inverters, boards..."
              autoFocus
            />
            <button className="btn-green" type="submit">
              Search
            </button>
          </form>
          {results.length > 0 ? (
            <ul className="search-results">
              {results.map((product) => (
                <li key={product.slug}>
                  <Link href={`/product/${product.slug}`}>
                    <strong>{product.name}</strong>
                    <span>{formatRand(product.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {locationOpen ? (
        <div className="modal-backdrop" onClick={() => setLocationOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2 id="location-title">Select a branch</h2>
              <button type="button" className="icon-x" onClick={() => setLocationOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <ul className="branch-pick">
              {branches.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.id === branchId ? "is-selected" : ""}
                    onClick={() => {
                      setBranchId(item.id);
                      setLocationOpen(false);
                    }}
                  >
                    <strong>{item.name}</strong>
                    <span>{item.address}</span>
                    <span>{item.hours}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label="Menu" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <strong>Menu</strong>
              <button type="button" className="icon-x" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                ×
              </button>
            </div>
            <div className="drawer-links">
              <Link href="/">Home</Link>
              <Link href="/promotions">Promotions</Link>
              <button type="button" className="drawer-group" onClick={() => setOpenGroup(openGroup === "shop" ? null : "shop")}>
                Shop by Product <Caret />
              </button>
              {openGroup === "shop" ? (
                <div className="drawer-sub">
                  <Link href="/shop">All products</Link>
                  {categories.map((category) => (
                    <Link key={category.slug} href={`/shop/${category.slug}`}>
                      {category.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link href="/brands">Shop by Brand</Link>
              <Link href="/stores">Store Locator</Link>
              <button type="button" className="drawer-group" onClick={() => setOpenGroup(openGroup === "info" ? null : "info")}>
                Info <Caret />
              </button>
              {openGroup === "info" ? (
                <div className="drawer-sub">
                  {infoLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link href="/careers">Careers</Link>
              <Link href="/solar-solutions">Solar Solutions</Link>
              <Link href={user ? "/account" : "/login"}>{user ? "Account" : "Login"}</Link>
              {user ? null : <Link href="/register">Register</Link>}
              <Link href="/cart">Cart{count > 0 ? ` (${count})` : ""}</Link>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 12 8" aria-hidden="true" className="caret">
      <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="promo-icon">
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="17.5" r="1.5" fill="currentColor" />
      <circle cx="17" cy="17.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 19c1.4-3 3.6-4.4 6.5-4.4S17.1 16 18.5 19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function RegisterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 19c1.2-2.8 3-4.2 5.5-4.2 1.4 0 2.6.4 3.6 1.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18 9v6M15 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6h15l-1.4 8.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.5L5 6Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 6 4 3H2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="9" cy="19.5" r="1.3" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
