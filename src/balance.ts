import type { State } from './engine';
import { item, skills, type Slot } from './content';
export const BALANCE = {
    baseCap: 20, totalCap: 25, bagSlots: 40,
    hpBase: 15, hpVit: 5, mpBase: 5, mpInt: 3, staBase: 10, staVit: 5,
    staFullMin: 30, staFullBase: 60, staFullVit: 1.5,
    mpFullMin: 45, mpFullBase: 100, mpFullInt: 2,
    walkCost: .18, searchCost: .22, gatherCost: .4,
    dodgeCap: .25, critCap: .25, speedCap: 12, costReductionCap: .2,
    statXpBase: 80, levelGrowthBase: .85,
    safePlaces: ['village', 'grove', 'root', 'garden', 'quay', 'library'],
} as const;
export type Stat = 'strength' | 'agility' | 'vitality' | 'intellect';
export type Stats = Record<Stat, number>;
export const statKeys: Stat[] = ['strength', 'agility', 'vitality', 'intellect'];
export const statNames: Record<Stat, string> = { strength: 'STR · Sức mạnh', agility: 'AGI · Nhanh nhẹn', vitality: 'VIT · Thể chất', intellect: 'INT · Trí lực' };
export type EquipmentRule = {
    weight: number;
    stats?: Partial<Stats>;
    armor?: number;
    str?: number;
    agi?: number;
    int?: number;
    requirement?: Partial<Stats>;
};
export const equipmentRules: Record<string, EquipmentRule> = {
    sword: { weight: 2, str: .8, agi: .2, requirement: { strength: 2 } }, bow: { weight: 2, str: .3, agi: .7, requirement: { agility: 3 } }, staff: { weight: 2, int: 1, requirement: { intellect: 2 } },
    axe: { weight: 5, str: 1.2, requirement: { strength: 5 } }, dagger: { weight: 1, str: .2, agi: 1, requirement: { agility: 4 } },
    ash0: { weight: 2, armor: 1 }, ash1: { weight: 1, armor: 1 }, ash2: { weight: 3, armor: 2, stats: { vitality: 1 } }, ash3: { weight: .5, stats: { strength: 1 } }, ash4: { weight: 1, armor: 1 }, ash5: { weight: 1, stats: { agility: 1 } }, ash6: { weight: .5, stats: { intellect: 1 } }, ash7: { weight: .1, stats: { vitality: 1 } }, moonblade: { weight: 3, str: .6, agi: .4, requirement: { strength: 5, agility: 5 } },
};
export const skillSta: Record<string, number> = { slash: 2, pierce: 3, flurry: 5, shot: 2, poison: 3, storm: 5, fire: 0, ice: 0, light: 0, heal: 0, bash: 2, ward: 0 };
export function equippedGear(s: State) { return s.gear.filter(g => Object.values(s.equipped).includes(g.uid) && g.durability > 0); }
export function effectiveStats(s: State): Stats { const result = { ...s.stats }; for (const g of equippedGear(s)) {
    const bonus = equipmentRules[g.id]?.stats;
    for (const k of statKeys)
        result[k] = Math.min(BALANCE.totalCap, result[k] + (bonus?.[k] || 0));
} return result; }
export const maxHp = (s: State) => BALANCE.hpBase + BALANCE.hpVit * effectiveStats(s).vitality;
export const maxMp = (s: State) => BALANCE.mpBase + BALANCE.mpInt * effectiveStats(s).intellect;
export const maxSta = (s: State) => BALANCE.staBase + BALANCE.staVit * effectiveStats(s).vitality;
export const staFullTime = (s: State) => Math.max(BALANCE.staFullMin, BALANCE.staFullBase - BALANCE.staFullVit * effectiveStats(s).vitality);
export const mpFullTime = (s: State) => Math.max(BALANCE.mpFullMin, BALANCE.mpFullBase - BALANCE.mpFullInt * effectiveStats(s).intellect);
export const staRegen = (s: State) => maxSta(s) / staFullTime(s);
export const mpRegen = (s: State) => maxMp(s) / mpFullTime(s);
export function clampResources(s: State) { s.hp = Math.max(0, Math.min(s.hp, maxHp(s))); s.mp = Math.max(0, Math.min(s.mp, maxMp(s))); s.sta = Math.max(0, Math.min(s.sta, maxSta(s))); }
export function weight(s: State) { return s.gear.reduce((n, g) => n + (equipmentRules[g.id]?.weight || 1), 0) + Object.entries(s.bag).reduce((n, [id, q]) => n + q * (id === 'parcel' ? 5 : id === 'ore' ? .7 : id === 'key' ? 0 : .15), 0); }
export const weightLimit = (s: State) => 8 + effectiveStats(s).strength * 2;
export const loadRatio = (s: State) => weight(s) / weightLimit(s);
export const safe = (s: State) => BALANCE.safePlaces.includes(s.location as typeof BALANCE.safePlaces[number]);
export function walkNet(s: State) { return staRegen(s) * .25 - BALANCE.walkCost * (1 + Math.max(0, loadRatio(s) - .6) * 2); }
export function armor(s: State) { const gear = equippedGear(s); return gear.reduce((n, g) => n + (equipmentRules[g.id]?.armor || 0), 0) + (gear.filter(g => item(g.id).set === 'Tro').length >= 3 ? 1 : 0); }
export const damageReduction = (armorValue: number) => 1 - 1 / (1 + .18 * Math.max(0, armorValue));
export const speed = (s: State) => Math.min(BALANCE.speedCap, 2 + effectiveStats(s).agility * .65) * (s.sta / maxSta(s) <= .1 ? .7 : 1) * (loadRatio(s) > 1 ? .8 : 1);
export const dodge = (s: State) => Math.min(BALANCE.dodgeCap, .02 + effectiveStats(s).agility * .009);
export const retreatChance = (s: State) => Math.min(.9, .45 + effectiveStats(s).agility * .025 - (loadRatio(s) > 1 ? .15 : 0));
export const skillMp = (s: State, id: string) => { const k = skills.find(k => k.id === id)!; return k.mp * (1 - Math.min(BALANCE.costReductionCap, (s.mastery[id] || 0) / 2000)); };
export function canEquip(s: State, id: string) { const req = equipmentRules[id]?.requirement; return statKeys.every(k => s.stats[k] >= (req?.[k] || 0)); }
export function weaponPath(s: State) { const g = s.gear.find(g => g.uid === s.equipped['vũ khí']); return g?.id === 'staff' ? 'phép' : g?.id === 'bow' ? 'cung' : g?.id === 'dagger' ? 'dao' : g?.id === 'axe' ? 'rìu' : 'kiếm'; }
export function attackPower(s: State, skillId?: string) {
    const v = effectiveStats(s);
    const g = equippedGear(s).find(g => item(g.id).slot === 'vũ khí');
    const rule = g ? equipmentRules[g.id] : undefined;
    const sk = skills.find(k => k.id === skillId);
    const physical = 1 + (g ? item(g.id).power : 0) + v.strength * (rule?.str ?? .5) + v.agility * (rule?.agi ?? 0);
    const magic = 2 + v.intellect * 1.2 + (g?.id === 'staff' ? item(g.id).power : 0);
    const base = sk?.path === 'phép' ? magic : sk?.path === 'cung' ? 2 + v.agility * .75 + v.strength * .25 + (g?.id === 'bow' ? item(g.id).power : 0) : physical;
    return base * (s.injury > 0 ? .8 : 1) * (s.sta / maxSta(s) <= .1 && sk?.path !== 'phép' ? .7 : 1);
}
export const allSlots: Slot[] = ['vũ khí', 'phụ trợ', 'đầu', 'thân', 'tay', 'chân', 'giày', 'áo choàng', 'phụ kiện'];
