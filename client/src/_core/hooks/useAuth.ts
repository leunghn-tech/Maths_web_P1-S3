import { startLogin } from "@/const";
import { firebaseAuth } from "@/lib/firebaseClient";
import { isFirebaseHostingHostname } from "@/lib/firebaseHostingTransition";
import { isFirebaseTeacherEmail } from "@/lib/firebaseTeacherAccess";
import { trpc } from "@/lib/trpc";
import { clearLocalSession } from "@/lib/localSession";
import { TRPCClientError } from "@trpc/client";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = { redirectOnUnauthenticated?: boolean; redirectPath?: string };
type UnifiedUser = {
  id: string | number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: Date | string;
  updatedAt: Date | string;
  lastSignedIn: Date | string;
  localUsername?: string | null;
};

function asFirebaseUser(user: FirebaseUser): UnifiedUser {
  const now = new Date();
  return { id: user.uid, openId: user.uid, name: user.displayName, email: user.email, role: isFirebaseTeacherEmail(user.email) ? "admin" : "user", createdAt: now, updatedAt: now, lastSignedIn: new Date(user.metadata.lastSignInTime || Date.now()), localUsername: null };
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null | undefined>(undefined);
  const firebaseHosting = isFirebaseHostingHostname();
  const utils = trpc.useUtils();

  useEffect(() => onAuthStateChanged(firebaseAuth, setFirebaseUser), []);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !firebaseHosting && firebaseUser !== undefined && firebaseUser === null,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => utils.auth.me.setData(undefined, null) });

  const logout = useCallback(async () => {
    const activeFirebaseUser = firebaseAuth.currentUser;
    try {
      if (activeFirebaseUser) await signOut(firebaseAuth);
      else await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (!(error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED")) throw error;
    } finally {
      try { sessionStorage.removeItem("manus-cookie"); } catch {}
      clearLocalSession();
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    const user = firebaseUser ? asFirebaseUser(firebaseUser) : (meQuery.data as unknown as UnifiedUser | null) ?? null;
    try { localStorage.setItem("manus-runtime-user-info", JSON.stringify(user)); } catch {}
    return {
      user,
      loading: firebaseUser === undefined || (!firebaseHosting && firebaseUser === null && meQuery.isLoading) || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
      isFirebaseUser: Boolean(firebaseUser),
    };
  }, [firebaseHosting, firebaseUser, logoutMutation.error, logoutMutation.isPending, meQuery.data, meQuery.error, meQuery.isLoading]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || state.loading || state.user || typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    if (redirectPath) window.location.href = redirectPath;
    else if (!firebaseHosting) startLogin();
  }, [firebaseHosting, redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return { ...state, refresh: () => meQuery.refetch(), logout };
}
