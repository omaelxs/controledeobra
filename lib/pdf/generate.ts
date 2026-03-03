import { pdf } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import VistoriaReport from "@/components/VistoriaReport";
import { VistoriaDoc } from "@/types/vistoria";

export async function generateVistoriaPDF(params: {
  vistoria: VistoriaDoc;
  obraName: string;
  pavimentoName: string;
  apartamentoName: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = createElement(VistoriaReport, params) as any;
  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vistoria-${params.apartamentoName}-${params.vistoria.dataVistoria}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
