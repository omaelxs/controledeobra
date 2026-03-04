/**
 * Gerador de PDF profissional para vistorias
 * Usa @react-pdf/renderer para criar PDFs do lado do servidor
 */

import { VistoriaDoc, ScopeResult } from "@/types/vistoria";
import { Obra, Pavimento, Apartamento } from "@/types";

interface PDFGeneratorOptions {
  vistoria: VistoriaDoc;
  obra: Obra;
  pavimento: Pavimento | undefined;
  apartamento: Apartamento;
  userName: string;
  approverName?: string;
}

/**
 * Gerar HTML do PDF (pode ser convertido com html2pdf ou similar)
 */
export function generateVistoriaPdfHtml(options: PDFGeneratorOptions): string {
  const { vistoria, obra, pavimento, apartamento, userName, approverName } = options;
  const dataVistoria = new Date(vistoria.dataVistoria).toLocaleDateString("pt-BR");
  const now = new Date().toLocaleDateString("pt-BR");

  const statusColor = {
    aprovado: "#22c55e",
    reprovado: "#ef4444",
    pendente: "#eab308",
  };

  const scopeStatusColor = {
    conforme: "#22c55e",
    atencao: "#eab308",
    nao_conforme: "#ef4444",
    pendente: "#999",
  };

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .page { page-break-after: always; padding: 40px; max-width: 210mm; margin: 0 auto; }
        header { border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { font-size: 24px; font-weight: bold; }
        h2 { font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .header-info { display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; color: white; font-weight: bold; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; font-size: 12px; border: 1px solid #ddd; }
        td { padding: 10px; font-size: 11px; border: 1px solid #ddd; }
        .scope-row { background: #fafafa; }
        .item-row { padding-left: 20px; }
        .photo-section { margin: 15px 0; }
        .photo-grid { display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0; }
        .photo { max-width: 80px; border: 1px solid #ddd; }
        .footer { margin-top: 40px; border-top: 2px solid #1a1a1a; padding-top: 20px; font-size: 11px; }
        .signature-line { margin-top: 30px; }
        .signature-box { display: inline-block; width: 200px; border-top: 1px solid #333; text-align: center; margin-right: 40px; }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <header>
          <h1>📋 RELATÓRIO DE VISTORIA</h1>
          <div class="header-info">
            <div>
              <strong>Obra:</strong> ${obra.name}<br>
              <strong>Endereço:</strong> ${obra.address}
            </div>
            <div>
              <strong>Status:</strong>
              <span class="status-badge" style="background-color: ${statusColor[vistoria.status]};">
                ${vistoria.status === "aprovado" ? "✓ APROVADO" : vistoria.status === "reprovado" ? "✗ REPROVADO" : "◯ PENDENTE"}
              </span>
            </div>
          </div>
        </header>

        <!-- Informações -->
        <h2>INFORMAÇÕES DA VISTORIA</h2>
        <table>
          <tr>
            <td><strong>Pavimento:</strong> ${pavimento?.name || "N/A"}</td>
            <td><strong>Apartamento:</strong> ${apartamento?.name || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Data da Vistoria:</strong> ${dataVistoria}</td>
            <td><strong>Responsável:</strong> ${userName}</td>
          </tr>
          <tr>
            <td><strong>Classificação:</strong> ${apartamento?.classification === "urgente" ? "🔴 URGENTE" : "⚪ NORMAL"}</td>
            <td><strong>Data de Geração:</strong> ${now}</td>
          </tr>
        </table>

        <!-- Escopos -->
        <h2>RESULTADO POR ESCOPO</h2>
        <table>
          <thead>
            <tr>
              <th>Escopo</th>
              <th>Status</th>
              <th>Itens Conformes</th>
              <th>Itens com Atenção</th>
              <th>Itens Não Conformes</th>
            </tr>
          </thead>
          <tbody>
  `;

  // Adicionar escopos
  for (const [scopeName, scopeResult] of Object.entries(vistoria.scopes)) {
    const conformeCount = scopeResult.items.filter((i) => i.status === "conforme").length;
    const atencaoCount = scopeResult.items.filter((i) => i.status === "atencao").length;
    const naoConformeCount = scopeResult.items.filter((i) => i.status === "nao_conforme").length;

    html += `
      <tr class="scope-row">
        <td><strong>${scopeName}</strong></td>
        <td>
          <span class="status-badge" style="background-color: ${scopeStatusColor[scopeResult.status]}; width: 80px;">
            ${scopeResult.status === "conforme" ? "✓" : scopeResult.status === "atencao" ? "⚠" : scopeResult.status === "nao_conforme" ? "✗" : "○"}
            ${scopeResult.status}
          </span>
        </td>
        <td style="color: #22c55e; font-weight: bold;">${conformeCount}</td>
        <td style="color: #eab308; font-weight: bold;">${atencaoCount}</td>
        <td style="color: #ef4444; font-weight: bold;">${naoConformeCount}</td>
      </tr>
    `;
  }

  html += `
          </tbody>
        </table>

        <!-- Detalhes de itens -->
        <h2>DETALHES DOS ITENS</h2>
  `;

  for (const [scopeName, scopeResult] of Object.entries(vistoria.scopes)) {
    html += `<h3 style="margin-top: 15px; font-size: 12px; color: #1a1a1a;">${scopeName}</h3>`;

    for (const item of scopeResult.items) {
      const itemStatus = item.status;
      html += `
        <div style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid ${scopeStatusColor[itemStatus]};">
          <strong>${item.observation || "Item"}</strong><br>
          Status: <span style="color: ${scopeStatusColor[itemStatus]}; font-weight: bold;">${itemStatus}</span>
          ${item.observation ? `<br>Observação: ${item.observation}` : ""}
          ${item.photos && item.photos.length > 0 ? `<br>Fotos: ${item.photos.length}` : ""}
        </div>
      `;
    }
  }

  html += `
        <!-- Observações Gerais -->
        <h2>OBSERVAÇÕES GERAIS</h2>
        <div style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; min-height: 60px;">
          ${vistoria.observation || "Sem observações gerais."}
        </div>

        <!-- Footer com assinatura -->
        <div class="footer">
          <p>Relatório gerado automaticamente pelo Sistema de Controle de Obras</p>
          <div class="signature-line">
            <div class="signature-box">
              <strong>Responsável pela Vistoria</strong><br>
              ${userName}<br>
              Data: ${dataVistoria}
            </div>
            ${
              approverName
                ? `
            <div class="signature-box">
              <strong>Aprovado por</strong><br>
              ${approverName}<br>
              Data: ${now}
            </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Exportar para PDF (usar html2pdf ou similar no cliente)
 * Exemplo: html2pdf().set(opt).fromHtml(html).output('blob')
 */
export async function sendVistoriaPdfToBackend(
  html: string,
  vistoriaId: string
): Promise<{ success: boolean; pdfUrl?: string }> {
  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, vistoriaId }),
    });

    if (!response.ok) throw new Error("Erro ao gerar PDF");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao enviar PDF:", error);
    return { success: false };
  }
}
