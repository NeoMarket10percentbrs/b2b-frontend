import { useState, useEffect } from 'react';
import { Tags, Plus, ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CategoryFormDialog } from './CategoryFormDialog';
import { categoriesAPI, CategoryResponse } from '../../api';

interface CategoryWithChildren extends CategoryResponse {
  children: CategoryWithChildren[];
  isExpanded?: boolean;
}

export function CategoriesList() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const rootCategories = await categoriesAPI.getCategories(undefined, true);

      const categoriesWithChildren = await Promise.all(
        rootCategories.map(async (cat) => await loadCategoryWithChildren(cat))
      );

      setCategories(categoriesWithChildren);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryWithChildren = async (
    category: CategoryResponse
  ): Promise<CategoryWithChildren> => {
    try {
      const categoryData = await categoriesAPI.getCategory(category.id);
      return {
        ...category,
        children: categoryData.children || [],
      };
    } catch (error) {
      return {
        ...category,
        children: [],
      };
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedIds(newExpanded);
  };

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    setIsFormDialogOpen(true);
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (
      confirm(
        `Вы уверены, что хотите удалить категорию "${categoryName}"? Если у нее есть подкатегории, они также будут удалены.`
      )
    ) {
      try {
        setDeleteLoading(categoryId);
        setError('');
        await categoriesAPI.deleteCategory(categoryId);
        setSuccessMessage(`Категория "${categoryName}" успешно удалена`);
        setTimeout(() => setSuccessMessage(''), 3000);
        await loadCategories();
      } catch (err) {
        console.error('Failed to delete category:', err);
        setError(`Не удалось удалить категорию "${categoryName}". Попробуйте еще раз.`);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CategoryRow = ({ category, level = 0 }: { category: CategoryWithChildren; level?: number }) => {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id}>
        <div
          className="flex items-center gap-2 p-3 hover:bg-muted rounded-md group"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5 p-0"
              onClick={() => toggleExpanded(category.id)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-5" />}

          <div className="flex-1">
            <p className="font-medium">{category.name}</p>
            {category.children && category.children.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {category.children.length} подкатегор{category.children.length % 10 === 1 ? 'ия' : 'ий'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(category)}
              className="h-8 w-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(category.id, category.name)}
              disabled={deleteLoading === category.id}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              {deleteLoading === category.id ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children.map((child) => (
              <CategoryRow key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-3">
          <Tags className="w-6 h-6" />
          <h2>Категории</h2>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsFormDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить категорию
        </Button>
      </div>

      <div className="relative">
        <Input
          placeholder="Поиск категорий..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-4"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Всего категорий: {categories.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Загрузка...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery ? 'Категории не найдены' : 'Нет категорий'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={isFormDialogOpen}
        onOpenChange={(open) => {
          setIsFormDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
        onCategoryCreated={loadCategories}
        editingCategory={editingCategory}
      />
    </div>
  );
}
