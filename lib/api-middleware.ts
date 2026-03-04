/**
 * Middleware de Autenticação e Autorização para API Routes
 * Valida tokens Firebase e permissões em TODOS endpoints críticos
 */

import { Request } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { UserRole } from "@/types/user";

// Inicializar Firebase Admin apenas uma vez
const apps = getApps();
const app = apps.length === 0 ? initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  } as any),
}) : apps[0];

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
}

/**
 * Middleware 1: Valida token Firebase
 * Retorna { userId, userEmail, userRole } ou lança erro 401
 */
export async function verifyToken(req: Request): Promise<{
  userId: string;
  userEmail: string;
  userRole: UserRole;
}> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token não fornecido");
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await getAuth(app).verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email || "";

    // Buscar role do usuário
    const db = getFirestore(app);
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new Error("Usuário não encontrado");
    }

    const userRole = userDoc.data()?.role as UserRole || "user";

    return { userId, userEmail, userRole };
  } catch (error) {
    throw new Error(`Token inválido: ${error}`);
  }
}

/**
 * Middleware 2: Valida permissão do usuário
 */
export function requirePermission(action: "create" | "edit" | "delete" | "admin") {
  return (userRole: UserRole): boolean => {
    if (action === "admin") {
      return userRole === "admin" || userRole === "dev";
    }
    if (action === "create" || action === "edit" || action === "delete") {
      return userRole === "admin" || userRole === "dev";
    }
    return true;
  };
}

/**
 * Middleware 3: Wrap de API Route com validação automática
 */
export function withAuth(handler: (req: Request, context: any) => Promise<Response>) {
  return async (req: Request, context: any) => {
    try {
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 200 });
      }

      // Validar token
      const { userId, userEmail, userRole } = await verifyToken(req);

      // Adicionar ao request (mock, já que não podemos modificar Request)
      (req as any).userId = userId;
      (req as any).userEmail = userEmail;
      (req as any).userRole = userRole;

      return await handler(req, context);
    } catch (error: any) {
      console.error("Auth error:", error);
      return Response.json(
        { error: error.message || "Autenticação falhou" },
        { status: 401 }
      );
    }
  };
}

/**
 * Validar que usuário tem permissão (throw se não tem)
 */
export function assertPermission(
  userRole: UserRole | undefined,
  action: "create" | "edit" | "delete" | "admin"
) {
  if (!userRole) {
    throw new Error("Usuário não autenticado");
  }

  const hasPermission = requirePermission(action)(userRole);
  if (!hasPermission) {
    throw new Error(`Permissão negada: ${action}`);
  }
}

/**
 * Helper para respostas de erro padronizadas
 */
export function errorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Helper para respostas de sucesso padronizadas
 */
export function successResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}
