import { useState, useEffect } from "react";
import { Package, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { productsAPI, skusAPI, invoicesAPI } from "../../api";

interface DashboardStats {
  totalProducts: number;
  onModerationProducts: number;
  totalSkus: number;
  outOfStockSkus: number;
  totalStock: number;
  pendingInvoices: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    onModerationProducts: 0,
    totalSkus: 0,
    outOfStockSkus: 0,
    totalStock: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Load products
      const productsResponse = await productsAPI.getMyProducts(1000, 0);
      const products = productsResponse.items;

      // Load all SKUs for all products
      const skuPromises = products.map(product => skusAPI.getSkusByProduct(product.id));
      const skusArrays = await Promise.all(skuPromises);
      const allSkus = skusArrays.flat();

      // Load invoices
      const invoicesResponse = await invoicesAPI.getInvoices(1000, 0);
      const invoices = invoicesResponse.items;

      // Calculate stats
      const totalProducts = products.length;
      const onModerationProducts = products.filter(p => p.status === 'ON_MODERATION').length;
      const totalSkus = allSkus.length;
      const outOfStockSkus = allSkus.filter(sku => sku.stock_quantity === 0).length;
      const totalStock = allSkus.reduce((sum, sku) => sum + sku.stock_quantity, 0);
      const pendingInvoices = invoices.filter(inv => inv.status === 'CREATED').length;

      setStats({
        totalProducts,
        onModerationProducts,
        totalSkus,
        outOfStockSkus,
        totalStock,
        pendingInvoices,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Всего товаров",
      value: loading ? "..." : stats.totalProducts.toString(),
      icon: Package,
      description: loading ? "Загрузка..." : `${stats.onModerationProducts} на модерации`,
    },
    {
      title: "SKU",
      value: loading ? "..." : stats.totalSkus.toString(),
      icon: ShoppingCart,
      description: loading ? "Загрузка..." : `${stats.outOfStockSkus} нет в наличии`,
    },
    {
      title: "Общий остаток",
      value: loading ? "..." : stats.totalStock.toString(),
      icon: TrendingUp,
      description: "шт на складе",
    },
    {
      title: "Ожидают принятия",
      value: loading ? "..." : stats.pendingInvoices.toString(),
      icon: AlertCircle,
      description: "накладные",
    },
  ];

  return (
    <div className="space-y-6">
      <h2>Обзор</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-3xl">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}