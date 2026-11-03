import { createGame, reduce, beginBattle, defaultFarm, type State } from './engine';
import { awardXp, trainStats, xpNeeded } from './progression';
import { maxHp, maxMp, maxSta, canEquip, skillMp, skillSta } from './balance';
import { items, monster, skills } from './content';
export function progressionStudy(samples = 100) {
    const results: {
        level: number;
        stats: State['stats'];
        capped: number;
        firstCap: number | null;
    }[] = [];
    const milestones: Record<number, number[]> = { 10: [], 25: [], 50: [], 75: [], 100: [] };
    for (let seed = 1; seed <= samples; seed++) {
        const s = createGame(Math.imul(seed, 2654435761) >>> 0);
        let firstCap: number | null = null;
        for (let level = 2; level <= 100; level++) {
            // 2,000 meaningful mixed exercise minutes per level: a long-term model,
            // not a claim that unreleased floors have been implemented.
            for (const k of ['strength', 'agility', 'vitality', 'intellect'] as const)
                trainStats(s, { [k]: 1000 }, `study:${level}:${k}`);
            awardXp(s, xpNeeded(s));
            if (firstCap === null && Object.values(s.stats).some(v => v === 20))
                firstCap = level;
            if (milestones[level])
                milestones[level].push(...Object.values(s.stats));
        }
        results.push({ level: s.level, stats: { ...s.stats }, capped: Object.values(s.stats).filter(v => v === 20).length, firstCap });
    }
    const keys = ['strength', 'agility', 'vitality', 'intellect'] as const;
    return { assumption: '100 cấp; mỗi cấp 2.000 phút hành động có ý nghĩa phân bổ đều, 2 XP rèn/phút, chia đều bốn chỉ số. Không mô phỏng nội dung tầng 4–100.', samples, mean: Object.fromEntries(keys.map(k => [k, Number((results.reduce((n, r) => n + r.stats[k], 0) / samples).toFixed(2))])), min: Math.min(...results.flatMap(r => Object.values(r.stats))), max: Math.max(...results.flatMap(r => Object.values(r.stats))), cappedAtEnd: results.reduce((n, r) => n + r.capped, 0), earliestCap: Math.min(...results.filter(r => r.firstCap !== null).map(r => r.firstCap!)), milestones: Object.fromEntries(Object.entries(milestones).map(([level, values]) => [level, { mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)), max: Math.max(...values), min: Math.min(...values) }])), examples: results.slice(0, 3) };
}
function setResourceFull(s: State) { s.hp = maxHp(s); s.mp = maxMp(s); s.sta = maxSta(s); }
export function bossStudy(floor: number, seed: number, defend = true) {
    let s = createGame(seed);
    const level = [2, 4, 6][floor - 1];
    while (s.level < level)
        awardXp(s, xpNeeded(s));
    // Prepared snapshot: level-specific shop gear, no hidden training grants.
    s.location = ['bell', 'heart', 'dawn'][floor - 1];
    s.floor = floor;
    s.unlocked = floor;
    s.visited.push(s.location);
    s.known.push(s.location);
    const gearIds = floor === 1 ? ['bow', 'ash0'] : floor === 2 ? ['staff', 'ash0', 'ash1', 'ash2'] : ['staff', 'ash0', 'ash1', 'ash2', 'ash5', 'ash6'];
    s.gear = [];
    s.equipped = {};
    for (const id of gearIds) {
        if (canEquip(s, id)) {
            const uid = s.nextId++;
            s.gear.push({ uid, id, durability: 100 });
            s.equipped[items.find(x => x.id === id)!.slot!] = uid;
        }
    }
    s.bag = { hp: 6, mp: 4, sta: 3 };
    s.active = floor === 1 ? ['shot', 'fire', 'heal', 'ward'] : floor === 2 ? ['fire', 'ice', 'heal', 'ward'] : ['light', 'fire', 'heal', 'ward'];
    setResourceFull(s);
    beginBattle(s, `boss${floor}`, true);
    const start = s.minutes;
    const startBags = { ...s.bag };
    for (let i = 0; i < 200 && s.battle && !s.choice; i++) {
        let action = 'attack';
        const b = s.battle;
        if (defend && b.round % 3 === 2)
            action = 'defend';
        else if (s.hp < maxHp(s) * .6 && s.bag.hp)
            action = 'potion:hp';
        else {
            const sk = skills.filter(k => s.active.includes(k.id) && k.mult > 0 && s.mp >= skillMp(s, k.id) && s.sta >= (skillSta[k.id] || 0) && !(b.cooldowns[k.id] > 0)).sort((a, c) => c.mult * (c.element === b.enemy.weak ? 1.5 : 1) - a.mult * (a.element === b.enemy.weak ? 1.5 : 1))[0];
            if (sk)
                action = sk.id;
            else if (s.mp < 4 && s.bag.mp)
                action = 'potion:mp';
            else if (s.sta < 3 && s.bag.sta)
                action = 'potion:sta';
        }
        s = reduce(s, { type: 'turn', id: action });
    }
    return { floor, level, seed, defend, win: s.flags.includes(`boss${floor}`), minutes: s.minutes - start, hp: Number(s.hp.toFixed(1)), stats: s.stats, consumed: Object.fromEntries(Object.entries(startBags).map(([k, n]) => [k, Math.max(0, n - (s.bag[k] || 0))])), enemyHp: monster(`boss${floor}`).hp };
}
export function farmStudy(seed: number) {
    let s = createGame(seed);
    s.location = 'grove';
    s.visited.push('grove');
    const before = s.gold;
    const startBags = { ...s.bag };
    s = reduce(s, { type: 'farm', config: { ...defaultFarm, duration: 180, target: 6, stopEmpty: false } });
    for (let i = 0; i < 1000 && s.activity; i++) {
        if (s.choice)
            break;
        s = reduce(s, { type: 'tick' });
    }
    const consumed = Object.fromEntries(['hp', 'mp', 'sta'].map(id => [id, Math.max(0, (startBags[id] || 0) - (s.bag[id] || 0))]));
    const potionCost = Object.entries(consumed).reduce((n, [id, q]) => n + items.find(i => i.id === id)!.price * q, 0);
    const repairCost = s.gear.reduce((n, g) => n + Math.ceil((100 - g.durability) / 15), 0);
    return { seed, repairCost, netAfterConsumablesAndRepair: s.gold - before - potionCost - repairCost, minutes: s.minutes - 360, kills: s.kills, earned: s.gold - before, potionCost, netBeforeLootAndRepair: s.gold - before - potionCost, consumed, baseStats: s.stats, stop: s.lastStop, failed: s.hp === 0 };
}
