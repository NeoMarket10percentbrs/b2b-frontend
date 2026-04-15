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
import { skusAPI, SKUResponse } from '../../api';

interface SKUFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  editingSKU?: SKUResponse | null;
  onSkuSaved?: () => void;
}

export function SKUFormDialog({
  open,
  onOpenChange,
  productId,
  editingSKU,
  onSkuSaved,
}: SKUFormDialogProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [characteristics, setCharacteristics] = useState<Array<{ name: string; value: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editingSKU) {
        setSku(editingSKU.sku || '');
        setName(editingSKU.name || '');
        setPrice(editingSKU.price.toString());
        setQuantity(editingSKU.stock_quantity.toString());
        setDescription(editingSKU.description || '');
        setCharacteristics(editingSKU.characteristics || []);
      } else {
        setSku('');
        setName('');
        setPrice('');
        setQuantity('');
        setDescription('');
        setCharacteristics([]);
      }
      setError('');
    }
  }, [open, editingSKU]);

  const handleAddCharacteristic = () => {
    setCharacteristics([...characteristics, { name: '', value: '' }]);
  };

  const handleRemoveCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const handleCharacteristicChange = (
    index: number,
    field: 'name' | 'value',
    value: string
  ) => {
    const updated = [...characteristics];
    updated[index] = { ...updated[index], [field]: value };
    setCharacteristics(updated);
  };

  const handleSubmit = async () => {
    setError('');

    if (!sku.trim()) {
      setError('Введите SKU');
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setError('Введите корректную цену');
      return;
    }

    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
      setError('Введите корректное количество');
      return;
    }

    try {
      setSubmitting(true);

      const skuData = {
        product_id: productId,
        sku: sku.trim(),
        name: name.trim() || undefined,
        price: parseFloat(price),
        stock_quantity: parseInt(quantity),
        description: description.trim() || undefined,
        characteristics: characteristics.filter(c => c.name.trim() || c.value.trim()),
      };

      if (editingSKU) {
        await skusAPI.updateSku(editingSKU.id, skuData);
      } else {
        await skusAPI.createSku(skuData);
      }

      onOpenChange(false);
      if (onSkuSaved) {
        onSkuSaved();
      }
    } catch (err) {
      console.error('Failed to save SKU:', err);
      setError('Не удалось сохранить SKU');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSKU ? 'Редактировать SKU' : 'Создать SKU'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (обязательно)</Label>
              <Input
                id="sku"
                placeholder="SKU код"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Название (опционально)</Label>
              <Input
                id="name"
                placeholder="Название варианта"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Количество в наличии</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (опционально)</Label>
            <Textarea
              id="description"
              placeholder="Описание SKU"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Характеристики (опционально)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCharacteristic}
              >
                + Добавить
              </Button>
            </div>

            {characteristics.map((char, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Название"
                  value={char.name}
                  onChange={(e) =>
                    handleCharacteristicChange(index, 'name', e.target.value)
                  }
                />
                <Input
                  placeholder="Значение"
                  value={char.value}
                  onChange={(e) =>
                    handleCharacteristicChange(index, 'value', e.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveCharacteristic(index)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
