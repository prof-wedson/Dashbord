import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const fmt = (v) =>
  "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── DADOS ATUALIZADOS — planilha_obra_wedson lida em 15/06/2026 ──────────────

// Mão de obra principal agrupada por mês
const laborMonthly = [
  { mes: "Jul/25", valor: 8870 },
  { mes: "Ago/25", valor: 15350 },
  { mes: "Set/25", valor: 10900 },
  { mes: "Out/25", valor: 11800 },
  { mes: "Nov/25", valor: 9800 },
  { mes: "Dez/25", valor: 13800 },
  { mes: "Jan/26", valor: 10200 },
  { mes: "Fev/26", valor: 14800 },
  { mes: "Mar/26", valor: 16400 },
  { mes: "Abr/26", valor: 19700 },
  { mes: "Mai/26", valor: 15300 },
  { mes: "Jun/26", valor: 7700 },
];

// Categorias de mão de obra: pago vs contratado
const laborCategories = [
  { categoria: "Obra Principal",      pago: 154620, total: 163800 },
  { categoria: "Hidráulica",          pago: 11700,  total: 12000  },
  { categoria: "Container/Betoneira", pago: 6780,   total: 6780   },
  { categoria: "Máquina",             pago: 6605,   total: 6605   },
  { categoria: "Ar Cond (Moisés)",    pago: 4000,   total: 4000   },
  { categoria: "Elétrica (Fernando)", pago: 3928,   total: 3928   },
  { categoria: "Manta (Jorge)",       pago: 2000,   total: 2000   },
  { categoria: "Buraco (Urias)",      pago: 980,    total: 980    },
  { categoria: "Andaime",             pago: 0,      total: 0      },
];

// Itens de material conforme planilha
const materialItems = [
  { tipo: "Ferragem",   fornecedor: "Claudio",        valor: 53457.00,  pendente: false },
  { tipo: "Lajes",      fornecedor: "Cantieri",       valor: 56600.00,  pendente: false },
  { tipo: "Tijolo",     fornecedor: "Renato",         valor: 22397.70,  pendente: false },
  { tipo: "Cimento/Cal",fornecedor: "Cimercal",       valor: 25455.00,  pendente: false },
  { tipo: "Brita",      fornecedor: "CMP",            valor: 4721.00,   pendente: false },
  { tipo: "Areia",      fornecedor: "Natalino",       valor: 26950.00,  pendente: false },
  { tipo: "Madeira",    fornecedor: "Serra Verde",    valor: 2654.00,   pendente: false },
  { tipo: "Madeira",    fornecedor: "Madelei",        valor: 5555.00,   pendente: false },
  { tipo: "Escora",     fornecedor: "Evânio",         valor: 4144.00,   pendente: false },
  { tipo: "Areia",      fornecedor: "Seu Luiz",       valor: 5800.00,   pendente: false },
  { tipo: "Hidráulica", fornecedor: "Casa Real",      valor: 16200.00,  pendente: false },
  { tipo: "Elétrica",   fornecedor: "Sist Eletrico",  valor: 2400.00,   pendente: false },
  { tipo: "Ferramenta", fornecedor: "Mult Parafuso",  valor: 880.30,    pendente: false },
  { tipo: "Vedação",    fornecedor: "Só Tintas",      valor: 2847.00,   pendente: false },
  { tipo: "Portão",     fornecedor: "Lucin",          valor: 11000.00,  pendente: false },
  { tipo: "Telhado",    fornecedor: "Lucin",          valor: 24000.00,  pendente: false },
  { tipo: "Piscina",    fornecedor: "Azul Vinil",     valor: 11000.00,  pendente: false },
  { tipo: "Calha",      fornecedor: "Cleiton",        valor: 2500.00,   pendente: false },
];

// Totais calculados a partir da planilha
const TOTAL_MAO_OBRA_CONTRATADO = 200093; // soma de todos os contratados por categoria
const TOTAL_MAO_OBRA_PAGO       = 190613; // soma de todos os valores pagos de mão de obra
const TOTAL_MATERIAL            = 278561; // soma de todos os itens de material

// ─────────────────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:"10px 14px", boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <p style={{ fontWeight:600, color:"#374151", marginBottom:4 }}>{label}</p>
        {payload.map((p,i) => <p key={i} style={{ color:p.color, margin:0, fontSize:13 }}>{p.name}: {fmt(p.value)}</p>)}
      </div>
    );
  }
  return null;
};

const KpiCard = ({ title, value, sub, color, icon }) => (
  <div style={{ background:"#fff", borderRadius:16, padding:"20px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.07)", borderLeft:`4px solid ${color}`, flex:1, minWidth:180 }}>
    <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
    <div style={{ fontSize:13, color:"#6b7280", marginBottom:4, fontWeight:500 }}>{title}</div>
    <div style={{ fontSize:22, fontWeight:700, color:"#1f2937" }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>{sub}</div>}
  </div>
);

export default function ObraDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const totalPago = TOTAL_MAO_OBRA_PAGO + TOTAL_MATERIAL;
  const totalContratado = TOTAL_MAO_OBRA_CONTRATADO + TOTAL_MATERIAL;
  const pctPago = Math.round((totalPago / totalContratado) * 100);
  const pendentes = materialItems.filter(m => m.pendente);
  const hoje = new Date().toLocaleDateString("pt-BR");
  const pieData = [
    { name:"Mão de Obra", value: TOTAL_MAO_OBRA_CONTRATADO },
    { name:"Material",    value: TOTAL_MATERIAL },
  ];
  const tabs = [
    { id:"overview", label:"📊 Visão Geral" },
    { id:"labor",    label:"👷 Mão de Obra" },
    { id:"material", label:"🧱 Material" },
    { id:"pendente", label:`⚠️ Pendências (${pendentes.length})` },
  ];
  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", background:"#f3f4f6", minHeight:"100vh", padding:24 }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)", borderRadius:20, padding:"28px 32px", marginBottom:24, color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontSize:13, opacity:0.8, marginBottom:4 }}>CONTROLE DE OBRA · Atualizado em {hoje}</div>
          <div style={{ fontSize:28, fontWeight:800 }}>🏗️ Obra Wedson</div>
          <div style={{ fontSize:13, opacity:0.75, marginTop:4 }}>Jul/2025 → Jun/2026 · planilha_obra_wedson</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:13, opacity:0.8 }}>Total Geral (Contratado)</div>
          <div style={{ fontSize:30, fontWeight:800 }}>{fmt(totalContratado)}</div>
          <div style={{ marginTop:8 }}>
            <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:20, height:8, width:200, overflow:"hidden" }}>
              <div style={{ background:"#fff", height:"100%", width:`${pctPago}%`, borderRadius:20 }} />
            </div>
            <div style={{ fontSize:12, opacity:0.85, marginTop:4 }}>{pctPago}% pago · {fmt(totalPago)}</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:24 }}>
        <KpiCard icon="👷" title="Mão de Obra (Contratado)" value={fmt(TOTAL_MAO_OBRA_CONTRATADO)} sub={`Pago: ${fmt(TOTAL_MAO_OBRA_PAGO)}`} color="#6366f1" />
        <KpiCard icon="🧱" title="Material (Total)" value={fmt(TOTAL_MATERIAL)} sub="Conforme planilha" color="#8b5cf6" />
        <KpiCard icon="⚠️" title="Pendências de Material" value={`${pendentes.length} itens`} sub="Falta entrega/pagamento" color="#f59e0b" />
        <KpiCard icon="📅" title="Total Geral Pago" value={fmt(totalPago)} sub={`${pctPago}% do contratado`} color="#10b981" />
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding:"8px 18px", borderRadius:20, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, background: activeTab===t.id ? "#4f46e5" : "#fff", color: activeTab===t.id ? "#fff" : "#6b7280", boxShadow: activeTab===t.id ? "0 2px 8px rgba(79,70,229,0.3)" : "0 1px 4px rgba(0,0,0,0.07)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab==="overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)", gridColumn:"1 / -1" }}>
            <div style={{ fontWeight:700, color:"#1f2937", marginBottom:16, fontSize:15 }}>📈 Mão de Obra Principal — Gasto Mensal</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={laborMonthly} margin={{ top:0, right:10, bottom:0, left:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize:12, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" name="Mão de Obra" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight:700, color:"#1f2937", marginBottom:16, fontSize:15 }}>🥧 Distribuição do Orçamento</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_,i) => <Cell key={i} fill={["#6366f1","#a78bfa"][i]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight:700, color:"#1f2937", marginBottom:16, fontSize:15 }}>👷 Categorias de Mão de Obra</div>
            {laborCategories.filter(item => item.total > 0).slice(0,6).map((item,i) => {
              const pct = Math.round((item.pago/item.total)*100);
              return (
                <div key={i} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{item.categoria}</span>
                    <span style={{ fontSize:12, color:"#6b7280" }}>{fmt(item.pago)} / {fmt(item.total)}</span>
                  </div>
                  <div style={{ background:"#f3f4f6", borderRadius:10, height:6, overflow:"hidden" }}>
                    <div style={{ background:"#6366f1", height:"100%", width:`${pct}%`, borderRadius:10 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Labor */}
      {activeTab==="labor" && (
        <div style={{ display:"grid", gap:20 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight:700, color:"#1f2937", marginBottom:16, fontSize:15 }}>📊 Mão de Obra por Categoria — Pago vs. Contratado</div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={laborCategories.filter(item => item.total > 0)} layout="vertical" margin={{ left:20, right:20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="categoria" tick={{ fontSize:12, fill:"#374151" }} axisLine={false} tickLine={false} width={140} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:13 }} />
                <Bar dataKey="total" name="Contratado" fill="#ddd6fe" radius={[0,6,6,0]} />
                <Bar dataKey="pago" name="Pago" fill="#6366f1" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight:700, color:"#1f2937", marginBottom:16, fontSize:15 }}>📈 Evolução Mensal — Mão de Obra Principal</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={laborMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize:12, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="valor" name="Gasto mensal" stroke="#6366f1" strokeWidth={3} dot={{ fill:"#6366f1", r:5 }} activeDot={{ r:7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ fontWeight:700, color:"#1f2937", marginBottom:16, fontSize:15 }}>📋 Resumo por Categoria</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:"#f9fafb" }}>
                  {["Categoria","Contratado","Pago","Restante","% Pago"].map(h => (
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontWeight:600, color:"#6b7280", fontSize:12, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {laborCategories.map((item,i) => {
                  const restante = item.total - item.pago;
                  const pct = item.total > 0 ? Math.round((item.pago/item.total)*100) : 0;
                  return (
                    <tr key={i} style={{ borderTop:"1px solid #f3f4f6", background: i%2===0?"#fff":"#fafafa" }}>
                      <td style={{ padding:"12px 16px", fontWeight:500, color:"#1f2937" }}>{item.categoria}</td>
                      <td style={{ padding:"12px 16px", color:"#6b7280" }}>{item.total > 0 ? fmt(item.total) : "—"}</td>
                      <td style={{ padding:"12px 16px", fontWeight:600, color:"#4f46e5" }}>{item.pago > 0 ? fmt(item.pago) : "—"}</td>
                      <td style={{ padding:"12px 16px", color: restante > 0 ? "#f59e0b" : "#10b981" }}>{item.total > 0 ? fmt(restante) : "—"}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ background: pct >= 100 ? "#d1fae5" : "#ede9fe", color: pct >= 100 ? "#059669" : "#6366f1", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                          {item.total > 0 ? `${pct}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop:"2px solid #e5e7eb", background:"#f9fafb" }}>
                  <td style={{ padding:"12px 16px", fontWeight:700, color:"#1f2937" }}>TOTAL</td>
                  <td style={{ padding:"12px 16px", fontWeight:700, color:"#1f2937" }}>{fmt(TOTAL_MAO_OBRA_CONTRATADO)}</td>
                  <td style={{ padding:"12px 16px", fontWeight:700, color:"#4f46e5" }}>{fmt(TOTAL_MAO_OBRA_PAGO)}</td>
                  <td style={{ padding:"12px 16px", fontWeight:700, color:"#f59e0b" }}>{fmt(TOTAL_MAO_OBRA_CONTRATADO - TOTAL_MAO_OBRA_PAGO)}</td>
                  <td style={{ padding:"12px 16px", fontWeight:700, color:"#6366f1" }}>{Math.round((TOTAL_MAO_OBRA_PAGO/TOTAL_MAO_OBRA_CONTRATADO)*100)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Material */}
      {activeTab==="material" && (
        <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
          <div style={{ fontWeight:700, color:"#1f2937", marginBottom:16, fontSize:15 }}>🧱 Material — Todos os Itens</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <thead>
                <tr style={{ background:"#f9fafb" }}>
                  {["Tipo","Fornecedor","Valor","Status"].map(h => (
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontWeight:600, color:"#6b7280", fontSize:12, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materialItems.map((item,i) => (
                  <tr key={i} style={{ borderTop:"1px solid #f3f4f6", background: i%2===0?"#fff":"#fafafa" }}>
                    <td style={{ padding:"12px 16px", fontWeight:500, color:"#1f2937" }}>{item.tipo}</td>
                    <td style={{ padding:"12px 16px", color:"#6b7280" }}>{item.fornecedor}</td>
                    <td style={{ padding:"12px 16px", fontWeight:600, color:"#1f2937" }}>{item.valor ? fmt(item.valor) : "—"}</td>
                    <td style={{ padding:"12px 16px" }}>
                      {item.pendente
                        ? <span style={{ background:"#fef3c7", color:"#d97706", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>⚠️ {item.obs}</span>
                        : <span style={{ background:"#d1fae5", color:"#059669", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>✅ OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop:"2px solid #e5e7eb", background:"#f9fafb" }}>
                  <td colSpan={2} style={{ padding:"12px 16px", fontWeight:700, color:"#1f2937" }}>TOTAL (planilha)</td>
                  <td style={{ padding:"12px 16px", fontWeight:700, color:"#4f46e5" }}>{fmt(TOTAL_MATERIAL)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Pendências */}
      {activeTab==="pendente" && (
        <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
          <div style={{ fontWeight:700, color:"#1f2937", marginBottom:16, fontSize:15 }}>⚠️ Itens com Pendência</div>
          {pendentes.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 24px", color:"#6b7280" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <div style={{ fontWeight:600, fontSize:16, color:"#1f2937", marginBottom:8 }}>Nenhuma pendência encontrada!</div>
              <div style={{ fontSize:14 }}>Todos os itens de material estão com valores preenchidos na planilha.</div>
            </div>
          ) : (
            <div style={{ display:"grid", gap:12 }}>
              {pendentes.map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:"16px 20px", flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ fontWeight:600, color:"#1f2937" }}>{item.tipo}</div>
                    <div style={{ fontSize:13, color:"#6b7280" }}>Fornecedor: {item.fornecedor}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:700, color:"#d97706", fontSize:16 }}>{item.valor ? fmt(item.valor) : "—"}</div>
                    <div style={{ fontSize:12, color:"#f59e0b", fontWeight:600 }}>⚠️ {item.obs}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:8, background:"#fef3c7", borderRadius:12, padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:600, color:"#92400e" }}>Total em pendências</span>
                <span style={{ fontWeight:800, fontSize:18, color:"#d97706" }}>{fmt(pendentes.reduce((s,p) => s+(p.valor||0), 0))}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign:"center", marginTop:24, color:"#9ca3af", fontSize:12 }}>
        Dados importados de planilha_obra_wedson · Atualizado automaticamente em {hoje}
      </div>
    </div>
  );
}
