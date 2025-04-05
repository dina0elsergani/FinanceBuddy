import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertAccountSchema, insertCategorySchema, insertTransactionSchema,
  insertBudgetSchema, insertRecurringTransactionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Helper middleware to ensure user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Account routes
  app.get("/api/accounts", requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getUserAccounts(req.user!.id);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", requireAuth, async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount({ ...validatedData, userId: req.user!.id });
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  app.put("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, req.user!.id, validatedData);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAccount(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete account" });
    }
  });

  // Category routes
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getUserCategories(req.user!.id);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory({ ...validatedData, userId: req.user!.id });
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, req.user!.id, validatedData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete category" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const filters = {
        accountId: req.query.accountId ? parseInt(req.query.accountId as string) : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };
      const transactions = await storage.getUserTransactions(req.user!.id, filters);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({ ...validatedData, userId: req.user!.id });
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, req.user!.id, validatedData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete transaction" });
    }
  });

  // Budget routes
  app.get("/api/budgets", requireAuth, async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const budgets = await storage.getUserBudgets(req.user!.id, month, year);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget({ ...validatedData, userId: req.user!.id });
      res.status(201).json(budget);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget data" });
    }
  });

  app.put("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, req.user!.id, validatedData);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBudget(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete budget" });
    }
  });

  // Recurring transaction routes
  app.get("/api/recurring-transactions", requireAuth, async (req, res) => {
    try {
      const recurringTransactions = await storage.getUserRecurringTransactions(req.user!.id);
      res.json(recurringTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring transactions" });
    }
  });

  app.post("/api/recurring-transactions", requireAuth, async (req, res) => {
    try {
      const validatedData = insertRecurringTransactionSchema.parse(req.body);
      const recurringTransaction = await storage.createRecurringTransaction({ ...validatedData, userId: req.user!.id });
      res.status(201).json(recurringTransaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid recurring transaction data" });
    }
  });

  app.put("/api/recurring-transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRecurringTransactionSchema.partial().parse(req.body);
      const recurringTransaction = await storage.updateRecurringTransaction(id, req.user!.id, validatedData);
      res.json(recurringTransaction);
    } catch (error) {
      res.status(400).json({ message: "Failed to update recurring transaction" });
    }
  });

  app.delete("/api/recurring-transactions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRecurringTransaction(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete recurring transaction" });
    }
  });

  // Generate recurring transactions
  app.post("/api/recurring-transactions/generate", requireAuth, async (req, res) => {
    try {
      const dueTransactions = await storage.getRecurringTransactionsDue();
      const generatedTransactions = [];

      for (const recurringTransaction of dueTransactions) {
        // Create the transaction
        const transaction = await storage.createTransaction({
          amount: recurringTransaction.amount,
          date: new Date(),
          description: recurringTransaction.description,
          type: recurringTransaction.type,
          accountId: recurringTransaction.accountId,
          categoryId: recurringTransaction.categoryId,
          userId: recurringTransaction.userId,
        });

        // Update next run date based on frequency
        let nextRunDate = new Date(recurringTransaction.nextRunDate);
        switch (recurringTransaction.frequency) {
          case 'daily':
            nextRunDate.setDate(nextRunDate.getDate() + 1);
            break;
          case 'weekly':
            nextRunDate.setDate(nextRunDate.getDate() + 7);
            break;
          case 'monthly':
            nextRunDate.setMonth(nextRunDate.getMonth() + 1);
            break;
        }

        await storage.updateRecurringTransaction(recurringTransaction.id, recurringTransaction.userId, {
          nextRunDate,
        });

        generatedTransactions.push(transaction);
      }

      res.json({ generated: generatedTransactions.length, transactions: generatedTransactions });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recurring transactions" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
      const dashboardData = await storage.getDashboardData(req.user!.id);
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // CSV export for transactions
  app.get("/api/transactions/export", requireAuth, async (req, res) => {
    try {
      const filters = {
        accountId: req.query.accountId ? parseInt(req.query.accountId as string) : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };
      const transactions = await storage.getUserTransactions(req.user!.id, filters);
      
      // Generate CSV
      const csvHeader = "Date,Description,Category,Account,Type,Amount\n";
      const csvRows = transactions.map(t => 
        `${t.date.toISOString().split('T')[0]},${t.description},${t.category.name},${t.account.name},${t.type},${t.amount}`
      ).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
