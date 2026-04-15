import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { productsAPI, categoriesAPI, CategoryResponse, ProductShortResponse, ProductResponse } from '../../api';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductShortResponse | null;
  onProductUpdated?: () => void;
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  onProductUpdated,
}: EditProductDialogProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [fullProduct, setFullProduct] = useState<ProductResponse | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && product) {
      loadData();
    }
    setError('');
  }, [open, product]);

  const loadData = async () => {
    if (!product) return;

    try {
      setLoading(true);
      // Load full product data
      const fullProductData = await productsAPI.getProduct(product.id);
      setFullProduct(fullProductData);
      setTitle(fullProductData.title || '');
      setDescription(fullProductData.description || '');
      setCategoryId(fullProductData.category_id || '');

      // Load categories
      const categoriesResponse = await categoriesAPI.getCategories();
      setCategories(categoriesResponse);
    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Не удалось загрузить данные товара');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!title.trim()) {
      setError('Введите название товара');
      return;
    }

    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }

    if (!product) return;

    try {
      setSubmitting(true);
      await productsAPI.updateProduct(product.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId,
      });

      onOpenChange(false);
      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      setError('Не удалось обновить товар');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать товар</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center">Загрузка...</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название товара</Label>
              <Input
                id="title"
                placeholder="Название товара"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание (опционально)</Label>
              <Textarea
                id="description"
                placeholder="Описание товара"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
