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
import { categoriesAPI, CategoryResponse } from '../../api';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: () => void;
  editingCategory?: CategoryResponse | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  onCategoryCreated,
  editingCategory,
}: CategoryFormDialogProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        setName(editingCategory.name);
        setParentId(editingCategory.parent_id || '');
      } else {
        setName('');
        setParentId('');
      }
      loadCategories();
    }
    setError('');
  }, [open, editingCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getCategories();
      setCategories(response);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Введите название категории');
      return;
    }

    try {
      setSubmitting(true);

      if (editingCategory) {
        await categoriesAPI.updateCategory(editingCategory.id, {
          name: name.trim(),
          parent_id: parentId || undefined,
        });
      } else {
        await categoriesAPI.createCategory({
          name: name.trim(),
          parent_id: parentId || undefined,
        });
      }

      onOpenChange(false);
      if (onCategoryCreated) {
        onCategoryCreated();
      }
    } catch (err) {
      console.error('Failed to save category:', err);
      setError('Не удалось сохранить категорию');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
          </DialogTitle>
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
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                placeholder="Название категории"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Родительская категория (опционально)</Label>
              <select
                id="parent"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">Нет</option>
                {categories
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
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
