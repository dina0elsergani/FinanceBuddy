import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag, TrendingUp, TrendingDown } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CategoryForm } from "@/components/forms/category-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/schema";

export default function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (type: string) => {
    return type === 'income' ? 
      <TrendingUp className="text-green-600" /> : 
      <TrendingDown className="text-red-600" />;
  };

  const getBadgeVariant = (type: string) => {
    return type === 'income' ? 'default' : 'secondary';
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const incomeCategories = categories?.filter(c => c.type === 'income') || [];
  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header title="Categories" subtitle="Organize your transactions" />
        
        <div className="p-6 space-y-6">
          {/* Summary Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Income Categories</p>
                    <p className="text-2xl font-bold text-green-600">{incomeCategories.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expense Categories</p>
                    <p className="text-2xl font-bold text-red-600">{expenseCategories.length}</p>
                  </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? "Edit Category" : "Add New Category"}
                      </DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                      category={editingCategory}
                      onSuccess={handleDialogClose}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Income Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Income Categories ({incomeCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomeCategories.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No income categories yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {incomeCategories.map((category) => (
                    <Card key={category.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                              <Tag className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{category.name}</p>
                              <Badge variant={getBadgeVariant(category.type)} size="sm">
                                {category.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              disabled={deleteCategoryMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Expense Categories ({expenseCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenseCategories.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No expense categories yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {expenseCategories.map((category) => (
                    <Card key={category.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                              <Tag className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{category.name}</p>
                              <Badge variant={getBadgeVariant(category.type)} size="sm">
                                {category.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              disabled={deleteCategoryMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Empty State */}
          {categories?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No categories yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create categories to organize your income and expenses.
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm onSuccess={handleDialogClose} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
