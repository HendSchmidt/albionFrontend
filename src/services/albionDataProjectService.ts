export interface AlbionLivePrice {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  buy_price_max: number;
}

export const CIDADES_ALBION = [
  'Fort Sterling',
  'Thetford',
  'Lymhurst',
  'Bridgewatch',
  'Martlock',
  'Caerleon',
  'Brecilien',
] as const;

export type CidadeAlbion = typeof CIDADES_ALBION[number];

/**
 * Consulta a API pública do Albion Online Data Project para buscar cotações ao vivo.
 */
export async function buscarPrecosAoVivo(
  itemIds: string[],
  cidade?: CidadeAlbion
): Promise<AlbionLivePrice[]> {
  const itemsParam = itemIds.join(',');
  const locationsParam = cidade ? `&locations=${encodeURIComponent(cidade)}` : '';
  const url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemsParam}?qualities=1${locationsParam}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao consultar Albion Data Project (${res.status})`);
  }

  const data: AlbionLivePrice[] = await res.json();
  return data;
}
