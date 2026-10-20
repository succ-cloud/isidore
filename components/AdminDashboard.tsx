"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { useAuth } from "@/context/AuthContext";

type Category = {
  slug: string;
  name: string;
  summary: string;
  layout: string;
  image: string;
  active: boolean;
};

type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  brand: string;
  price: number;
  compareAt?: number;
  sku: string;
  stock: number;
  active: boolean;
  summary: string;
  description: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};

const emptyProduct = {
  name: "",
  brand: "",
  price: "",
  compareAt: "",
  sku: "",
  categorySlug: "",
  stock: "0",
  active: true,
  summary: "",
  description: "",
  image: "",
};

const emptyCategory = { name: "", summary: "", layout: "grid", image: "", active: true };

type View = "dashboard" | "products" | "categories" | "analytics" | "checkouts";
type Overview = {
  products: number;
  activeProducts: number;
  lowStock: number;
  categories: number;
  orders: number;
  openOrders: number;
};

const catalogue: { id: View; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
];

const insights: { id: View; label: string }[] = [
  { id: "analytics", label: "Analytics" },
  { id: "checkouts", label: "Checkouts" },
];

export function AdminDashboard({ name, email }: { name: string; email: string }) {
  const { logout } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [menuOpen, setMenuOpen] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [reassign, setReassign] = useState("");

  async function loadCategories() {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Categories could not be loaded.");
      return;
    }
    setCategories(data.categories);
  }

  async function loadProducts(nextPage = page, nextQuery = query) {
    const response = await fetch(`/api/admin/products?page=${nextPage}&q=${encodeURIComponent(nextQuery)}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Products could not be loaded.");
      return;
    }
    setProducts(data.products);
    setPages(data.pages);
    setPage(data.page);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("isdore-admin-nav");
    if (saved === "open" || saved === "closed") setMenuOpen(saved === "open");
    else if (window.innerWidth <= 900) setMenuOpen(false);
  }, []);

  useEffect(() => {
    void loadCategories();
    void loadProducts(1, "");
    void fetch("/api/admin/overview")
      .then((response) => response.json())
      .then((data) => {
        if (typeof data.products === "number") setOverview(data);
      })
      .catch(() => undefined);
  }, []);

  function openView(next: View) {
    setView(next);
    if (window.innerWidth <= 900) setMenuOpen(false);
  }

  function toggleSidebar() {
    setMenuOpen((open) => {
      const next = !open;
      sessionStorage.setItem("isdore-admin-nav", next ? "open" : "closed");
      return next;
    });
  }

  function show(message: string) {
    setError("");
    setNotice(message);
  }

  async function upload(file: File, assign: (url: string) => void) {
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/admin/images", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "The image was not uploaded.");
      return;
    }
    assign(data.url);
    show("Image uploaded.");
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      name: productForm.name,
      brand: productForm.brand,
      price: Number(productForm.price),
      compareAt: productForm.compareAt,
      sku: productForm.sku,
      categorySlug: productForm.categorySlug,
      stock: Number(productForm.stock),
      active: productForm.active,
      summary: productForm.summary,
      description: productForm.description,
      images: productForm.image ? [productForm.image] : [],
    };
    const response = await fetch(editingProduct ? `/api/admin/products/${editingProduct}` : "/api/admin/products", {
      method: editingProduct ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "The product was not saved.");
      return;
    }
    setProductForm(emptyProduct);
    setEditingProduct(null);
    show(editingProduct ? "Product updated." : "Product added.");
    await loadProducts();
  }

  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(editingCategory ? `/api/admin/categories/${editingCategory}` : "/api/admin/categories", {
      method: editingCategory ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "The category was not saved.");
      return;
    }
    setCategoryForm(emptyCategory);
    setEditingCategory(null);
    show(editingCategory ? "Category updated." : "Category added.");
    await loadCategories();
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/products/${product.slug}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "The product was not deleted.");
      return;
    }
    show("Product deleted.");
    await loadProducts();
  }

  async function removeCategory(category: Category) {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    const response = await fetch(`/api/admin/categories/${category.slug}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reassignTo: reassign }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "The category was not deleted.");
      return;
    }
    show("Category deleted.");
    await loadCategories();
    await loadProducts();
  }

  const stockRate = overview && overview.products > 0 ? Math.round((overview.activeProducts / overview.products) * 100) : 0;
  const title = [...catalogue, ...insights].find((item) => item.id === view)?.label ?? "Dashboard";

  return (
    <div className={`dash${menuOpen ? " is-open" : " is-collapsed"}`}>
      <button className="dash-backdrop" type="button" aria-label="Close navigation" onClick={() => toggleSidebar()} />
      <aside className="dash-side">
        <div className="dash-brand">
          <span className="dash-mark" aria-hidden="true">IS</span>
          <span>
            <strong>Isdore</strong>
            <small>Store dashboard</small>
          </span>
        </div>
        <p className="dash-label">Catalogue</p>
        <nav>
          {catalogue.map((item) => (
            <button key={item.id} className={view === item.id ? "is-active" : ""} type="button" onClick={() => openView(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <p className="dash-label">Insights</p>
        <nav>
          {insights.map((item) => (
            <button key={item.id} className={view === item.id ? "is-active" : ""} type="button" onClick={() => openView(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <p className="dash-label">Store</p>
        <Link href="/">View the shop</Link>
        <button type="button" onClick={() => void logout()}>Log out</button>
      </aside>
      <div className="dash-main">
        <header className="dash-top">
          <button className="dash-menu" type="button" aria-label={menuOpen ? "Hide navigation" : "Show navigation"} aria-expanded={menuOpen} onClick={toggleSidebar}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
          <p>Dashboard <span>/ {title}</span></p>
          <div className="dash-user">
            <span>{name}</span>
            <small>{email}</small>
          </div>
        </header>
        <div className="dash-body">
          {notice ? <p className="form-note">{notice}</p> : null}
          {error ? <p className="form-note is-error">{error}</p> : null}
          {view === "dashboard" ? (
            <>
              <div className="dash-stats">
                <article>
                  <span>Products</span>
                  <strong>{overview?.products ?? "–"}</strong>
                  <small>{overview?.activeProducts ?? 0} in stock</small>
                </article>
                <article>
                  <span>Low stock</span>
                  <strong>{overview?.lowStock ?? "–"}</strong>
                  <small>5 or fewer on hand</small>
                </article>
                <article>
                  <span>Categories</span>
                  <strong>{overview?.categories ?? "–"}</strong>
                  <small>{overview?.orders ?? 0} orders recorded</small>
                </article>
              </div>
              <div className="dash-panels">
                <article className="dash-card">
                  <h2>Catalogue</h2>
                  <p>Products currently available to customers.</p>
                  <div className="dash-figure">
                    <strong>{overview?.activeProducts ?? 0}</strong>
                    <span>in stock</span>
                  </div>
                  <button className="btn-navy" type="button" onClick={() => openView("products")}>Manage products</button>
                </article>
                <article className="dash-card dash-ring-card">
                  <h2>Stock coverage</h2>
                  <div className="dash-ring" style={{ background: `conic-gradient(#99c02f ${stockRate}%, #e6e6ee 0)` }}>
                    <span>{stockRate}%</span>
                  </div>
                  <p>{overview?.openOrders ?? 0} orders are still open.</p>
                </article>
              </div>
            </>
          ) : null}
          {view === "products" ? (
        <div className="admin-grid">
          <form className="form-card admin-card" onSubmit={saveProduct}>
            <h2>{editingProduct ? "Edit product" : "Add product"}</h2>
            <label>
              Name
              <input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required />
            </label>
            <label>
              Category
              <select value={productForm.categorySlug} onChange={(event) => setProductForm({ ...productForm, categorySlug: event.target.value })} required>
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Brand
              <input value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} />
            </label>
            <label>
              Price (R)
              <input type="number" min={0} step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required />
            </label>
            <label>
              Compare price (R)
              <input type="number" min={0} step="0.01" value={productForm.compareAt} onChange={(event) => setProductForm({ ...productForm, compareAt: event.target.value })} />
            </label>
            <label>
              SKU
              <input value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} />
            </label>
            <label>
              Stock
              <input type="number" min={0} step={1} value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} required />
            </label>
            <label>
              Short description
              <textarea value={productForm.summary} onChange={(event) => setProductForm({ ...productForm, summary: event.target.value })} />
            </label>
            <label>
              Description
              <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} />
            </label>
            <label>
              Image
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, (url) => setProductForm({ ...productForm, image: url })); }} />
            </label>
            {productForm.image ? <img className="admin-preview" src={productForm.image} alt="" /> : null}
            <label className="check">
              <input type="checkbox" checked={productForm.active} onChange={(event) => setProductForm({ ...productForm, active: event.target.checked })} />
              Active on the storefront
            </label>
            <button className="btn-green" type="submit">{editingProduct ? "Save product" : "Add product"}</button>
            {editingProduct ? (
              <button className="text-button" type="button" onClick={() => { setEditingProduct(null); setProductForm(emptyProduct); }}>
                Cancel edit
              </button>
            ) : null}
          </form>
          <div className="admin-card">
            <form
              className="admin-search"
              onSubmit={(event) => {
                event.preventDefault();
                void loadProducts(1, query);
              }}
            >
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" />
              <button className="btn-navy" type="submit">Search</button>
            </form>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.slug}>
                      <td>
                        <strong>{product.name}</strong>
                        <span>{product.sku || product.slug}</span>
                      </td>
                      <td>R {product.price}</td>
                      <td>{product.stock}</td>
                      <td>{product.active ? "Active" : "Hidden"}</td>
                      <td className="admin-actions">
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => {
                            setEditingProduct(product.slug);
                            setProductForm({
                              name: product.name,
                              brand: product.brand || "",
                              price: String(product.price),
                              compareAt: product.compareAt ? String(product.compareAt) : "",
                              sku: product.sku || "",
                              categorySlug: product.categorySlug,
                              stock: String(product.stock ?? 0),
                              active: product.active !== false,
                              summary: product.summary || "",
                              description: product.description || "",
                              image: product.images?.[0] || "",
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button className="text-button" type="button" onClick={() => void removeProduct(product)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-pager">
              <button className="text-button" type="button" disabled={page <= 1} onClick={() => void loadProducts(page - 1)}>Previous</button>
              <span>Page {page} of {pages}</span>
              <button className="text-button" type="button" disabled={page >= pages} onClick={() => void loadProducts(page + 1)}>Next</button>
            </div>
          </div>
        </div>
      ) : null}
          {view === "analytics" ? <AdminAnalytics mode="analytics" /> : null}
          {view === "checkouts" ? <AdminAnalytics mode="checkouts" /> : null}
          {view === "categories" ? (
        <div className="admin-grid">
          <form className="form-card admin-card" onSubmit={saveCategory}>
            <h2>{editingCategory ? "Edit category" : "Add category"}</h2>
            <label>
              Name
              <input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required />
            </label>
            <label>
              Description
              <textarea value={categoryForm.summary} onChange={(event) => setCategoryForm({ ...categoryForm, summary: event.target.value })} />
            </label>
            <label>
              Storefront layout
              <select value={categoryForm.layout} onChange={(event) => setCategoryForm({ ...categoryForm, layout: event.target.value })}>
                <option value="grid">Grid</option>
                <option value="stack">Stack</option>
                <option value="reel">Reel</option>
                <option value="panel">Panel</option>
              </select>
            </label>
            <label>
              Image
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, (url) => setCategoryForm({ ...categoryForm, image: url })); }} />
            </label>
            {categoryForm.image ? <img className="admin-preview" src={categoryForm.image} alt="" /> : null}
            <label className="check">
              <input type="checkbox" checked={categoryForm.active} onChange={(event) => setCategoryForm({ ...categoryForm, active: event.target.checked })} />
              Show on the storefront
            </label>
            <button className="btn-green" type="submit">{editingCategory ? "Save category" : "Add category"}</button>
          </form>
          <div className="admin-card">
            <label>
              When deleting a category that still has products, move them to
              <select value={reassign} onChange={(event) => setReassign(event.target.value)}>
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </label>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Layout</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.slug}>
                      <td>
                        <strong>{category.name}</strong>
                        <span>{category.summary}</span>
                      </td>
                      <td>{category.layout}</td>
                      <td>{category.active ? "Visible" : "Hidden"}</td>
                      <td className="admin-actions">
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => {
                            setEditingCategory(category.slug);
                            setCategoryForm({
                              name: category.name,
                              summary: category.summary || "",
                              layout: category.layout || "grid",
                              image: category.image || "",
                              active: category.active !== false,
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button className="text-button" type="button" onClick={() => void removeCategory(category)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
