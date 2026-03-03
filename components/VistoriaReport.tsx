"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "@/lib/pdf/styles";
import { VistoriaDoc, ScopeStatus } from "@/types/vistoria";

const STATUS_LABEL: Record<ScopeStatus, string> = {
  conforme: "Conforme",
  atencao: "Atenção",
  nao_conforme: "Não Conforme",
  pendente: "Pendente",
};

interface Props {
  vistoria: VistoriaDoc;
  obraName: string;
  pavimentoName: string;
  apartamentoName: string;
}

export default function VistoriaReport({ vistoria, obraName, pavimentoName, apartamentoName }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Relatório de Vistoria</Text>
            <Text style={s.headerSub}>Sistema de Controle de Obras · FVS</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>Data: {vistoria.dataVistoria}</Text>
            <View style={[s.badge, vistoria.status === "aprovado" ? s.badgeAprovado : s.badgeReprovado]}>
              <Text>{vistoria.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={s.sectionTitle}><Text>Informações Gerais</Text></View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Obra:</Text>
          <Text style={s.infoValue}>{obraName}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Pavimento:</Text>
          <Text style={s.infoValue}>{pavimentoName}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Apartamento:</Text>
          <Text style={s.infoValue}>{apartamentoName}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Data da Vistoria:</Text>
          <Text style={s.infoValue}>{vistoria.dataVistoria}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Status:</Text>
          <Text style={[s.infoValue, vistoria.status === "aprovado" ? s.conforme : s.nao_conforme]}>
            {vistoria.status.toUpperCase()}
          </Text>
        </View>

        {/* Scopes */}
        <View style={s.sectionTitle}><Text>Resultado por Escopo</Text></View>
        {Object.values(vistoria.scopes).map((scope, idx) => (
          <View key={scope.scope}>
            <View style={[s.scopeRow, idx % 2 === 0 ? s.scopeRowEven : {}]}>
              <Text style={s.scopeName}>{scope.scope}</Text>
              <Text style={[s.scopeStatus, s[scope.status] || s.pendente]}>
                {STATUS_LABEL[scope.status]}
              </Text>
            </View>
            {scope.items.map(item => (
              <View key={item.itemId} style={s.checklistItem}>
                <Text>{item.itemId.replace(/^[^-]+-/, "").replace(/^\d+$/, `Item ${parseInt(item.itemId.split("-").pop() || "0") + 1}`)}</Text>
                <Text style={s[item.status] || s.pendente}>
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Observation */}
        {vistoria.observation && (
          <>
            <View style={s.sectionTitle}><Text>Observações</Text></View>
            <View style={s.observation}>
              <Text>{vistoria.observation}</Text>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>Controle de Obras · FVS</Text>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
        </View>
      </Page>
    </Document>
  );
}
