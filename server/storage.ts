import { 
  users, accounts, categories, transactions, budgets, recurringTransactions,
  type User, type InsertUser, type Account, type InsertAccount,
  type Category, type InsertCategory, type Transaction, type InsertTransaction,
  type Budget, type InsertBudget, type RecurringTransaction, type InsertRecurringTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sum, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Account methods
  getUserAccounts(userId: number): Promise<Account[]>;
  getAccount(id: number, userId: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount & { userId: number }): Promise<Account>;
  updateAccount(id: number, userId: number, account: Partial<InsertAccount>): Promise<Account>;
  deleteAccount(id: number, userId: number): Promise<void>;

  // Category methods
  getUserCategories(userId: number): Promise<Category[]>;
  getCategory(id: number, userId: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory & { userId: number }): Promise<Category>;
  updateCategory(id: number, userId: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number, userId: number): Promise<void>;

  // Transaction methods
  getUserTransactions(userId: number, filters?: {
    accountId?: number;
    categoryId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<(Transaction & { account: Account; category: Category })[]>;
  getTransaction(id: number, userId: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction>;
  updateTransaction(id: number, userId: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number, userId: number): Promise<void>;

  // Budget methods
  getUserBudgets(userId: number, month?: number, year?: number): Promise<(Budget & { category: Category })[]>;
  getBudget(id: number, userId: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget & { userId: number }): Promise<Budget>;
  updateBudget(id: number, userId: number, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: number, userId: number): Promise<void>;

  // Recurring transaction methods
  getUserRecurringTransactions(userId: number): Promise<(RecurringTransaction & { account: Account; category: Category })[]>;
  getRecurringTransaction(id: number, userId: number): Promise<RecurringTransaction | undefined>;
  createRecurringTransaction(recurringTransaction: InsertRecurringTransaction & { userId: number }): Promise<RecurringTransaction>;
  updateRecurringTransaction(id: number, userId: number, recurringTransaction: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction>;
  deleteRecurringTransaction(id: number, userId: number): Promise<void>;
  getRecurringTransactionsDue(): Promise<(RecurringTransaction & { account: Account; category: Category })[]>;

  // Dashboard methods
  getDashboardData(userId: number): Promise<{
    totalBalance: string;
    monthlyIncome: string;
    monthlyExpenses: string;
    recentTransactions: (Transaction & { account: Account; category: Category })[];
    budgetProgress: { category: Category; budget: Budget; spent: string }[];
    accountBalances: Account[];
  }>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();
    return user;
  }

  // Account methods
  async getUserAccounts(userId: number): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async getAccount(id: number, userId: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
    return account || undefined;
  }

  async createAccount(account: InsertAccount & { userId: number }): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  async updateAccount(id: number, userId: number, account: Partial<InsertAccount>): Promise<Account> {
    const [updatedAccount] = await db.update(accounts).set(account).where(and(eq(accounts.id, id), eq(accounts.userId, userId))).returning();
    return updatedAccount;
  }

  async deleteAccount(id: number, userId: number): Promise<void> {
    await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
  }

  // Category methods
  async getUserCategories(userId: number): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getCategory(id: number, userId: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return category || undefined;
  }

  async createCategory(category: InsertCategory & { userId: number }): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, userId: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db.update(categories).set(category).where(and(eq(categories.id, id), eq(categories.userId, userId))).returning();
    return updatedCategory;
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Transaction methods
  async getUserTransactions(userId: number, filters?: {
    accountId?: number;
    categoryId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<(Transaction & { account: Account; category: Category })[]> {
    let query = db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        date: transactions.date,
        description: transactions.description,
        type: transactions.type,
        accountId: transactions.accountId,
        categoryId: transactions.categoryId,
        userId: transactions.userId,
        createdAt: transactions.createdAt,
        account: accounts,
        category: categories,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    if (filters) {
      const conditions = [eq(transactions.userId, userId)];
      
      if (filters.accountId) {
        conditions.push(eq(transactions.accountId, filters.accountId));
      }
      
      if (filters.categoryId) {
        conditions.push(eq(transactions.categoryId, filters.categoryId));
      }
      
      if (filters.startDate) {
        conditions.push(gte(transactions.date, filters.startDate));
      }
      
      if (filters.endDate) {
        conditions.push(lte(transactions.date, filters.endDate));
      }

      // Apply filters after initial query setup
      let filteredQuery = query;
      if (conditions.length > 0) {
        filteredQuery = query.where(and(...conditions));
      }
      return await filteredQuery;
    }

    return await query;
  }

  async getTransaction(id: number, userId: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update account balance
    const amount = parseFloat(newTransaction.amount);
    const balanceChange = newTransaction.type === 'income' ? amount : -amount;
    
    // Get current balance and update
    const [currentAccount] = await db.select().from(accounts).where(eq(accounts.id, newTransaction.accountId));
    const currentBalance = parseFloat(currentAccount.balance);
    await db.update(accounts)
      .set({ balance: (currentBalance + balanceChange).toString() })
      .where(eq(accounts.id, newTransaction.accountId));

    return newTransaction;
  }

  async updateTransaction(id: number, userId: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    // Get the original transaction to revert balance changes
    const original = await this.getTransaction(id, userId);
    if (!original) throw new Error('Transaction not found');

    const [updatedTransaction] = await db.update(transactions)
      .set(transaction)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    // Revert original balance change
    const originalAmount = parseFloat(original.amount);
    const originalBalanceChange = original.type === 'income' ? -originalAmount : originalAmount;
    
    // Get current balance and update
    const [currentAccount] = await db.select().from(accounts).where(eq(accounts.id, original.accountId));
    const currentBalance = parseFloat(currentAccount.balance);
    await db.update(accounts)
      .set({ balance: (currentBalance + originalBalanceChange).toString() })
      .where(eq(accounts.id, original.accountId));

    // Apply new balance change
    const newAmount = parseFloat(updatedTransaction.amount);
    const newBalanceChange = updatedTransaction.type === 'income' ? newAmount : -newAmount;
    
    // Get current balance and update
    const [newAccount] = await db.select().from(accounts).where(eq(accounts.id, updatedTransaction.accountId));
    const newCurrentBalance = parseFloat(newAccount.balance);
    await db.update(accounts)
      .set({ balance: (newCurrentBalance + newBalanceChange).toString() })
      .where(eq(accounts.id, updatedTransaction.accountId));

    return updatedTransaction;
  }

  async deleteTransaction(id: number, userId: number): Promise<void> {
    const transaction = await this.getTransaction(id, userId);
    if (!transaction) throw new Error('Transaction not found');

    // Revert balance change
    const amount = parseFloat(transaction.amount);
    const balanceChange = transaction.type === 'income' ? -amount : amount;
    
    // Get current balance and update
    const [currentAccount] = await db.select().from(accounts).where(eq(accounts.id, transaction.accountId));
    const currentBalance = parseFloat(currentAccount.balance);
    await db.update(accounts)
      .set({ balance: (currentBalance + balanceChange).toString() })
      .where(eq(accounts.id, transaction.accountId));

    await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  }

  // Budget methods
  async getUserBudgets(userId: number, month?: number, year?: number): Promise<(Budget & { category: Category })[]> {
    let query = db
      .select({
        id: budgets.id,
        amount: budgets.amount,
        month: budgets.month,
        year: budgets.year,
        categoryId: budgets.categoryId,
        userId: budgets.userId,
        createdAt: budgets.createdAt,
        category: categories,
      })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.userId, userId));

    if (month !== undefined && year !== undefined) {
      const filteredQuery = db
        .select({
          id: budgets.id,
          amount: budgets.amount,
          month: budgets.month,
          year: budgets.year,
          categoryId: budgets.categoryId,
          userId: budgets.userId,
          createdAt: budgets.createdAt,
          category: categories,
        })
        .from(budgets)
        .innerJoin(categories, eq(budgets.categoryId, categories.id))
        .where(and(eq(budgets.userId, userId), eq(budgets.month, month), eq(budgets.year, year)));
      return await filteredQuery;
    }

    return await query;
  }

  async getBudget(id: number, userId: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
    return budget || undefined;
  }

  async createBudget(budget: InsertBudget & { userId: number }): Promise<Budget> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, userId: number, budget: Partial<InsertBudget>): Promise<Budget> {
    const [updatedBudget] = await db.update(budgets).set(budget).where(and(eq(budgets.id, id), eq(budgets.userId, userId))).returning();
    return updatedBudget;
  }

  async deleteBudget(id: number, userId: number): Promise<void> {
    await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  }

  // Recurring transaction methods
  async getUserRecurringTransactions(userId: number): Promise<(RecurringTransaction & { account: Account; category: Category })[]> {
    return await db
      .select({
        id: recurringTransactions.id,
        amount: recurringTransactions.amount,
        description: recurringTransactions.description,
        type: recurringTransactions.type,
        frequency: recurringTransactions.frequency,
        nextRunDate: recurringTransactions.nextRunDate,
        accountId: recurringTransactions.accountId,
        categoryId: recurringTransactions.categoryId,
        userId: recurringTransactions.userId,
        isActive: recurringTransactions.isActive,
        createdAt: recurringTransactions.createdAt,
        account: accounts,
        category: categories,
      })
      .from(recurringTransactions)
      .innerJoin(accounts, eq(recurringTransactions.accountId, accounts.id))
      .innerJoin(categories, eq(recurringTransactions.categoryId, categories.id))
      .where(eq(recurringTransactions.userId, userId));
  }

  async getRecurringTransaction(id: number, userId: number): Promise<RecurringTransaction | undefined> {
    const [recurringTransaction] = await db.select().from(recurringTransactions).where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, userId)));
    return recurringTransaction || undefined;
  }

  async createRecurringTransaction(recurringTransaction: InsertRecurringTransaction & { userId: number }): Promise<RecurringTransaction> {
    const [newRecurringTransaction] = await db.insert(recurringTransactions).values(recurringTransaction).returning();
    return newRecurringTransaction;
  }

  async updateRecurringTransaction(id: number, userId: number, recurringTransaction: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction> {
    const [updatedRecurringTransaction] = await db.update(recurringTransactions)
      .set(recurringTransaction)
      .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, userId)))
      .returning();
    return updatedRecurringTransaction;
  }

  async deleteRecurringTransaction(id: number, userId: number): Promise<void> {
    await db.delete(recurringTransactions).where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, userId)));
  }

  async getRecurringTransactionsDue(): Promise<(RecurringTransaction & { account: Account; category: Category })[]> {
    const now = new Date();
    return await db
      .select({
        id: recurringTransactions.id,
        amount: recurringTransactions.amount,
        description: recurringTransactions.description,
        type: recurringTransactions.type,
        frequency: recurringTransactions.frequency,
        nextRunDate: recurringTransactions.nextRunDate,
        accountId: recurringTransactions.accountId,
        categoryId: recurringTransactions.categoryId,
        userId: recurringTransactions.userId,
        isActive: recurringTransactions.isActive,
        createdAt: recurringTransactions.createdAt,
        account: accounts,
        category: categories,
      })
      .from(recurringTransactions)
      .innerJoin(accounts, eq(recurringTransactions.accountId, accounts.id))
      .innerJoin(categories, eq(recurringTransactions.categoryId, categories.id))
      .where(and(eq(recurringTransactions.isActive, true), lte(recurringTransactions.nextRunDate, now)));
  }

  // Dashboard methods
  async getDashboardData(userId: number): Promise<{
    totalBalance: string;
    monthlyIncome: string;
    monthlyExpenses: string;
    recentTransactions: (Transaction & { account: Account; category: Category })[];
    budgetProgress: { category: Category; budget: Budget; spent: string }[];
    accountBalances: Account[];
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total balance from all accounts
    const accountsResult = await db.select().from(accounts).where(eq(accounts.userId, userId));
    const totalBalance = accountsResult.reduce((sum, account) => sum + parseFloat(account.balance), 0);

    // Get monthly income and expenses
    const monthlyTransactions = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, startOfMonth),
        lte(transactions.date, endOfMonth)
      ));

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Get recent transactions
    const recentTransactions = await this.getUserTransactions(userId);

    // Get budget progress
    const budgetsWithCategories = await this.getUserBudgets(userId, now.getMonth() + 1, now.getFullYear());
    const budgetProgress = await Promise.all(
      budgetsWithCategories.map(async (budgetWithCategory) => {
        const spent = monthlyTransactions
          .filter(t => t.categoryId === budgetWithCategory.categoryId && t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        return {
          category: budgetWithCategory.category,
          budget: {
            id: budgetWithCategory.id,
            amount: budgetWithCategory.amount,
            month: budgetWithCategory.month,
            year: budgetWithCategory.year,
            categoryId: budgetWithCategory.categoryId,
            userId: budgetWithCategory.userId,
            createdAt: budgetWithCategory.createdAt,
          },
          spent: spent.toFixed(2),
        };
      })
    );

    return {
      totalBalance: totalBalance.toFixed(2),
      monthlyIncome: monthlyIncome.toFixed(2),
      monthlyExpenses: monthlyExpenses.toFixed(2),
      recentTransactions: recentTransactions.slice(0, 5),
      budgetProgress,
      accountBalances: accountsResult,
    };
  }
}

export const storage = new DatabaseStorage();
