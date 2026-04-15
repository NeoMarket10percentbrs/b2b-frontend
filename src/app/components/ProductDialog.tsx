import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SKUList } from "./SKUList";
import { productsAPI, skusAPI, categoriesAPI, ProductResponse, SKUResponse, CategoryResponse } from "../../api";

interface ProductDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated?: () => void;
}

const statusConfig = {
  CREATED: { label: "Создан", variant: "secondary" as const },
  ON_MODERATION: { label: "На модерации", variant: "outline" as const },
  MODERATED: { label: "Опубликован", variant: "default" as const },
  BLOCKED: { label: "Заблокирован", variant: "destructive" as const },
};

export function ProductDialog({ productId, open, onOpenChange, onProductUpdated }: ProductDialogProps) {
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [skus, setSkus] = useState<SKUResponse[]>([]);
  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId && open) {
      loadProductData();
    }
  }, [productId, open]);

  const loadProductData = async () => {
    if (!productId) return;

    try {
      setLoading(true);

      // Load product details
      const productData = await productsAPI.getProduct(productId);
      setProduct(productData);

      // Load category
      const categoryData = await categoriesAPI.getCategory(productData.category_id);
      setCategory(categoryData);

      // Load SKUs
      const skusData = await skusAPI.getSkusByProduct(productId);
      setSkus(skusData);
    } catch (error) {
      console.error('Failed to load product data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!productId || !product) return null;

  const statusInfo = statusConfig[product.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Загрузка...</div>
        ) : (
          <div className="space-y-6">
            {/* Images */}
            {product.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((image) => (
                  <div key={image.id} className="aspect-square bg-muted overflow-hidden border">
                    <ImageWithFallback
                      src={image.url}
                      alt={`${product.title} - ${image.ordering}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="space-y-4">
              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Описание</p>
                  <p>{product.description}</p>
                </div>
              )}

              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Категория</p>
                  <p>{category?.name || 'Неизвестная категория'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Статус</p>
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>

              {product.characteristics.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Характеристики</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.characteristics.map((char) => (
                      <div key={char.id} className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">{char.name}</span>
                        <span>{char.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* SKUs */}
            {productId && <SKUList productId={productId} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
