import React, { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath, geoCentroid, GeoPermissibleObjects } from 'd3-geo';
import Papa from 'papaparse';
import { Loader2, AlertCircle, MapPin, X, Building2, ArrowLeft } from 'lucide-react';

// Planilha do ERP publicada como CSV (Google Sheets "Publicar na web"). Fonte
// viva — a cada abertura do mapa busca a lista atual de clientes, não um
// snapshot commitado no repo.
const REVENDAS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlB1XAdw9SwBxyt6A67G5HMYHgYPh-yESCN6X4aM0p-blYkI0KSV5JCCtVvIKvDJjCzKV1floNE87j/pub?gid=2142889665&single=true&output=csv';
// GeoJSON dos estados do Brasil, salvo local (não CDN) — fonte:
// codeforgermany/click_that_hood, coordenadas arredondadas p/ 3 casas
// decimais (~110m) pra reduzir o payload de 3.3MB pra ~1.4MB sem perda
// perceptível num mapa estilizado como este.
const GEOJSON_URL = '/geo/brazil-states.json';

// UF da sede (Guaramirim/SC) — recebe destaque visual no mapa.
const HOME_UF = 'SC';

// O CSV é um extrato bruto de clientes do ERP (todo mundo: consumidor final,
// escola, condomínio, revenda...). `SEGMENTO` é o único campo que distingue
// parceiro de revenda de cliente comum. Esses 5 valores foram validados
// contra o total histórico conhecido (285 revendas em 24 estados) e batem
// exatamente — ajustar aqui se a classificação de "revenda" mudar no ERP.
const RESELLER_SEGMENTS = new Set([
  'REVENDEDOR PRIVADO',
  'REVENDEDOR MISTO',
  'ATACADISTA/DISTRIBUIDOR',
  'LOJA EXCLUSIVA',
  'LOJA MULTIMARCAS',
]);

const VALID_UFS = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]);

// O ERP exporta ESTADO sem acentuação ("SAO PAULO", "CEARA") — nomes corretos
// pra exibição, não pra derivar do CSV.
const UF_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará',
  PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

interface RevendaRow {
  nome: string;
  cidade: string;
}

interface EstadoAgg {
  uf: string;
  estado: string;
  count: number;
  revendas: RevendaRow[];
}

interface GeoFeature {
  type: 'Feature';
  properties: { sigla: string; name: string };
  geometry: GeoPermissibleObjects;
}

function titleCase(text: string): string {
  return text.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());
}

const MAP_WIDTH = 560;
const MAP_HEIGHT = 560;

const RevendasMap: React.FC = () => {
  const [geoFeatures, setGeoFeatures] = useState<GeoFeature[] | null>(null);
  const [estados, setEstados] = useState<Record<string, EstadoAgg>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredUf, setHoveredUf] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedUf, setSelectedUf] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [geoRes, csvText] = await Promise.all([
          fetch(GEOJSON_URL).then(r => {
            if (!r.ok) throw new Error('Falha ao carregar contorno dos estados.');
            return r.json();
          }),
          fetch(REVENDAS_CSV_URL).then(r => {
            if (!r.ok) throw new Error('Falha ao carregar planilha de revendas.');
            return r.text();
          }),
        ]);
        if (cancelled) return;

        const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
        const agg: Record<string, EstadoAgg> = {};
        parsed.data.forEach(row => {
          const segmento = (row.SEGMENTO || '').trim().toUpperCase();
          const uf = (row.UF || '').trim().toUpperCase();
          if (!RESELLER_SEGMENTS.has(segmento) || !VALID_UFS.has(uf)) return;

          const nome = (row.NOME_FANTASIA || row.REVENDEDOR || '').trim() || 'Revenda';
          const cidade = titleCase((row.CIDADE || '').trim());

          if (!agg[uf]) agg[uf] = { uf, estado: UF_NAMES[uf] || titleCase((row.ESTADO || '').trim()), count: 0, revendas: [] };
          agg[uf].count += 1;
          agg[uf].revendas.push({ nome: titleCase(nome), cidade });
        });

        setEstados(agg);
        setGeoFeatures((geoRes.features || []) as GeoFeature[]);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Não foi possível carregar o mapa de revendas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const totalRevendas = useMemo(
    () => Object.values(estados).reduce((sum, e) => sum + e.count, 0),
    [estados]
  );

  // Projeta o GeoJSON pro viewBox do SVG e calcula o centroide (pixel) de
  // cada estado — é onde o círculo laranja é ancorado.
  const { pathGenerator, centroids } = useMemo(() => {
    if (!geoFeatures) return { pathGenerator: null, centroids: {} as Record<string, [number, number]> };

    const featureCollection = { type: 'FeatureCollection' as const, features: geoFeatures };
    const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], featureCollection as any);
    const pathGen = geoPath(projection);

    const c: Record<string, [number, number]> = {};
    geoFeatures.forEach(f => {
      const projected = projection(geoCentroid(f as any) as [number, number]);
      if (projected) c[f.properties.sigla] = projected;
    });

    return { pathGenerator: pathGen, centroids: c };
  }, [geoFeatures]);

  // Vista "zoom": quando um estado é selecionado, projeta só aquele feature
  // isolado (fitExtent com margem) em vez do Brasil inteiro.
  const zoomed = useMemo(() => {
    if (!selectedUf || !geoFeatures) return null;
    const feature = geoFeatures.find(f => f.properties.sigla === selectedUf);
    if (!feature) return null;

    const margin = 48;
    const projection = geoMercator().fitExtent(
      [[margin, margin], [MAP_WIDTH - margin, MAP_HEIGHT - margin]],
      feature as any
    );
    const pathGen = geoPath(projection);
    const centroid = projection(geoCentroid(feature as any) as [number, number]);

    return { path: pathGen(feature as any) || '', centroid };
  }, [selectedUf, geoFeatures]);

  const selectedEstado = selectedUf ? estados[selectedUf] : null;
  const hoveredEstado = hoveredUf ? estados[hoveredUf] : null;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="font-bold">Carregando mapa de revendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-16 flex flex-col items-center justify-center gap-3 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800">Mapa de Revendas Krenke</h2>
        <p className="text-slate-500 font-medium mt-1">
          <span className="font-black text-[#312783]">{totalRevendas}</span> revendas ativas em {Object.keys(estados).length} estados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-4 relative overflow-hidden">
          <div className="max-w-md mx-auto">
            {selectedUf && zoomed ? (
              <>
                <button
                  onClick={() => setSelectedUf(null)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold mb-1 transition-colors"
                >
                  <ArrowLeft size={14} /> Ver mapa completo
                </button>
                <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="w-full h-auto">
                  <path d={zoomed.path} fill="#312783" stroke="#F39200" strokeWidth={2.5} />
                  {zoomed.centroid && selectedEstado && (
                    <text
                      x={zoomed.centroid[0]}
                      y={zoomed.centroid[1]}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#fff"
                      stroke="#312783"
                      strokeWidth={4}
                      paintOrder="stroke"
                      fontSize={22}
                      fontWeight={800}
                    >
                      {selectedEstado.count}
                    </text>
                  )}
                </svg>
              </>
            ) : (
              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                className="w-full h-auto"
                onMouseLeave={() => setHoveredUf(null)}
              >
                {pathGenerator && geoFeatures?.map(f => {
                  const uf = f.properties.sigla;
                  const isHome = uf === HOME_UF;
                  const isHovered = uf === hoveredUf;
                  return (
                    <path
                      key={uf}
                      d={pathGenerator(f as any) || ''}
                      fill={isHovered ? '#F39200' : '#1e2a4a'}
                      stroke={isHome ? '#F39200' : 'rgba(255,255,255,0.15)'}
                      strokeWidth={isHome ? 1.5 : 0.5}
                      className="transition-colors duration-150 cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredUf(uf);
                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                      }}
                      onMouseMove={(e) => {
                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                      }}
                      onClick={() => setSelectedUf(uf)}
                    />
                  );
                })}

                {geoFeatures?.map(f => {
                  const uf = f.properties.sigla;
                  const estado = estados[uf];
                  const pos = centroids[uf];
                  if (!estado || !pos) return null;

                  const isHovered = uf === hoveredUf;

                  return (
                    <text
                      key={uf}
                      x={pos[0]}
                      y={pos[1]}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#fff"
                      stroke={isHovered ? '#F39200' : '#0F1233'}
                      strokeWidth={3}
                      paintOrder="stroke"
                      fontSize={11}
                      fontWeight={800}
                      pointerEvents="none"
                    >
                      {estado.count}
                    </text>
                  );
                })}
              </svg>
            )}
          </div>

          {!selectedUf && hoveredEstado && (
            <div
              className="absolute pointer-events-none bg-white text-slate-800 rounded-lg shadow-xl px-3 py-2 text-sm font-bold z-10 -translate-x-1/2 -translate-y-full"
              style={{ left: tooltipPos.x, top: tooltipPos.y - 10 }}
            >
              {hoveredEstado.estado}
              <span className="block text-xs font-medium text-slate-500">{hoveredEstado.count} revenda{hoveredEstado.count !== 1 ? 's' : ''}</span>
            </div>
          )}

          <p className="text-center text-slate-400 text-xs font-medium mt-2">
            {selectedUf ? 'Clique em "Ver mapa completo" pra voltar' : 'Passe o mouse pra ver o total • clique num estado pra ver a lista'}
          </p>
        </div>

        {/* Lista lateral */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col max-h-[600px]">
          {selectedEstado ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-800">{selectedEstado.estado}</h3>
                  <p className="text-xs text-slate-400 font-bold">{selectedEstado.count} revenda{selectedEstado.count !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => setSelectedUf(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-2 overflow-y-auto pr-1 -mr-1">
                {selectedEstado.revendas
                  .slice()
                  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                  .map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Building2 size={16} className="text-[#312783] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate">{r.nome}</p>
                        <p className="text-xs text-slate-500">{r.cidade}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 gap-3 py-10">
              <MapPin size={32} />
              <p className="font-bold text-sm">Clique num estado no mapa<br />pra ver as revendas da região</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevendasMap;
