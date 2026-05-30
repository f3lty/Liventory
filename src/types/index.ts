import { Inventory, Location, InventoryTransaction, AiInsight } from "@prisma/client";

export type InventoryWithLocation = Inventory & {
  location: Location | null;
};

export type TransactionWithDetails = InventoryTransaction & {
  inventory: Inventory;
  fromLocation: Location | null;
};

export type DashboardStats = {
  totalPlants: number;
  totalValue: number;
  lowStockCount: number;
  locationsCount: number;
  recentTransactions: TransactionWithDetails[];
  topInventory: InventoryWithLocation[];
  lowStockItems: InventoryWithLocation[];
  inventoryByLocation: { location: string; count: number }[];
  valueByCategory: { category: string; value: number }[];
};

export type ImportRow = {
  plantName: string;
  botanicalName?: string;
  cultivar?: string;
  containerSize?: string;
  quantityAvailable?: number;
  quantityReserved?: number;
  quantitySold?: number;
  location?: string;
  propagationMethod?: string;
  costPerUnit?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  category?: string;
  notes?: string;
};

export type CsvMapping = {
  [key: string]: string;
};
