import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SKUFormDialog } from './SKUFormDialog';
import { skusAPI, SKUResponse } from '../../api';

interface SKUListProps {
  productId: string;
}

export function SKUList({ productId }: SKUListProps) {
  const [skus, setSkus] = useState<SKUResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKUResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSkus();
  }, [productId]);

  const loadSkus = async () => {
    try {
      setLoading(true);
      const data = await skusAPI.getSkusByProduct(productId);
      setSkus(data);
    } catch (err) {
      console.error('Failed to load SKUs:', err);
      setError('Не удалось загрузить SKU');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sku: SKUResponse) => {
    setEditingSKU(sku);
    setIsFormOpen(true);
  };

  const handleDelete = async (skuId: string, skuCode: string) => {
    if (confirm(`Удалить SKU "${skuCode}"?`)) {
      try {
        setDeletingId(skuId);
        setError('');
        await skusAPI.deleteSku(skuId);
        setSuccessMessage(`SKU "${skuCode}" успешно удалена`);
        setTimeout(() => setSuccessMessage(''), 3000);
        await loadSkus();
      } catch (err) {
        console.error('Failed to delete SKU:', err);
        setError('Не удалось удалить SKU');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleCreate = () => {
    setEditingSKU(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">SKU варианты</h3>
        <Button size="sm" onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Добавить SKU
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Загрузка...</div>
          ) : skus.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Нет SKU. Добавьте первый SKU для этого товара.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Наличие</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skus.map((sku) => (
                    <TableRow key={sku.id}>
                      <TableCell className="font-medium">{sku.sku}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {sku.name || '-'}
                      </TableCell>
                      <TableCell>{sku.price.toFixed(2)} ₽</TableCell>
                      <TableCell>
                        <span
                          className={
                            sku.stock_quantity > 0
                              ? 'text-green-600'
                              : 'text-destructive'
                          }
                        >
                          {sku.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(sku)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sku.id, sku.sku)}
                            disabled={deletingId === sku.id}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            {deletingId === sku.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SKUFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingSKU(null);
          }
        }}
        productId={productId}
        editingSKU={editingSKU}
        onSkuSaved={loadSkus}
      />
    </div>
  );
}
