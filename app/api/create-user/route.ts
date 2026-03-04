import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps } from "firebase-admin/app";
import { cert } from "firebase-admin/app";

// Função para criar o app se não existir
function initApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Tente usar as variáveis de ambiente do Firebase Admin
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ?
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) :
    null;

  if (!serviceAccount) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT não configurado");
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function POST(req: Request) {
  try {
    const { email, password, secret } = await req.json();

    // Validação básica de segurança - requer uma chave secreta
    const validSecret = process.env.ADMIN_SECRET || "dev-secret";
    if (secret !== validSecret) {
      return Response.json({ error: "Chave secreta inválida" }, { status: 403 });
    }

    if (!email || !password) {
      return Response.json(
        { error: "Email e password são obrigatórios" },
        { status: 400 }
      );
    }

    const app = initApp();
    const auth = getAuth(app);

    try {
      // Tenta criar o usuário
      const user = await auth.createUser({
        email,
        password,
      });

      return Response.json({
        success: true,
        message: `Usuário ${email} criado com sucesso`,
        uid: user.uid,
      });
    } catch (error: any) {
      // Se o usuário já existe, tenta atualizar a senha
      if (error.code === "auth/email-already-exists") {
        // Não é possível obter o UID pelo email no admin SDK facilmente
        // Então vamos apenas retornar que já existe
        return Response.json({
          success: false,
          message: `Usuário ${email} já existe. Resete a senha no Firebase Console`,
        }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Erro:", error);
    return Response.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
