import { getFirestore } from "firebase-admin/firestore";
import { getApps } from "firebase-admin/app";
import { verifyToken, assertPermission, errorResponse, successResponse } from "@/lib/api-middleware";

/**
 * POST /api/promote-admin
 * Promove um usuário para admin
 *
 * Segurança:
 * - Apenas admin/dev podem executar
 * - Token Firebase obrigatório
 * - Email do usuário a promover é validado
 * - Registra em logs
 */
export async function POST(req: Request) {
  try {
    // 1. Validar token e permissões
    const { userId, userEmail, userRole } = await verifyToken(req);
    assertPermission(userRole, "admin");

    // 2. Validar corpo da requisição
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return errorResponse("Email obrigatório e deve ser string", 400);
    }

    // 3. Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Email inválido", 400);
    }

    // 4. Buscar usuário
    const db = getFirestore(getApps()[0]);
    const snapshot = await db.collection("users").where("email", "==", email).get();

    if (snapshot.empty) {
      return errorResponse("Usuário não encontrado", 404);
    }

    const targetUserId = snapshot.docs[0].id;
    const targetUserData = snapshot.docs[0].data();

    // Não permitir rebaixar admin
    if (targetUserData.role === "admin") {
      return errorResponse("Usuário já é admin", 400);
    }

    // 5. Atualizar role
    await db.collection("users").doc(targetUserId).update({
      role: "admin",
      updatedAt: new Date().toISOString(),
    });

    // 6. Registrar em logs
    await db.collection("logs").add({
      userId: userId,
      userEmail: userEmail,
      action: "promote_admin",
      target: "user",
      targetId: targetUserId,
      targetEmail: email,
      details: `${userEmail} promoveu ${email} a admin`,
      timestamp: new Date().toISOString(),
    });

    return successResponse({
      success: true,
      message: `${email} foi promovido a admin por ${userEmail}`,
      uid: targetUserId,
    }, 200);

  } catch (error: any) {
    console.error("Erro em promote-admin:", error);
    return errorResponse(error.message || "Erro ao processar", 500);
  }
}
