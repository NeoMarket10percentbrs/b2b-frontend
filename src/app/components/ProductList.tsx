import { useState, useEffect } from "react";
import { Package, Plus, Search, Eye, Trash2, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ProductDialog } from "./ProductDialog";
import { CreateProductDialog } from "./CreateProductDialog";
import { EditProductDialog } from "./EditProductDialog";
import { productsAPI, skusAPI, categoriesAPI, ProductShortResponse, CategoryResponse } from "../../api";

interface ProductWithDetails extends ProductShortResponse {
  categoryName: string;
  skuCount: number;
  totalQuantity: number;
}

const statusConfig = {
  CREATED: { label: "Создан", variant: "secondary" as const },
  ON_MODERATION: { label: "На модерации", variant: "outline" as const },
  MODERATED: { label: "Опубликован", variant: "default" as const },
  BLOCKED: { label: "Заблокирован", variant: "destructive" as const },
};

export function ProductList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductShortResponse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load categories for mapping
      const categoriesResponse = await categoriesAPI.getCategories();
      setCategories(categoriesResponse);

      // Load products
      const productsResponse = await productsAPI.getMyProducts(100, 0);
      const productsData = productsResponse.items;

      // Load SKUs for each product to calculate counts
      const productsWithDetails: ProductWithDetails[] = await Promise.all(
        productsData.map(async (product) => {
          try {
            const skus = await skusAPI.getSkusByProduct(product.id);
            const totalQuantity = skus.reduce((sum, sku) => sum + sku.stock_quantity, 0);
            const category = categoriesResponse.find(cat => cat.id === product.category_id);

            return {
              ...product,
              categoryName: category?.name || 'Неизвестная категория',
              skuCount: skus.length,
              totalQuantity,
            };
          } catch (error) {
            console.error(`Failed to load SKUs for product ${product.id}:`, error);
            return {
              ...product,
              categoryName: 'Неизвестная категория',
              skuCount: 0,
              totalQuantity: 0,
            };
          }
        })
      );

      setProducts(productsWithDetails);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await productsAPI.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Не удалось удалить товар');
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <h2>Товары</h2>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Добавить товар
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Остаток</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {searchQuery ? 'Товары не найдены' : 'Нет товаров'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const statusInfo = statusConfig[product.status];
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.categoryName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.skuCount}</TableCell>
                    <TableCell>{product.totalQuantity}</TableCell>
                    <TableCell className="relative z-10">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduct(product.id);
                            setIsViewDialogOpen(true);
                          }}
                          title="Просмотреть"
                          className="h-8 w-8"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsEditDialogOpen(true);
                          }}
                          title="Редактировать"
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Удалить"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Dialog for viewing products */}
      <ProductDialog
        productId={selectedProduct}
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setSelectedProduct(null);
          }
        }}
        onProductUpdated={loadData}
      />

      {/* Dialog for creating products */}
      <CreateProductDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProductCreated={loadData}
      />

      {/* Dialog for editing products */}
      <EditProductDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
          }
        }}
        product={editingProduct}
        onProductUpdated={loadData}
      />
    </div>
  );
}