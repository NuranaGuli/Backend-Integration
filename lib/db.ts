import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const sqliteFilePath = path.join(process.cwd(), "data", "cyberkey.sqlite");
mkdirSync(path.dirname(sqliteFilePath), { recursive: true });

const sqlite = new Database(sqliteFilePath);
export const db = drizzle(sqlite);

export const gameProductsTable = sqliteTable("game_products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  retailPrice: real("retailPrice").notNull(),
  availableKeys: integer("availableKeys").notNull(),
  genre: text("genre").notNull(),
  platform: text("platform").notNull(),
  ageRating: text("ageRating").notNull(),
  publisher: text("publisher").notNull(),
});

export const purchaseOrdersTable = sqliteTable("purchase_orders", {
  id: text("id").primaryKey(),
  gameId: text("gameId").notNull(),
  unitCount: integer("unitCount").notNull(),
  deliveryState: text("deliveryState").notNull(),
  customerId: text("customerId").notNull(),
  grandTotal: real("grandTotal").notNull(),
});

export const playerAccountsTable = sqliteTable("player_accounts", {
  id: text("id").primaryKey(),
  playerEmail: text("playerEmail").notNull().unique(),
  hashedSecurityKey: text("hashedSecurityKey").notNull(),
  accountTier: text("accountTier").notNull(),
});

export interface GameProduct {
  id: string;
  title: string;
  retailPrice: number;
  availableKeys: number;
  genre: string;
  platform: string;
  ageRating: string;
  publisher: string;
}

export interface PurchaseOrder {
  id: string;
  gameId: string;
  unitCount: number;
  deliveryState: string;
  customerId: string;
  grandTotal: number;
}

export interface PlayerAccount {
  id: string;
  playerEmail: string;
  hashedSecurityKey: string;
  accountTier: string;
}

function generateNextId(prefix: string, existingItems: Array<{ id: string }>): string {
  const highestSuffix = existingItems.reduce((max, item) => {
    const match = item.id.match(new RegExp(`^${prefix}(\\d+)$`));
    if (!match) {
      return max;
    }

    const value = Number(match[1]);
    return value > max ? value : max;
  }, 0);

  return `${prefix}${highestSuffix + 1}`;
}

function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS game_products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      retailPrice REAL NOT NULL,
      availableKeys INTEGER NOT NULL,
      genre TEXT NOT NULL,
      platform TEXT NOT NULL,
      ageRating TEXT NOT NULL,
      publisher TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      gameId TEXT NOT NULL,
      unitCount INTEGER NOT NULL,
      deliveryState TEXT NOT NULL,
      customerId TEXT NOT NULL,
      grandTotal REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS player_accounts (
      id TEXT PRIMARY KEY,
      playerEmail TEXT NOT NULL UNIQUE,
      hashedSecurityKey TEXT NOT NULL,
      accountTier TEXT NOT NULL
    );
  `);

  const existingGames = db.select().from(gameProductsTable).all() as GameProduct[];
  if (existingGames.length === 0) {
    db.insert(gameProductsTable)
      .values([
        {
          id: "gp1",
          title: "Cyberpunk 2077 Ultimate Edition",
          retailPrice: 29.99,
          availableKeys: 150,
          genre: "rpg",
          platform: "steam",
          ageRating: "PEGI 18",
          publisher: "CD Projekt RED",
        },
        {
          id: "gp2",
          title: "Elden Ring — Shadow of the Erdtree",
          retailPrice: 34.99,
          availableKeys: 80,
          genre: "action-rpg",
          platform: "steam",
          ageRating: "PEGI 16",
          publisher: "Bandai Namco",
        },
        {
          id: "gp3",
          title: "FIFA 25 Standard Edition",
          retailPrice: 19.99,
          availableKeys: 200,
          genre: "sports",
          platform: "epic",
          ageRating: "PEGI 3",
          publisher: "EA Sports",
        },
        {
          id: "gp4",
          title: "Baldur's Gate 3 Deluxe Edition",
          retailPrice: 44.99,
          availableKeys: 60,
          genre: "rpg",
          platform: "gog",
          ageRating: "PEGI 18",
          publisher: "Larian Studios",
        },
        {
          id: "gp5",
          title: "Counter-Strike 2 — Prime Status",
          retailPrice: 12.99,
          availableKeys: 320,
          genre: "fps",
          platform: "steam",
          ageRating: "PEGI 16",
          publisher: "Valve Corporation",
        },
      ])
      .run();
  }

  const existingOrders = db.select().from(purchaseOrdersTable).all() as PurchaseOrder[];
  if (existingOrders.length === 0) {
    db.insert(purchaseOrdersTable)
      .values([
        {
          id: "po1",
          gameId: "gp1",
          unitCount: 2,
          deliveryState: "pending",
          customerId: "c1",
          grandTotal: 59.98,
        },
        {
          id: "po2",
          gameId: "gp3",
          unitCount: 1,
          deliveryState: "fulfilled",
          customerId: "c2",
          grandTotal: 19.99,
        },
      ])
      .run();
  }

  const existingAccounts = db.select().from(playerAccountsTable).all() as PlayerAccount[];
  if (existingAccounts.length === 0) {
    db.insert(playerAccountsTable)
      .values([
        {
          id: "pa1",
          playerEmail: "admin@cyberkey.gg",
          hashedSecurityKey: "$2b$10$haLKKNd1.WK5GKv43fyK8.4ZDy52aA3J2/ckx0IWPicEnRpTEsG2O",
          accountTier: "admin",
        },
        {
          id: "pa2",
          playerEmail: "seller@cyberkey.gg",
          hashedSecurityKey: "$2b$10$haLKKNd1.WK5GKv43fyK8.4ZDy52aA3J2/ckx0IWPicEnRpTEsG2O",
          accountTier: "seller",
        },
      ])
      .run();
  }
}

initializeDatabase();

export function listGames(): GameProduct[] {
  return db.select().from(gameProductsTable).all() as GameProduct[];
}

export function getGameById(id: string): GameProduct | undefined {
  return db.select().from(gameProductsTable).where(eq(gameProductsTable.id, id)).get() as
    | GameProduct
    | undefined;
}

export function createGame(input: Omit<GameProduct, "id">): GameProduct {
  const existingGames = listGames();
  const newGame: GameProduct = {
    id: generateNextId("gp", existingGames),
    ...input,
  };

  db.insert(gameProductsTable).values(newGame).run();
  return newGame;
}

export function updateGameById(id: string, input: Partial<GameProduct>): GameProduct | undefined {
  const existingGame = getGameById(id);
  if (!existingGame) {
    return undefined;
  }

  const updatedGame = { ...existingGame, ...input };
  db.update(gameProductsTable)
    .set(updatedGame)
    .where(eq(gameProductsTable.id, id))
    .run();

  return updatedGame;
}

export function deleteGameById(id: string): boolean {
  const affectedRows = db.delete(gameProductsTable).where(eq(gameProductsTable.id, id)).run();
  return affectedRows.changes > 0;
}

export function listOrders(): PurchaseOrder[] {
  return db.select().from(purchaseOrdersTable).all() as PurchaseOrder[];
}

export function getOrderById(id: string): PurchaseOrder | undefined {
  return db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, id)).get() as
    | PurchaseOrder
    | undefined;
}

export function createOrder(input: Omit<PurchaseOrder, "id">): PurchaseOrder {
  const existingOrders = listOrders();
  const newOrder: PurchaseOrder = {
    id: generateNextId("po", existingOrders),
    ...input,
  };

  db.insert(purchaseOrdersTable).values(newOrder).run();
  return newOrder;
}

export function updateOrderById(id: string, input: Partial<PurchaseOrder>): PurchaseOrder | undefined {
  const existingOrder = getOrderById(id);
  if (!existingOrder) {
    return undefined;
  }

  const updatedOrder = { ...existingOrder, ...input };
  db.update(purchaseOrdersTable)
    .set(updatedOrder)
    .where(eq(purchaseOrdersTable.id, id))
    .run();

  return updatedOrder;
}

export function deleteOrderById(id: string): boolean {
  const affectedRows = db.delete(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, id)).run();
  return affectedRows.changes > 0;
}

export function getPlayerAccountByEmail(email: string): PlayerAccount | undefined {
  return db.select().from(playerAccountsTable).where(eq(playerAccountsTable.playerEmail, email)).get() as
    | PlayerAccount
    | undefined;
}

export function getPlayerAccountById(id: string): PlayerAccount | undefined {
  return db.select().from(playerAccountsTable).where(eq(playerAccountsTable.id, id)).get() as
    | PlayerAccount
    | undefined;
}

export function createPlayerAccount(input: Omit<PlayerAccount, "id">): PlayerAccount {
  const existingAccounts = db.select().from(playerAccountsTable).all() as PlayerAccount[];
  const newAccount: PlayerAccount = {
    id: generateNextId("pa", existingAccounts),
    ...input,
  };

  db.insert(playerAccountsTable).values(newAccount).run();
  return newAccount;
}
