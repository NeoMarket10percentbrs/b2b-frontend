import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, FileText, LayoutDashboard, Menu, LogOut, Tags } from "lucide-react";
import { Button } from "./components/ui/button";
import { ProductList } from "./components/ProductList";
import { InvoiceList } from "./components/InvoiceList";
import { Dashboard } from "./components/Dashboard";
import { CategoriesList } from "./components/CategoriesList";
import { useAuth } from "./auth/AuthContext";

type View = "dashboard" | "products" | "invoices" | "categories";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Determine current view from pathname
  const getCurrentView = (): View => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path === "/products") return "products";
    if (path === "/categories") return "categories";
    if (path === "/invoices") return "invoices";
    return "dashboard";
  };

  const currentView = getCurrentView();

  const navigation = [
    { id: "dashboard" as View, label: "Обзор", icon: LayoutDashboard, path: "/" },
    { id: "products" as View, label: "Товары", icon: Package, path: "/products" },
    { id: "categories" as View, label: "Категории", icon: Tags, path: "/categories" },
    { id: "invoices" as View, label: "Накладные", icon: FileText, path: "/invoices" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b bg-card">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="tracking-tight">NeoMarket</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 top-16 z-40
            w-64 border-r bg-card transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <nav className="p-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 transition-colors rounded-md
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl">
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "products" && <ProductList />}
          {currentView === "categories" && <CategoriesList />}
          {currentView === "invoices" && <InvoiceList />}
        </main>
      </div>
    </div>
  );
}