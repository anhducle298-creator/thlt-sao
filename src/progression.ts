import type { State } from './engine';
import { BALANCE, clampResources, statKeys, statNames, type Stat } from './balance';
export function random(s: State) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
export function message(s: State, t: string) { s.log.unshift(t); s.log = s.log.slice(0, 200); }
export const statThreshold = (value: number) => BALANCE.statXpBase * (value + 1) ** 2;
export function trainStats(s: State, weights: Partial<Record<Stat, number>>, receipt: string) {
    if (s.progressionReceipts.includes(receipt))
        return;
    s.progressionReceipts.push(receipt);
    s.progressionReceipts = s.progressionReceipts.slice(-200);
    for (const key of statKeys) {
        const amount = weights[key] || 0;
        if (amount <= 0 || s.stats[key] >= BALANCE.baseCap)
            continue;
        s.recent[key] = s.recent[key] * .995 + amount;
        s.hiddenXp[key] += amount;
        while (s.stats[key] < BALANCE.baseCap && s.hiddenXp[key] >= statThreshold(s.stats[key])) {
            s.hiddenXp[key] -= statThreshold(s.stats[key]);
            const old = s.stats[key]++;
            message(s, `${statNames[key]} ${old} → ${s.stats[key]} · Những nỗ lực đã thành thói quen.`);
        }
    }
    clampResources(s);
}
export const xpNeeded = (s: State) => s.level * 70;
export function awardXp(s: State, n: number) {
    s.xp += n;
    s.totalXp += n;
    while (s.xp >= xpNeeded(s)) {
        s.xp -= xpNeeded(s);
        s.level++;
        const changes: string[] = [];
        const chance = BALANCE.levelGrowthBase / (1 + s.level / 18);
        if (random(s) < chance) {
            const count = s.level < 12 && random(s) < .35 ? 2 : 1;
            const eligible = statKeys.filter(k => s.stats[k] < BALANCE.baseCap);
            for (let i = 0; i < count && eligible.length; i++) {
                const weights = eligible.map(k => (1 + Math.min(.35, s.recent[k] / 100)) * (1 - (s.stats[k] / BALANCE.baseCap) ** 2));
                let pick = random(s) * weights.reduce((a, b) => a + b, 0);
                let index = 0;
                for (; index < weights.length - 1; index++) {
                    pick -= weights[index];
                    if (pick <= 0)
                        break;
                }
                const key = eligible.splice(index, 1)[0];
                const old = s.stats[key]++;
                changes.push(`${statNames[key]} ${old} → ${s.stats[key]}`);
            }
        }
        s.levelRolls.push({ level: s.level, changes: [...changes], seed: s.seed });
        message(s, `Lên cấp ${s.level}. ${changes.length ? changes.join('; ') : 'Không tăng chỉ số lần này; cấp vẫn mở quyền học kỹ năng và nội tại.'} Không hồi đầy tài nguyên.`);
    }
    clampResources(s);
}
export const skillLevel = (s: State, id: string) => 1 + Math.floor((s.mastery[id] || 0) / 20);
