"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { terminateActiveSession } from "@/app/actions/authActions";

export interface PlayerProfile {
  accountId: string;
  playerEmail: string;
  accountTier: string;
}

interface PlayerSessionShape {
  currentPlayer: PlayerProfile | null;
  isLoadingSession: boolean;
  mountPlayerSession: (profile: PlayerProfile) => void;
  revokePlayerSession: () => Promise<void>;
  hydratePlayerSession: () => Promise<void>;
}

const PlayerSessionContext = createContext<PlayerSessionShape | null>(null);

export function PlayerSessionProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const mountPlayerSession = (profile: PlayerProfile) => {
    setCurrentPlayer(profile);
    setIsLoadingSession(false);
  };

  const hydratePlayerSession = async () => {
    setIsLoadingSession(true);

    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        setCurrentPlayer(null);
        return;
      }

      const data = (await response.json()) as {
        id: string;
        playerEmail: string;
        accountTier: string;
      };

      setCurrentPlayer({
        accountId: data.id,
        playerEmail: data.playerEmail,
        accountTier: data.accountTier,
      });
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    void hydratePlayerSession();
  }, []);

  const revokePlayerSession = async () => {
    setIsLoadingSession(true);

    try {
      await terminateActiveSession();
      setCurrentPlayer(null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  return (
    <PlayerSessionContext.Provider
      value={{
        currentPlayer,
        isLoadingSession,
        mountPlayerSession,
        hydratePlayerSession,
        revokePlayerSession,
      }}
    >
      {children}
    </PlayerSessionContext.Provider>
  );
}

export const usePlayerSession = () => useContext(PlayerSessionContext);
