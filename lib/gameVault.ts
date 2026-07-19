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

declare global {
  var _gameProducts: GameProduct[];
  var _purchaseOrders: PurchaseOrder[];
  var _playerAccounts: PlayerAccount[];
}

export const gameProducts: GameProduct[] =
  global._gameProducts ??
  (global._gameProducts = [
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
  ]);

export const purchaseOrders: PurchaseOrder[] =
  global._purchaseOrders ??
  (global._purchaseOrders = [
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
    {
      id: "po3",
      gameId: "gp5",
      unitCount: 3,
      deliveryState: "processing",
      customerId: "c3",
      grandTotal: 38.97,
    },
    {
      id: "po4",
      gameId: "gp2",
      unitCount: 1,
      deliveryState: "refunded",
      customerId: "c1",
      grandTotal: 34.99,
    },
  ]);


export const playerAccounts: PlayerAccount[] =
  global._playerAccounts ??
  (global._playerAccounts = [
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
  ]);
