// Mi lista: SOLO básicos de la lista blanca (frijol, tortilla, huevo, arroz, producto de temporada).
// Sin productos con sellos NOM-051. Rangos de precio INVENTADOS (datos de demostración).
export const LISTA_CAPTURA = "dic 2025";

export type ItemLista = { nombre: string; cantidad: string; min: number; max: number; grupo: string };

export const LISTA_DEMO: ItemLista[] = [
  { nombre: "Frijol negro", cantidad: "1 kg", min: 32, max: 46, grupo: "Leguminosas" },
  { nombre: "Tortilla de maíz", cantidad: "1 kg", min: 22, max: 30, grupo: "Cereales" },
  { nombre: "Huevo blanco", cantidad: "12 piezas", min: 38, max: 54, grupo: "Origen animal" },
  { nombre: "Arroz", cantidad: "1 kg", min: 26, max: 38, grupo: "Cereales" },
  { nombre: "Jitomate saladet", cantidad: "1 kg", min: 22, max: 40, grupo: "Verduras" },
  { nombre: "Calabacita", cantidad: "1 kg", min: 20, max: 34, grupo: "Verduras" },
  { nombre: "Cebolla blanca", cantidad: "½ kg", min: 10, max: 18, grupo: "Verduras" },
  { nombre: "Naranja (temporada)", cantidad: "2 kg", min: 24, max: 40, grupo: "Frutas" },
  { nombre: "Guayaba (temporada)", cantidad: "1 kg", min: 25, max: 42, grupo: "Frutas" },
];

/** Nunca mostramos un total exacto: solo el máximo esperado (suma de máximos). */
export const maximoEsperado = (items: ItemLista[]) => items.reduce((s, i) => s + i.max, 0);
