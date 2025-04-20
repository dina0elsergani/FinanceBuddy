import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, Filter, Edit, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TransactionForm } from "@/components/forms/transaction-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, Account, Category } from "@shared/schema";

interface TransactionWithDetails extends Transaction {
  account: Account;
  category: Category;
}

export default function TransactionsPage() {
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    accountId: "",
    categoryId: "",
    startDate: "",
    endDate: "",
  });

  // Convert empty strings to "all" for Select components
  const displayFilters = {
    accountId: filters.accountId || "all",
    categoryId: filters.categoryId || "all",
    startDate: filters.startDate,
    endDate: filters.endDate,
  };
  const { toast } = useToast();

  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/transactions?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  const exportCSVMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/transactions/export?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Export failed");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Transactions exported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export transactions",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (transaction: TransactionWithDetails) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    // Convert "all" back to empty string for API calls
    const apiValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: apiValue }));
  };

  const clearFilters = () => {
    setFilters({
      accountId: "",
      categoryId: "",
      startDate: "",
      endDate: "",
    });
  };

  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
  const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  if (transactionsLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header title="Transactions" subtitle="Track your income and expenses" />
        
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Total Income</div>
                <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Total Expenses</div>
                <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-1">Net Income</div>
                <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(totalIncome - totalExpenses).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
                <div className="flex gap-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
                        </DialogTitle>
                      </DialogHeader>
                      <TransactionForm
                        transaction={editingTransaction}
                        onSuccess={handleDialogClose}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    onClick={() => exportCSVMutation.mutate()}
                    disabled={exportCSVMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="account-filter">Account</Label>
                  <Select value={displayFilters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All accounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All accounts</SelectItem>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category-filter">Category</Label>
                  <Select value={displayFilters.categoryId} onValueChange={(value) => handleFilterChange("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Transactions ({transactions?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No transactions found</p>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                      </DialogHeader>
                      <TransactionForm onSuccess={handleDialogClose} />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Account</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Amount</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions?.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm">{transaction.description}</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">{transaction.category.name}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{transaction.account.name}</td>
                          <td className={`py-3 px-4 text-right text-sm font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-1">
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
                                disabled={deleteTransactionMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
