import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, X } from "lucide-react";
import { invoicesAPI, skusAPI, productsAPI, InvoiceItemCreate, SKUResponse, ProductShortResponse } from "../../api";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated?: () => void;
}

interface InvoiceItem {
  skuId: string;
  quantity: string;
  sku?: SKUResponse;
  product?: ProductShortResponse;
}

export function InvoiceDialog({ open, onOpenChange, onInvoiceCreated }: InvoiceDialogProps) {
  const [items, setItems] = useState<InvoiceItem[]>([
    { skuId: "", quantity: "" },
  ]);
  const [availableSkus, setAvailableSkus] = useState<SKUResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadAvailableSkus();
    } else {
      // Reset form when dialog closes
      setItems([{ skuId: "", quantity: "" }]);
    }
  }, [open]);

  const loadAvailableSkus = async () => {
    try {
      setLoading(true);
      // Load all products first
      const productsResponse = await productsAPI.getProducts(1000, 0);
      const products = productsResponse.items;

      // Load SKUs for all products
      const skuPromises = products.map(product => skusAPI.getSkusByProduct(product.id));
      const skusArrays = await Promise.all(skuPromises);
      const allSkus = skusArrays.flat();

      setAvailableSkus(allSkus);
    } catch (error) {
      console.error('Failed to load available SKUs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { skuId: "", quantity: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = async (index: number, field: keyof InvoiceItem, value: string) => {
    const updated = [...items];

    if (field === 'skuId') {
      updated[index].skuId = value;

      // If SKU ID changed, load SKU details
      if (value) {
        try {
          const sku = await skusAPI.getSku(value);
          const product = await productsAPI.getProduct(sku.product_id);
          updated[index].sku = sku;
          updated[index].product = product;
        } catch (error) {
          console.error('Failed to load SKU details:', error);
          updated[index].sku = undefined;
          updated[index].product = undefined;
        }
      } else {
        updated[index].sku = undefined;
        updated[index].product = undefined;
      }
    } else if (field === 'quantity') {
      updated[index].quantity = value;
    }

    setItems(updated);
  };

  const handleSubmit = async () => {
    // Validate items
    const validItems = items.filter(item =>
      item.skuId.trim() &&
      item.quantity.trim() &&
      !isNaN(Number(item.quantity)) &&
      Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      alert('Добавьте хотя бы одну позицию с корректными данными');
      return;
    }

    try {
      setSubmitting(true);

      const invoiceItems: InvoiceItemCreate[] = validItems.map(item => ({
        sku_id: item.skuId,
        quantity: Number(item.quantity),
      }));

      await invoicesAPI.createInvoice({ items: invoiceItems });

      onOpenChange(false);
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Не удалось создать накладную');
    } finally {
      setSubmitting(false);
    }
  };

  const getSkuDisplayName = (item: InvoiceItem) => {
    if (item.sku && item.product) {
      return `${item.product.title} - ${item.sku.name}`;
    }
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создать накладную</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Загрузка доступных SKU...</div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Позиции товаров</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm">SKU ID</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={item.skuId}
                          onChange={(e) => updateItem(index, "skuId", e.target.value)}
                        >
                          <option value="">Выберите SKU</option>
                          {availableSkus.map((sku) => (
                            <option key={sku.id} value={sku.id}>
                              {sku.id} - {sku.name} (Остаток: {sku.stock_quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32 space-y-2">
                        <Label className="text-sm">Количество</Label>
                        <Input
                          type="number"
                          placeholder="10"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          min="1"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {item.sku && item.product && (
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {getSkuDisplayName(item)} - Цена: {(item.sku.price / 100).toLocaleString("ru-RU")} ₽
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting ? 'Создание...' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
