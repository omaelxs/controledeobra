import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function POST(req: Request) {
  try {
    const { email, adminEmail } = await req.json();

    // Validação básica de segurança
    if (!email || !adminEmail) {
      return Response.json({ error: "Email e adminEmail são obrigatórios" }, { status: 400 });
    }

    // Verifica se o admin email é o autorizado (pode ser configurado como env var)
    const authorizedAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "maelcost10@gmail.com";
    if (adminEmail !== authorizedAdmin) {
      return Response.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Busca o usuário pelo email para pegar o UID
    const { getDocs, collection, query, where } = require("firebase/firestore");
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;

    // Atualiza o role para admin
    await updateDoc(doc(db, "users", userId), { role: "admin" });

    return Response.json({
      success: true,
      message: `${email} foi promovido a admin`,
      uid: userId
    });
  } catch (error) {
    console.error("Erro:", error);
    return Response.json({ error: "Erro ao processar" }, { status: 500 });
  }
}
