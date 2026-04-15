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
import { Plus, X } from 'lucide-react';
import { productsAPI, categoriesAPI, uploadAPI, CategoryResponse, ProductImageCreate, ProductCharacteristicCreate } from '../../api';

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated?: () => void;
}

interface FormImage {
  id: string;
  url: string;
  ordering: number;
  isNew: boolean;
  file?: File;
}

interface FormCharacteristic {
  id: string;
  name: string;
  value: string;
}

export function CreateProductDialog({ open, onOpenChange, onProductCreated }: CreateProductDialogProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<FormImage[]>([]);
  const [characteristics, setCharacteristics] = useState<FormCharacteristic[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadCategories();
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId('');
      setImages([]);
      setCharacteristics([]);
      setError('');
    }
  }, [open]);

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

  const addImage = () => {
    setImages([
      ...images,
      {
        id: `img-${Date.now()}`,
        url: '',
        ordering: images.length,
        isNew: true,
      },
    ]);
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const updateImage = (id: string, field: keyof FormImage, value: any) => {
    setImages(images.map(img =>
      img.id === id ? { ...img, [field]: value } : img
    ));
  };

  const handleImageFileChange = async (id: string, file: File) => {
    try {
      // Upload image to server
      const response = await uploadAPI.uploadImage(file);
      updateImage(id, 'url', response.url);
      updateImage(id, 'file', file);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Не удалось загрузить изображение');
    }
  };

  const addCharacteristic = () => {
    setCharacteristics([
      ...characteristics,
      {
        id: `char-${Date.now()}`,
        name: '',
        value: '',
      },
    ]);
  };

  const removeCharacteristic = (id: string) => {
    setCharacteristics(characteristics.filter(char => char.id !== id));
  };

  const updateCharacteristic = (id: string, field: 'name' | 'value', value: string) => {
    setCharacteristics(characteristics.map(char =>
      char.id === id ? { ...char, [field]: value } : char
    ));
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Введите название товара');
      return;
    }

    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }

    try {
      setSubmitting(true);

      const productImages: ProductImageCreate[] = images
        .filter(img => img.url.trim())
        .map(img => ({
          url: img.url,
          ordering: img.ordering,
        }));

      const productCharacteristics: ProductCharacteristicCreate[] = characteristics
        .filter(char => char.name.trim() && char.value.trim())
        .map(char => ({
          name: char.name,
          value: char.value,
        }));

      await productsAPI.createProduct({
        category_id: categoryId,
        title: title.trim(),
        description: description.trim() || undefined,
        images: productImages,
        characteristics: productCharacteristics,
      });

      onOpenChange(false);
      if (onProductCreated) {
        onProductCreated();
      }
    } catch (err) {
      console.error('Failed to create product:', err);
      setError('Не удалось создать товар');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить новый товар</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center">Загрузка категорий...</div>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Название товара</Label>
              <Input
                id="title"
                placeholder="iPhone 15 Pro Max"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category */}
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Подробное описание товара..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Изображения</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImage}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-3">
                {images.map((image, index) => (
                  <div key={image.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm">URL изображения</Label>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={image.url}
                          onChange={(e) => updateImage(image.id, 'url', e.target.value)}
                        />
                      </div>
                      <div className="w-20 space-y-2">
                        <Label className="text-sm">Порядок</Label>
                        <Input
                          type="number"
                          value={image.ordering}
                          onChange={(e) => updateImage(image.id, 'ordering', parseInt(e.target.value))}
                          min="0"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">или загрузить файл</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageFileChange(image.id, file);
                          }
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Characteristics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Характеристики</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCharacteristic}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-3">
                {characteristics.map((char) => (
                  <div key={char.id} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm">Название</Label>
                      <Input
                        placeholder="Бренд"
                        value={char.name}
                        onChange={(e) => updateCharacteristic(char.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm">Значение</Label>
                      <Input
                        placeholder="Apple"
                        value={char.value}
                        onChange={(e) => updateCharacteristic(char.id, 'value', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCharacteristic(char.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
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
            {submitting ? 'Создание...' : 'Создать товар'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
