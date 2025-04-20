import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Play, Repeat } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RecurringForm } from "@/components/forms/recurring-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Account, Category } from "@shared/schema";

interface RecurringTransactionWithDetails {
  id: number;
  amount: string;
  description: string;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly";
  nextRunDate: string;
  accountId: number;
  categoryId: number;
  isActive: boolean;
  account: Account;
  category: Category;
}

export default function RecurringPage() {
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransactionWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: recurringTransactions, isLoading } = useQuery<RecurringTransactionWithDetails[]>({
    queryKey: ["/api/recurring-transactions"],
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/recurring-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-transactions"] });
      toast({
        title: "Success",
        description: "Recurring transaction deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recurring transaction",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/recurring-transactions/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-transactions"] });
      toast({
        title: "Success",
        description: "Recurring transaction updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update recurring transaction",
        variant: "destructive",
      });
    },
  });

  const generateRecurringMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/recurring-transactions/generate");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: `Generated ${data.generated} recurring transactions`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recurring transactions",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (transaction: RecurringTransactionWithDetails) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this recurring transaction?")) {
      deleteRecurringMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: number, currentActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentActive });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  const activeTransactions = recurringTransactions?.filter(t => t.isActive) || [];
  const inactiveTransactions = recurringTransactions?.filter(t => !t.isActive) || [];

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading recurring transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header title="Recurring Transactions" subtitle="Automate your regular payments" />
        
        <div className="p-6 space-y-6">
          {/* Actions Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Recurring</p>
                    <p className="text-2xl font-bold text-green-600">{activeTransactions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Inactive Recurring</p>
                    <p className="text-2xl font-bold text-muted-foreground">{inactiveTransactions.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => generateRecurringMutation.mutate()}
                    disabled={generateRecurringMutation.isPending}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Generate Due
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Recurring
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTransaction ? "Edit Recurring Transaction" : "Add New Recurring Transaction"}
                        </DialogTitle>
                      </DialogHeader>
                      <RecurringForm
                        recurringTransaction={editingTransaction}
                        onSuccess={handleDialogClose}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Recurring Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-green-600" />
                Active Recurring Transactions ({activeTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTransactions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No active recurring transactions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          <Repeat className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{transaction.category.name}</Badge>
                            <Badge variant="outline">{transaction.frequency}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Next: {new Date(transaction.nextRunDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">{transaction.account.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={transaction.isActive}
                          onCheckedChange={() => handleToggleActive(transaction.id, transaction.isActive)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          disabled={deleteRecurringMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inactive Recurring Transactions */}
          {inactiveTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-muted-foreground" />
                  Inactive Recurring Transactions ({inactiveTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inactiveTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted rounded-lg opacity-60">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                          <Repeat className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{transaction.category.name}</Badge>
                            <Badge variant="outline">{transaction.frequency}</Badge>
                            <span className="text-sm text-muted-foreground">Inactive</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-muted-foreground">
                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">{transaction.account.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={transaction.isActive}
                          onCheckedChange={() => handleToggleActive(transaction.id, transaction.isActive)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          disabled={deleteRecurringMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {recurringTransactions?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Repeat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No recurring transactions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Set up recurring transactions to automate your regular payments and income.
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Recurring Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Recurring Transaction</DialogTitle>
                    </DialogHeader>
                    <RecurringForm onSuccess={handleDialogClose} />
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
