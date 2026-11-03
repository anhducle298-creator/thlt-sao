import { item, items, monster, place, professions, quests, skills, titles, travelEvents, type Monster, type Slot } from './content';
import { BALANCE, statKeys, clampResources, effectiveStats, equippedGear, armor, damageReduction, attackPower, weaponPath, skillMp, skillSta, canEquip, loadRatio, weight, maxHp, maxMp, maxSta, staRegen, mpRegen, speed, dodge, retreatChance, safe, walkNet, type Stats, type Stat } from './balance';
import { awardXp, trainStats, random, message as log, xpNeeded } from './progression';
export { maxHp, maxMp, maxSta } from './balance';
export { random, xpNeeded } from './progression';
export type Gear = {
    uid: number;
    id: string;
    durability: number;
};
export type FarmConfig = {
    duration: number;
    target: number;
    hp: number;
    mp: number;
    sta: number;
    retreat: number;
    restBelow: number;
    resumeAbove: number;
    stopEmpty: boolean;
    stopDurability: boolean;
    loot: 'all' | 'rare';
    priority: string[];
};
export type Activity = {
    kind: 'travel' | 'farm' | 'rest' | 'sleep' | 'job' | 'gather' | 'training' | 'research';
    total: number;
    remaining: number;
    destination?: string;
    eventAt?: number;
    eventDone?: boolean;
    eventId?: string;
    config?: FarmConfig;
    kills: number;
    elapsed: number;
    phase: number;
    job?: string;
    training?: Stat;
    started: number;
    goldStart: number;
    xpStart: number;
    bagStart: Record<string, number>;
    durabilityStart: number;
    potionsUsed: number;
    loot: Record<string, number>;
    resting: boolean;
    stopRequested: boolean;
    recoveryMode?: boolean;
    output?: string;
    safeReturn?: boolean;
};
export type Choice = {
    kind: 'fork' | 'arrival' | 'encounter' | 'chest' | 'trap' | 'npc' | 'defeat' | 'ending' | 'clue' | 'traveler' | 'rescue' | 'quest';
    title: string;
    text: string;
    enemy?: string;
    quest?: string;
    eventId?: string;
    options: {
        id: string;
        label: string;
    }[];
};
export type Battle = {
    id: number;
    enemy: Monster;
    hp: number;
    round: number;
    cooldowns: Record<string, number>;
    poison: number;
    slow: number;
    shield: boolean;
    important: boolean;
    playerWait: number;
    enemyWait: number;
    endedAt?: number;
};
export type Recovery = {
    id: number;
    location: string;
    gold: number;
    bag: Record<string, number>;
    gear: Gear[];
    claimed: boolean;
    kind: 'drop' | 'camp' | 'curse';
};
export type State = {
    version: 2;
    seed: number;
    nextId: number;
    name: string;
    minutes: number;
    location: string;
    floor: number;
    unlocked: number;
    known: string[];
    visited: string[];
    marked: string[];
    edges: string[];
    hp: number;
    mp: number;
    sta: number;
    level: number;
    xp: number;
    totalXp: number;
    stats: Stats;
    hiddenXp: Stats;
    recent: Stats;
    levelRolls: {
        level: number;
        changes: string[];
        seed: number;
    }[];
    progressionReceipts: string[];
    gold: number;
    bank: number;
    bag: Record<string, number>;
    storage: Record<string, number>;
    storedGear: Gear[];
    gear: Gear[];
    equipped: Partial<Record<Slot, number>>;
    active: string[];
    mastery: Record<string, number>;
    weaponMastery: Record<string, number>;
    jobs: Record<string, number>;
    relationships: Record<string, number>;
    accepted: string[];
    claimed: string[];
    questBranches: Record<string, string>;
    questCounters: Record<string, number>;
    ownedTitles: string[];
    activeTitle: string | null;
    flags: string[];
    processedEvents: string[];
    kills: number;
    bosses: number;
    recovered: number;
    injury: number;
    activity: Activity | null;
    choice: Choice | null;
    battle: Battle | null;
    paused: boolean;
    mode: 'idle' | 'travel' | 'farm' | 'rest' | 'sleep' | 'job' | 'gather' | 'training' | 'research' | 'choice' | 'turn' | 'defeat';
    log: string[];
    summary: string | null;
    recoveries: Recovery[];
    lastStop: string;
};
export const defaultFarm: FarmConfig = { duration: 90, target: 8, hp: 45, mp: 20, sta: 15, retreat: 15, restBelow: 20, resumeAbove: 80, stopEmpty: true, stopDurability: true, loot: 'all', priority: ['slash', 'fire', 'heal', 'ward'] };
const zeros = (): Stats => ({ strength: 0, agility: 0, vitality: 0, intellect: 0 });
export function createGame(seed = Date.now() >>> 0): State {
    return { version: 2, seed: seed || 1, nextId: 2, name: 'An · Người lạc giới', minutes: 360, location: 'village', floor: 1, unlocked: 1, known: ['village', 'road', 'grove'], visited: ['village'], marked: [], edges: [], hp: 30, mp: 11, sta: 25, level: 1, xp: 0, totalXp: 0, stats: { strength: 3, agility: 4, vitality: 3, intellect: 2 }, hiddenXp: zeros(), recent: zeros(), levelRolls: [], progressionReceipts: [], gold: 75, bank: 0, bag: { hp: 5, mp: 3, sta: 2, escape: 1 }, storage: {}, storedGear: [], gear: [{ uid: 1, id: 'sword', durability: 100 }], equipped: { 'vũ khí': 1 }, active: ['slash', 'fire', 'heal', 'ward'], mastery: {}, weaponMastery: {}, jobs: {}, relationships: {}, accepted: ['first', 'hunt', 'tower', 'recovery', 'apprentice'], claimed: [], questBranches: {}, questCounters: {}, ownedTitles: [], activeTitle: null, flags: [], processedEvents: [], kills: 0, bosses: 0, recovered: 0, injury: 0, activity: null, choice: null, battle: null, paused: false, mode: 'idle', log: ['An, 28 tuổi, tỉnh dậy dưới bầu trời Eidolon. Nhiên, người giữ đèn 34 tuổi, trao bạn một thanh kiếm: “Hãy giữ lấy tên mình.” STR 3 · AGI 4 · VIT 3 · INT 2.'], summary: null, recoveries: [], lastStop: 'Chưa có hoạt động.' };
}
export const capacity = BALANCE.bagSlots;
export const bagSize = (s: State) => Object.values(s.bag).reduce((a, b) => a + b, 0) + s.gear.length;
function setMode(s: State) { s.mode = s.choice ? (s.choice.kind === 'defeat' ? 'defeat' : 'choice') : s.battle?.important ? 'turn' : s.activity?.kind || 'idle'; }
function prompt(s: State, c: Choice) { s.choice = c; setMode(s); }
function add(s: State, id: string, n = 1) {
    if (bagSize(s) + n > capacity) {
        log(s, `Túi đầy: để lại ${n} ${item(id).name}.`);
        return false;
    }
    if (item(id).slot)
        for (let i = 0; i < n; i++)
            s.gear.push({ uid: s.nextId++, id, durability: 100 });
    else
        s.bag[id] = (s.bag[id] || 0) + n;
    if (s.activity)
        s.activity.loot[id] = (s.activity.loot[id] || 0) + n;
    log(s, `Nhận ${item(id).name} ×${n}.`);
    return true;
}
function money(s: State, n: number, source: string) { s.gold += n; log(s, `${n >= 0 ? 'Nhận' : 'Chi'} ${Math.abs(n)} đồng · ${source}.`); }
const totalDurability = (s: State) => s.gear.reduce((n, g) => n + g.durability, 0);
function finish(s: State, why: string) {
    if (s.activity) {
        const a = s.activity;
        const loot = Object.entries(a.loot).map(([id, n]) => `${item(id).name} ×${n}`).join(', ') || 'không';
        s.summary = `${why} · ${s.minutes - a.started} phút · ${a.kills} quái · ${s.gold - a.goldStart >= 0 ? '+' : ''}${s.gold - a.goldStart} đồng · +${s.totalXp - a.xpStart} XP · đồ: ${loot} · ${a.potionsUsed} thuốc · độ bền hao ${Math.max(0, a.durabilityStart - totalDurability(s)).toFixed(0)} điểm.`;
        log(s, s.summary);
    }
    s.lastStop = why;
    s.activity = null;
    s.battle = null;
    setMode(s);
}
function activity(s: State, kind: Activity['kind'], minutes: number): Activity { return { kind, total: minutes, remaining: minutes, kills: 0, elapsed: 0, phase: 2, started: s.minutes, goldStart: s.gold, xpStart: s.totalXp, bagStart: { ...s.bag }, durabilityStart: totalDurability(s), potionsUsed: 0, loot: {}, resting: false, stopRequested: false }; }
function start(s: State, a: Activity) { s.activity = a; s.summary = null; s.paused = false; setMode(s); }
function advance(s: State) { s.minutes++; if (s.activity)
    s.activity.elapsed++; if (s.injury > 0)
    s.injury--; }
function recover(s: State, multiplier: number) {
    const staBoost = s.level >= 3 ? 1.05 : 1, mpBoost = s.level >= 5 ? 1.05 : 1;
    s.sta += staRegen(s) * multiplier * staBoost;
    s.mp += mpRegen(s) * multiplier * mpBoost;
    s.hp += .08 * multiplier;
    clampResources(s);
}
function elapsedMinutes(s: State, n: number) { for (let i = 0; i < n; i++) {
    advance(s); /* Scripted decisions use time, never passive regeneration. */
} }
function edge(a: string, b: string) { return [a, b].sort().join('|'); }
function startTravel(s: State, dest: string, returning = false) {
    const p = place(dest);
    if (!p || !s.known.includes(dest) || dest === s.location)
        return;
    const current = place(s.location);
    const portal = dest === 'village' || (p.floor <= s.unlocked && ['root', 'quay'].includes(dest));
    if ((!current.links.includes(dest) && !portal) || p.floor > s.unlocked)
        return;
    if (loadRatio(s) > 1.5) {
        log(s, 'Quá tải trên 150%: cất hoặc bỏ bớt đồ trước khi đi.');
        return;
    }
    const a = activity(s, 'travel', p.minutes || 12);
    a.destination = dest;
    a.eventAt = Math.floor(a.total / 2);
    a.eventDone = s.edges.includes(edge(s.location, dest));
    a.safeReturn = returning;
    start(s, a);
    log(s, `Lên đường tới ${p.name}: ${a.total} phút đi bộ · tải ${weight(s).toFixed(1)} kg.`);
}
export function beginBattle(s: State, id: string, important = false) { const m = monster(id); s.battle = { id: s.nextId++, enemy: { ...m }, hp: m.hp, round: 0, cooldowns: {}, poison: 0, slow: 0, shield: false, important: important || !!m.special, playerWait: 0, enemyWait: 0 }; setMode(s); log(s, `${m.name} xuất hiện. Yếu: ${m.weak}; kháng: ${m.resist}.`); }
function lose(s: State, m: Monster) {
    const a = s.activity;
    const lostGold = Math.floor(s.gold * .65);
    const lostGear = [...s.gear];
    const lostBag = { ...s.bag };
    delete lostBag.key;
    delete lostBag.parcel;
    s.bag = { key: s.bag.key || 0, parcel: s.bag.parcel || 0 };
    s.gold -= lostGold;
    s.gear = [];
    s.equipped = {};
    const site = m.kind === 'organized' ? (s.floor >= 2 ? 'camp' : 'mine') : s.location;
    if (!s.known.includes(site))
        s.known.push(site);
    s.recoveries.push({ id: s.nextId++, location: site, gold: lostGold, bag: lostBag, gear: lostGear, claimed: false, kind: m.kind === 'organized' ? 'camp' : m.kind === 'cursed' ? 'curse' : 'drop' });
    s.injury = 60;
    s.hp = 0;
    const elapsed = a ? s.minutes - a.started : 0;
    s.activity = null;
    s.battle = null;
    s.lastStop = 'Thất bại — chờ quyết định cứu hộ';
    s.summary = `Thất bại sau ${elapsed} phút. Mất ${lostGold} đồng, ${Object.values(lostBag).reduce((a, b) => a + b, 0)} vật phẩm và ${lostGear.length} trang bị. Giữ cấp, thành thạo, kho và ngân hàng. Tỉnh lại ở Làng Đèn Cuối sau cứu hộ của Dạ. Phí ${rescueFee(s)} đồng (trừ tối đa tiền còn mang). Suy yếu 60 phút (-20% công). Manh mối: tài sản tại ${place(site).name}.`;
    prompt(s, { kind: 'defeat', title: m.kind === 'organized' ? 'Sau song sắt' : m.kind === 'cursed' ? 'Lời nguyền tro' : 'Một bàn tay trong bóng tối', text: s.summary, options: m.kind === 'organized' ? [{ id: 'sneak', label: 'Trốn qua cống · 30 phút, thêm 30 phút suy yếu' }, { id: 'rescue', label: 'Chờ Dạ cứu · 60 phút' }] : [{ id: 'rescue', label: 'Để Dạ đưa về làng · 30 phút' }] });
    log(s, s.summary);
}
const rescueFee = (s: State) => s.activeTitle === 'survivor' ? 3 : 5;
export const buyPrice = (s: State, id: string) => Math.ceil(item(id).price * (s.activeTitle === 'merchant' ? .95 : 1));
function usePotion(s: State, id: string) {
    if (!s.bag[id])
        return false;
    if (id === 'hp' || id === 'soup') {
        if (s.hp >= maxHp(s))
            return false;
        s.hp = Math.min(maxHp(s), s.hp + item(id).power);
    }
    else if (id === 'mp') {
        if (s.mp >= maxMp(s))
            return false;
        s.mp = Math.min(maxMp(s), s.mp + item(id).power);
    }
    else if (id === 'sta') {
        if (s.sta >= maxSta(s))
            return false;
        s.sta = Math.min(maxSta(s), s.sta + item(id).power);
    }
    else
        return false;
    s.bag[id]--;
    if (s.activity)
        s.activity.potionsUsed++;
    log(s, `Dùng ${item(id).name}.`);
    return true;
}
function retreat(s: State, guaranteed = false) {
    const b = s.battle;
    if (!b)
        return;
    if (b.enemy.boss) {
        log(s, 'Boss đã khóa cổng, không thể bỏ chạy.');
        return;
    }
    const chance = retreatChance(s);
    if (guaranteed || random(s) < chance) {
        trainStats(s, { agility: 1 }, `escape:${b.id}`);
        finish(s, 'Rút lui thành công; kết thúc hoạt động');
        log(s, guaranteed ? 'Ấn thoát hiểm đã tiêu hao, đưa bạn về điểm xuất phát trận.' : `Bạn thoát vòng vây (cơ hội ${(chance * 100).toFixed(0)}%).`);
    }
    else {
        log(s, `Rút lui thất bại: đối thủ chặn lối (cơ hội ${(chance * 100).toFixed(0)}%).`);
        enemyAttack(s, false);
    }
}
function victory(s: State) {
    const b = s.battle!;
    const m = b.enemy;
    awardXp(s, m.xp);
    money(s, m.gold, `hạ ${m.name}`);
    s.kills++;
    if (s.activity)
        s.activity.kills++;
    if (m.boss && !s.flags.includes(m.id)) {
        s.flags.push(m.id);
        s.bosses++;
        s.unlocked = Math.min(3, s.bosses + 1);
        if (s.bosses < 3) {
            const dest = s.bosses === 1 ? 'root' : 'quay';
            if (!s.known.includes(dest))
                s.known.push(dest);
        }
        else
            log(s, 'Đã hoàn thành bản thử nghiệm: 3 tầng chơi được. Tầng 4–100 chưa phát hành; quyết định kết thúc chỉ dành cho tầng 100.');
    }
    else if (m.special && !s.flags.includes(m.id))
        s.flags.push(m.id);
    const lootFilter = s.activity?.config?.loot || 'all';
    if (lootFilter === 'all') {
        add(s, random(s) < .5 ? 'herb' : 'fang');
        if (random(s) < .3)
            add(s, 'cloth');
    }
    if (random(s) < .12) {
        const pool = items.filter(i => i.slot && i.id !== 'moonblade' && (s.floor > 1 || !['staff', 'axe'].includes(i.id)) && (lootFilter === 'all' || i.rarity !== 'Thường'));
        if (pool.length)
            add(s, pool[Math.floor(random(s) * pool.length)].id);
    }
    if (m.id === 'boss3' && !s.flags.includes('moonblade-reward')) {
        if (add(s, 'moonblade'))
            s.flags.push('moonblade-reward');
    }
    if (!m.boss && (s.bag.key || 0) < 3)
        add(s, 'key');
    for (const g of equippedGear(s))
        g.durability = Math.max(0, g.durability - 1);
    clampResources(s);
    log(s, `Hạ ${m.name}: +${m.xp} XP. Không có thưởng khi đứng chờ.`);
    s.battle = null;
    if (s.activity) {
        s.activity.phase = 3;
        if (s.activity.stopRequested) {
            finish(s, 'Đã dừng ở cuối trận');
            return;
        }
    }
    if (m.id === 'leader1' && !s.flags.includes('courier'))
        prompt(s, { kind: 'rescue', title: 'Người đưa thư sau hàng rào', text: 'Lâm, 31 tuổi, bị giam cạnh kho. Bạn có thể mở khóa cẩn thận hoặc phá hàng rào; cả hai đều giải cứu anh ấy nhưng để lại kết quả khác nhau.', options: [{ id: 'unlock', label: 'Mở khóa cẩn thận · 6 phút, quan hệ Dạ +3' }, { id: 'break', label: 'Phá hàng rào · 3 phút, mất 3 STA, nhận vải' }] });
    else if (m.id === 'boss3')
        prompt(s, { kind: 'ending', title: 'Bình minh đầu tiên', text: `Bạn đã vượt ba tầng của bản đầu. ${s.flags.includes('generous') ? 'Nhiên nhớ những lần bạn giúp đỡ không đòi thù lao.' : 'Những hợp đồng đã giúp làng đứng vững.'} Quan hệ Nhiên: ${s.relationships.Nhiên || 0}. Hành trình 100 tầng còn ở phía trước.`, options: [{ id: 'continue', label: 'Trở lại khám phá 3 tầng đã mở' }] });
    setMode(s);
}
function meaningful(s: State) { return !!s.battle && s.battle.enemy.xp >= s.level * 5; }
function enemyAttack(s: State, defending: boolean) {
    const b = s.battle;
    if (!b || b.hp <= 0 || s.hp <= 0)
        return;
    const charged = b.enemy.boss && b.round % 3 === 0;
    if (!defending && s.sta >= 1 && random(s) < dodge(s)) {
        s.sta -= 1;
        log(s, 'Né thành công · -1 STA.');
        if (meaningful(s))
            trainStats(s, { agility: 1 }, `dodge:${b.id}:${b.round}`);
        return;
    }
    const v = effectiveStats(s);
    const resistPhysical = Math.min(.2, v.vitality * .004);
    let dmg = b.enemy.atk * (charged ? 3 : 1) * (1 - damageReduction(armor(s))) * (1 - resistPhysical);
    if (charged && !defending && !b.shield) {
        if (b.enemy.id === 'boss2') {
            s.sta = Math.max(0, s.sta - 3);
            log(s, 'Rễ siết hút 3 STA vì không phòng thủ.');
        }
        if (b.enemy.id === 'boss3') {
            s.mp = Math.max(0, s.mp - 2);
            log(s, 'Mũi khâu hồn rút 2 MP vì không phòng thủ.');
        }
    }
    if (defending || b.shield)
        dmg *= .3;
    if (b.shield && meaningful(s)) {
        s.mastery.ward = (s.mastery.ward || 0) + 1;
        trainStats(s, { intellect: .5 }, `ward:${b.id}:${b.round}`);
    }
    b.shield = false;
    s.hp = Math.max(0, s.hp - Math.max(1, Math.round(dmg)));
    log(s, `${b.enemy.name}${charged ? ' tung đòn tích lực' : ''}: -${Math.max(1, Math.round(dmg))} HP${defending ? ' · phòng thủ' : ''}.`);
    if (s.hp <= 0)
        lose(s, b.enemy);
}
function playerAttack(s: State, action: string) {
    const b = s.battle;
    if (!b || s.hp <= 0)
        return;
    if (action === 'defend') {
        s.sta = Math.min(maxSta(s), s.sta + .6);
        log(s, 'Phòng thủ: hồi chủ động 0,6 STA; giảm 70% sát thương vòng này.');
        return;
    }
    if (action.startsWith('potion:')) {
        usePotion(s, action.slice(7));
        return;
    }
    const sk = skills.find(k => k.id === action);
    if (sk) {
        s.mp -= skillMp(s, sk.id);
        s.sta -= skillSta[sk.id] || 0;
        b.cooldowns[sk.id] = sk.cd;
        if (sk.effect === 'hồi') {
            const healed = Math.min(maxHp(s) - s.hp, 6 + effectiveStats(s).intellect * 2);
            s.hp += healed;
            if (healed > 0 && meaningful(s)) {
                s.mastery[sk.id] = (s.mastery[sk.id] || 0) + 1;
                trainStats(s, { intellect: 1 }, `spell:${b.id}:${b.round}`);
            }
            log(s, `Mạch sống: +${healed.toFixed(1)} HP.`);
            return;
        }
        if (sk.effect === 'khiên') {
            b.shield = true;
            return;
        }
        if (sk.effect === 'độc')
            b.poison = 3;
        if (sk.effect === 'chậm')
            b.slow = 2;
    }
    const element = sk?.element || 'vật lý';
    const multiplier = element === b.enemy.weak ? 1.5 : element === b.enemy.resist ? .7 : 1;
    const critical = random(s) < Math.min(BALANCE.critCap, .03 + effectiveStats(s).agility * .006);
    const dmg = Math.max(1, Math.round(attackPower(s, action) * (sk?.mult || 1) * multiplier * (critical ? 1.4 : 1) * (1 + Math.min(.15, (s.mastery[action] || 0) / 400))));
    b.hp = Math.max(0, b.hp - dmg);
    log(s, `${sk?.name || 'Đánh yếu / tấn công'}: ${dmg} sát thương${critical ? ' · chí mạng' : ''}${multiplier > 1 ? ' · trúng điểm yếu' : ''}.`);
    if (meaningful(s)) {
        const path = sk?.path === 'phép' ? 'phép' : sk?.path === 'cung' ? 'cung' : weaponPath(s);
        s.weaponMastery[path] = (s.weaponMastery[path] || 0) + 1;
        if (sk)
            s.mastery[action] = (s.mastery[action] || 0) + 1;
        const magic = sk?.path === 'phép';
        const agile = sk?.path === 'cung' || path === 'dao' || path === 'cung';
        trainStats(s, magic ? { intellect: 1.5 } : agile ? { agility: 1, strength: .25 } : { strength: path === 'rìu' ? 1.5 : .8, vitality: .15 }, `hit:${b.id}:${b.round}`);
    }
}
export function skillAvailable(s: State, id: string) { const k = skills.find(k => k.id === id); return !!k && s.active.includes(id) && s.mp + 1e-8 >= skillMp(s, id) && s.sta + 1e-8 >= (skillSta[id] || 0) && !((s.battle?.cooldowns[id] || 0) > 0); }
function validCombatAction(s: State, action: string) {
    const b = s.battle!;
    if (skills.some(k => k.id === action))
        return skillAvailable(s, action);
    if (['attack', 'defend'].includes(action))
        return true;
    if (action === 'flee')
        return !b.enemy.boss;
    if (action === 'escape')
        return !!s.bag.escape && !b.enemy.boss;
    return action.startsWith('potion:') && ['hp', 'mp', 'sta', 'soup'].includes(action.slice(7)) && (s.bag[action.slice(7)] || 0) > 0;
}
function battleStep(s: State, action: string) {
    let b = s.battle;
    if (!b || !validCombatAction(s, action)) {
        log(s, 'Hành động chưa sẵn sàng: kiểm tra ô kỹ năng, MP, STA và hồi chiêu.');
        return;
    }
    advance(s);
    b.round++;
    for (const key of Object.keys(b.cooldowns))
        b.cooldowns[key] = Math.max(0, b.cooldowns[key] - 1);
    if (action === 'flee') {
        retreat(s);
        if (s.battle)
            endRound(s);
        return;
    }
    if (action === 'escape') {
        s.bag.escape--;
        retreat(s, true);
        return;
    }
    const playerReady = b.important || b.playerWait <= 0, enemyReady = b.important || b.enemyWait <= 0;
    const enemySpeed = Math.min(BALANCE.speedCap, b.enemy.speed - (b.slow > 0 ? 2 : 0));
    const player = () => { if (!s.battle)
        return; if (playerReady) {
        playerAttack(s, action);
        b!.playerWait = Math.max(0, Math.ceil(8 / Math.max(1, speed(s))) - 1);
    }
    else
        b!.playerWait--; };
    const enemy = () => { if (!s.battle || b!.hp <= 0)
        return; if (enemyReady) {
        enemyAttack(s, action === 'defend');
        b!.enemyWait = Math.max(0, Math.ceil(8 / Math.max(1, enemySpeed)) - 1);
    }
    else
        b!.enemyWait--; };
    if (speed(s) >= enemySpeed) {
        player();
        enemy();
    }
    else {
        enemy();
        player();
    }
    if (s.battle)
        endRound(s);
}
function endRound(s: State) {
    const b = s.battle!;
    if (b.poison > 0) {
        b.hp = Math.max(0, b.hp - 2);
        b.poison--;
    }
    if (b.slow > 0)
        b.slow--;
    if (s.hp <= 0) {
        lose(s, b.enemy);
        return;
    }
    if (b.hp <= 0) {
        victory(s);
        return;
    }
    if (b.enemy.boss && b.round % 3 === 2)
        log(s, '⚠ Boss tụ lực. Vòng tới sát thương gấp ba — hãy phòng thủ!');
}
function autoAction(s: State) {
    const c = s.activity?.config || defaultFarm;
    if (s.hp / maxHp(s) * 100 <= c.retreat && !s.battle!.enemy.boss)
        return 'flee';
    for (const [id, current, maximum, threshold] of [['hp', s.hp, maxHp(s), c.hp], ['mp', s.mp, maxMp(s), c.mp], ['sta', s.sta, maxSta(s), c.sta]] as const)
        if (current / maximum * 100 <= threshold && s.bag[id])
            return `potion:${id}`;
    return c.priority.find(id => { const k = skills.find(k => k.id === id); return skillAvailable(s, id) && (k?.effect !== 'hồi' || s.hp < maxHp(s) * .65) && (k?.effect !== 'khiên' || s.battle!.round % 3 === 2); }) || 'attack';
}
function routeEvent(s: State, a: Activity) {
    a.eventDone = true;
    const candidates = travelEvents.filter(e => e.minFloor <= s.floor);
    let roll = random(s) * candidates.reduce((n, e) => n + e.weight, 0);
    const event = candidates.find(e => (roll -= e.weight) < 0)!;
    const eventId = `${edge(s.location, a.destination!)}:${event.id}`;
    a.eventId = eventId;
    if (s.processedEvents.includes(eventId))
        return;
    s.processedEvents.push(eventId);
    const options = (kind: Choice['kind'], title: string, text: string, options: Choice['options'], enemy?: string) => prompt(s, { kind, title, text, options, eventId, enemy });
    if (event.kind === 'encounter') {
        const id = place(a.destination!).enemies.find(id => !monster(id).special);
        if (id)
            options('encounter', 'Tiếng động bên đường', `${monster(id).name} chắn lối. Chiến đấu cộng thời gian riêng, không giảm số phút đi bộ.`, [{ id: 'fight', label: 'Đánh tự động' }, { id: 'avoid', label: 'Đi vòng · 3 phút' }, { id: 'leave', label: 'Rút về điểm xuất phát' }], id);
    }
    else if (event.kind === 'chest')
        options('chest', 'Rương dưới lớp tro', 'Mở chiếc rương này mất 2 phút.', [{ id: 'open', label: 'Mở rương' }, { id: 'ignore', label: 'Tiếp tục' }]);
    else if (event.kind === 'trap')
        options('trap', 'Sợi chỉ trên đường', 'Tháo dây bẫy mất 3 phút. Vượt nhanh cần 2 STA; có thể bị thương.', [{ id: 'disarm', label: 'Tháo bẫy' }, { id: 'rush', label: 'Vượt chướng ngại' }]);
    else if (event.kind === 'clue')
        options('clue', 'Dấu đèn trên đá', 'Văn tự cổ chỉ về một lối đi. Đọc mất 3 phút, rèn trí lực và mở một địa điểm kề bên.', [{ id: 'read', label: 'Giải dấu vết' }, { id: 'ignore', label: 'Để lại dấu vết' }]);
    else
        options('traveler', 'Người lữ hành bên đèn', 'Một người trưởng thành bị thương nhẹ xin 5 đồng mua băng vải. Giúp đỡ thay đổi quan hệ Dạ.', [{ id: 'help', label: 'Giúp 5 đồng · quan hệ Dạ +2' }, { id: 'ignore', label: 'Chỉ đường về làng' }]);
}
function tick(s: State) {
    if (s.paused || s.choice || s.battle?.important || !s.activity)
        return;
    const a = s.activity;
    if (s.battle) {
        battleStep(s, autoAction(s));
        return;
    }
    if (a.stopRequested) {
        finish(s, 'Đã dừng ở ranh giới hành động');
        return;
    }
    if (a.kind === 'farm') {
        const c = a.config!;
        if (a.elapsed >= c.duration || a.kills >= c.target) {
            finish(s, 'Đã đạt mục tiêu farm');
            return;
        }
        if (bagSize(s) >= capacity || loadRatio(s) > 1.5 || (c.stopEmpty && (!s.bag.hp || !s.bag.mp || !s.bag.sta)) || (c.stopDurability && s.gear.some(g => Object.values(s.equipped).includes(g.uid) && g.durability <= 10))) {
            finish(s, 'Farm dừng: túi/tải đầy, hết một loại thuốc hoặc độ bền ≤ 10%');
            return;
        }
        if (s.sta / maxSta(s) * 100 <= c.restBelow)
            a.resting = true;
        if (a.resting) {
            if (!safe(s)) {
                finish(s, 'STA thấp — không an toàn để nghỉ; rút về làng, cần bật farm lại sau khi hồi');
                startTravel(s, 'village', true);
                return;
            }
            advance(s);
            recover(s, 2);
            if (s.sta / maxSta(s) * 100 >= c.resumeAbove) {
                a.resting = false;
                a.phase = 2;
                log(s, 'STA đạt ngưỡng tiếp tục; trở lại tìm quái.');
            }
            return;
        }
        advance(s);
        s.sta = Math.max(0, s.sta - BALANCE.searchCost);
        if (--a.phase <= 0) {
            const candidates = place(s.location).enemies.filter(id => !monster(id).special);
            if (!candidates.length) {
                finish(s, 'Không có quái thường tại đây');
                return;
            }
            if (a.kills > 0 && a.kills % 7 === 0 && !a.eventDone) {
                a.eventDone = true;
                prompt(s, { kind: 'encounter', title: 'Thủ lĩnh chặn đường', text: 'Farm dừng để chờ quyết định. Trận quan trọng xử lý từng vòng.', enemy: s.floor === 1 ? 'leader1' : 'leader2', options: [{ id: 'fight', label: 'Giao chiến theo lượt' }, { id: 'leave', label: 'Kết thúc farm' }] });
            }
            else
                beginBattle(s, candidates[Math.floor(random(s) * candidates.length)]);
        }
        return;
    }
    if (a.kind === 'travel' && s.sta <= 0) {
        if (a.safeReturn) {
            advance(s);
            recover(s, .25);
            return;
        }
        finish(s, 'STA cạn — nghỉ hoặc dùng nước hạt đèn trước khi tiếp tục đi');
        return;
    }
    advance(s);
    if (a.kind === 'rest' || a.kind === 'sleep') {
        recover(s, a.kind === 'sleep' ? 4 : safe(s) ? 2 : 1);
    }
    if (a.kind === 'travel') {
        const ratio = loadRatio(s);
        s.sta = Math.max(0, Math.min(maxSta(s), s.sta + walkNet(s)));
        s.mp = Math.min(maxMp(s), s.mp + mpRegen(s) * .25);
        if (ratio <= 1)
            trainStats(s, { vitality: .25, strength: ratio >= .5 ? .15 : 0 }, `walk:${s.minutes}`);
    }
    if (a.kind === 'gather') {
        s.sta = Math.max(0, s.sta - BALANCE.gatherCost);
        trainStats(s, { strength: .3, vitality: .15 }, `gather:${s.minutes}`);
    }
    if (a.kind === 'training') {
        if (s.sta < .5 && a.training !== 'intellect') {
            a.remaining++;
            recover(s, 1);
        }
        else {
            if (a.training !== 'intellect')
                s.sta -= .5;
            else if (s.mp >= .05)
                s.mp -= .05;
            trainStats(s, { [a.training!]: 2 }, `train:${s.minutes}`);
        }
    }
    if (a.kind === 'research') {
        trainStats(s, { intellect: 1.5 }, `research:${s.minutes}`);
        if (s.accepted.includes('runes'))
            s.questCounters.runes = (s.questCounters.runes || 0) + 1;
    }
    if (a.kind === 'job') {
        if (a.job === 'tavern')
            trainStats(s, { vitality: .1, agility: .1 }, `job:${s.minutes}`);
    }
    a.remaining--;
    if (a.kind === 'travel' && !a.eventDone && a.remaining === a.eventAt) {
        routeEvent(s, a);
        return;
    }
    if (a.remaining > 0)
        return;
    if (a.kind === 'travel') {
        const old = s.location;
        s.location = a.destination!;
        s.floor = place(s.location).floor;
        if (!s.edges.includes(edge(old, s.location)))
            s.edges.push(edge(old, s.location));
        if (!s.visited.includes(s.location))
            s.visited.push(s.location);
        if (s.location === 'root' && s.accepted.includes('cargo') && s.bag.parcel) {
            s.bag.parcel--;
            s.questCounters.cargo = 1;
            log(s, 'Kiện hàng đã giao tại Bến rễ. Có thể nhận thù lao nhiệm vụ.');
        }
        const returning = a.safeReturn;
        finish(s, `Đã tới ${place(s.location).name}`);
        if (returning) {
            start(s, activity(s, 'rest', Math.ceil((maxSta(s) - s.sta) / (staRegen(s) * 2)) || 1));
            log(s, 'Tự nghỉ sau khi rút về. Farm không tự khởi động lại.');
        }
        else
            prompt(s, { kind: 'arrival', title: place(s.location).name, text: place(s.location).description, options: [{ id: 'explore', label: 'Khám phá địa điểm · 3 phút' }, { id: 'mark', label: 'Đánh dấu để quay lại' }, { id: 'ignore', label: 'Dừng chân, chưa khảo sát' }] });
    }
    else if (a.kind === 'rest' || a.kind === 'sleep')
        finish(s, 'Đã kết thúc khoảng nghỉ; tài nguyên hồi theo thời gian thực tế');
    else if (a.kind === 'gather') {
        add(s, 'herb', 2);
        add(s, 'ore');
        finish(s, 'Thu thập xong');
    }
    else if (a.kind === 'job') {
        const j = professions.find(j => j.id === a.job)!;
        s.jobs[j.id] = (s.jobs[j.id] || 0) + 1;
        const output = a.output ?? j.output;
        if (output)
            add(s, output);
        else {
            money(s, 12 + Math.min(5, Math.floor((s.jobs[j.id] || 0) / 5)), 'tiền công quán rượu');
            s.relationships.Nhiên = (s.relationships.Nhiên || 0) + 1;
        }
        finish(s, `Hoàn thành ${j.name}`);
    }
    else
        finish(s, a.kind === 'training' ? 'Hoàn thành luyện tập — động tác có kiểm soát hơn, tiến bộ được giữ lại' : 'Hoàn thành nghiên cứu — các ký tự đang trở nên quen thuộc');
}
export type Action = {
    type: string;
    id?: string;
    value?: number;
    config?: FarmConfig;
};
export function canAccept(s: State, id: string) { const q = quests.find(q => q.id === id); return !!q && !s.accepted.includes(id) && !s.claimed.includes(id) && q.requires.every(k => s.claimed.includes(k)) && (s.relationships.Nhiên || 0) >= q.relation && (id !== 'cargo' || s.unlocked >= 2); }
export function reduce(original: State, action: Action): State {
    const s = structuredClone(original);
    const { type, id, value } = action;
    if (type === 'tick') {
        tick(s);
        return s;
    }
    if (type === 'pause') {
        s.paused = !s.paused;
        return s;
    }
    if (type === 'cancel') {
        if (s.choice || s.battle?.important)
            return s;
        if (s.battle) {
            s.activity!.stopRequested = true;
            log(s, 'Đã yêu cầu dừng tự động sau trận; bạn có thể thử rút lui ngay.');
            return s;
        }
        finish(s, 'Đã hủy hoạt động');
        return s;
    }
    if (type === 'retreat' && s.battle && !s.battle.important) {
        battleStep(s, s.bag.escape && id === 'escape' ? 'escape' : 'flee');
        return s;
    }
    if (type === 'turn') {
        if (s.battle?.important && !s.choice)
            battleStep(s, id!);
        return s;
    }
    if (type === 'choose') {
        const c = s.choice;
        if (!c || !c.options.some(o => o.id === id))
            return s;
        s.choice = null;
        if (c.kind === 'defeat') {
            elapsedMinutes(s, id === 'sneak' ? 30 : c.title === 'Sau song sắt' ? 60 : 30);
            if (id === 'sneak')
                s.injury += 30;
            else
                money(s, -Math.min(s.gold, rescueFee(s)), 'cứu hộ của Dạ');
            s.location = 'village';
            s.floor = 1;
            s.hp = maxHp(s) * .5;
            s.mp = maxMp(s) * .5;
            s.sta = maxSta(s) * .5;
            if (!s.gear.some(g => item(g.id).slot === 'vũ khí')) {
                add(s, 'sword');
                s.equipped['vũ khí'] = s.gear.at(-1)!.uid;
                log(s, 'Dạ trao kiếm cơ bản; không thể kẹt vì mất vũ khí.');
            }
            log(s, id === 'sneak' ? 'Bạn trốn qua cống về làng; vết thương nặng hơn.' : 'Dạ đưa bạn tỉnh lại ở Làng Đèn Cuối.');
        }
        else if (c.kind === 'encounter') {
            if (id === 'fight')
                beginBattle(s, c.enemy!, !!monster(c.enemy!).special);
            if (id === 'avoid') {
                elapsedMinutes(s, 3);
                trainStats(s, { agility: 1, vitality: .3 }, `avoid:${c.eventId || s.minutes}`);
                log(s, 'Đi vòng an toàn · 3 phút.');
            }
            if (id === 'leave')
                finish(s, 'Đã rút khỏi hành trình');
        }
        else if (c.kind === 'arrival') {
            if (id === 'explore') {
                elapsedMinutes(s, 3);
                for (const n of place(s.location).links)
                    if (!s.known.includes(n))
                        s.known.push(n);
                log(s, 'Khảo sát xong: đã biết các lối kề bên, chưa tính là đã đi qua.');
            }
            else if (id === 'mark') {
                if (!s.marked.includes(s.location))
                    s.marked.push(s.location);
                log(s, 'Đã đánh dấu địa điểm để quay lại.');
            }
            else
                log(s, 'Bạn dừng chân, chưa khảo sát các lối mới.');
        }
        else if (c.kind === 'fork')
            startTravel(s, id!);
        else if (c.kind === 'chest') {
            if (id === 'open') {
                elapsedMinutes(s, 2);
                money(s, 8, 'rương đồng');
                add(s, 'hp');
            }
            else
                log(s, 'Để lại rương; sự kiện tuyến này đã được ghi nhận.');
        }
        else if (c.kind === 'trap') {
            if (id === 'disarm') {
                elapsedMinutes(s, 3);
                add(s, 'cloth');
                trainStats(s, { agility: 1, intellect: .3 }, `trap:${c.eventId}`);
            }
            else {
                elapsedMinutes(s, 1);
                if (s.sta >= 2) {
                    s.sta -= 2;
                    trainStats(s, { agility: 1.5 }, `trap:${c.eventId}`);
                    log(s, 'Vượt dây bẫy thành công, tốn 2 STA.');
                }
                else {
                    s.hp = Math.max(1, s.hp - 4);
                    log(s, 'Không đủ STA để vượt đẹp: trầy xước, mất 4 HP.');
                }
            }
        }
        else if (c.kind === 'clue') {
            if (id === 'read') {
                elapsedMinutes(s, 3);
                trainStats(s, { intellect: 2 }, `clue:${c.eventId}`);
                const n = place(s.location).links.find(n => !s.known.includes(n));
                if (n)
                    s.known.push(n);
                log(s, 'Đã giải dấu đèn: tri thức về lối đi được bổ sung.');
            }
            else
                log(s, 'Đã ghi nhớ dấu vết để nhường đường.');
        }
        else if (c.kind === 'traveler') {
            if (id === 'help' && s.gold >= 5) {
                money(s, -5, 'giúp người lữ hành');
                s.relationships.Dạ = (s.relationships.Dạ || 0) + 2;
                s.flags.push('helped-traveler');
            }
            else
                log(s, 'Bạn chỉ hướng an toàn về làng; không mất tiền.');
        }
        else if (c.kind === 'rescue') {
            elapsedMinutes(s, id === 'unlock' ? 6 : 3);
            s.flags.push('courier');
            s.questBranches.rescue = id!;
            if (id === 'unlock') {
                s.relationships.Dạ = (s.relationships.Dạ || 0) + 3;
                trainStats(s, { agility: 2 }, 'rescue-lock');
            }
            else {
                s.sta = Math.max(0, s.sta - 3);
                add(s, 'cloth');
                trainStats(s, { strength: 2 }, 'rescue-break');
            }
            log(s, `Lâm đã được cứu bằng cách ${id === 'unlock' ? 'mở khóa' : 'phá hàng rào'}, trở lại mạng lưới đưa thư.`);
        }
        else if (c.kind === 'npc') {
            const daily = `talk:${Math.floor(s.minutes / 1440)}`;
            if (id === 'talk' && !s.flags.includes(daily)) {
                s.flags.push(daily);
                s.relationships.Nhiên = (s.relationships.Nhiên || 0) + 2;
                log(s, 'Nhiên kể về nhà cũ. Quan hệ +2 (mỗi ngày một lần).');
            }
            else if (id === 'work' && !s.flags.includes('gift')) {
                s.flags.push('gift');
                add(s, 'herb', 2);
                s.relationships.Nhiên = (s.relationships.Nhiên || 0) + 1;
                log(s, 'Nhiên trao thảo dược, chỉ bạn cách nhận việc.');
            }
            else
                log(s, 'Nhiên mỉm cười: “Khi nào có chuyện mới, hãy ghé lại.” Không thay đổi quan hệ lần này.');
        }
        else if (c.kind === 'quest') {
            const q = quests.find(q => q.id === c.quest)!;
            const branch = q.branches.find(b => b.id === id)!;
            if (!s.claimed.includes(q.id) && s.accepted.includes(q.id) && questProgress(s, q.kind) >= q.target) {
                const slots = Object.values(q.items).reduce((a, b) => a + b, 0);
                if (bagSize(s) + slots - (q.kind === 'herb' ? q.target : 0) > capacity) {
                    log(s, 'Chưa đủ chỗ nhận phần thưởng; hãy dọn túi rồi báo cáo lại.');
                    setMode(s);
                    return s;
                }
                if (q.kind === 'herb')
                    s.bag.herb -= q.target;
                s.claimed.push(q.id);
                s.questBranches[q.id] = id!;
                if (branch.flag && !s.flags.includes(branch.flag))
                    s.flags.push(branch.flag);
                money(s, Math.floor(q.reward * branch.goldFactor), `nhiệm vụ ${q.name}`);
                for (const [key, n] of Object.entries(q.items))
                    add(s, key, n);
                s.relationships[q.giver] = (s.relationships[q.giver] || 0) + branch.relation;
                if (q.title && !s.ownedTitles.includes(q.title))
                    s.ownedTitles.push(q.title);
                if (q.id === 'runes') {
                    if (!s.known.includes('bell'))
                        s.known.push('bell');
                    s.flags.push('rune-lesson');
                }
                if (q.id === 'apprentice')
                    s.flags.push('advanced-alchemy');
                log(s, `Hoàn thành ${q.name}: nhánh ${branch.label}. Phần thưởng không cấp XP chỉ số lần nữa.`);
            }
        }
        else if (c.kind === 'ending')
            log(s, 'Bản thử nghiệm hoàn thành. Bạn vẫn có thể trở lại các tầng đã mở.');
        clampResources(s);
        setMode(s);
        return s;
    }
    if (s.choice || s.battle || s.activity) {
        log(s, 'Kết thúc hoặc hủy hoạt động trước khi thay đổi quản lý nhân vật.');
        return s;
    }
    if (type === 'travel')
        startTravel(s, id!);
    if (type === 'explore') {
        const p = place(s.location);
        for (const n of p.links)
            if (!s.known.includes(n))
                s.known.push(n);
        prompt(s, { kind: 'fork', title: 'Chọn lối đi', text: 'Dấu hiệu từng hướng đã rõ; chỉ những đoạn thật sự đi qua mới được ghi là đã khám phá.', options: p.links.map(n => ({ id: n, label: `${place(n).name} · ${place(n).minutes || 12} phút · ${place(n).type === 'boss' ? 'dấu ấn cổng' : 'dấu chân và tiếng gió'}` })) });
    }
    if (type === 'farm' && s.visited.includes(s.location) && place(s.location).enemies.some(id => !monster(id).special)) {
        const c = { ...defaultFarm, ...action.config };
        if (!c.priority.every(id => skills.some(k => k.id === id)))
            return s;
        c.duration = Math.max(1, Math.floor(c.duration));
        c.target = Math.max(1, Math.floor(c.target));
        c.restBelow = Math.min(95, Math.max(0, c.restBelow));
        c.resumeAbove = Math.min(100, Math.max(c.restBelow + 1, c.resumeAbove));
        const a = activity(s, 'farm', c.duration);
        a.config = c;
        start(s, a);
    }
    if (type === 'boss' && place(s.location).type === 'boss') {
        const m = place(s.location).enemies[0];
        if (s.flags.includes(m))
            log(s, 'Cổng đã vượt; không thể lấy lại phần thưởng độc nhất.');
        else if ((s.bag.key || 0) < 3 || s.kills < 3)
            log(s, 'Cần 3 mảnh ấn và ít nhất 3 chiến thắng.');
        else
            prompt(s, { kind: 'encounter', title: 'Cổng đang mở', text: 'Boss khóa bỏ chạy. Mỗi vòng cộng một phút. Đòn tích lực mỗi vòng thứ ba được báo trước.', enemy: m, options: [{ id: 'fight', label: 'Bước qua cổng' }, { id: 'leave', label: 'Chuẩn bị thêm' }] });
    }
    if (type === 'leader' && ['mine', 'camp', 'library'].includes(s.location))
        prompt(s, { kind: 'encounter', title: 'Bóng người trong phế tích', text: 'Một trận quan trọng sẽ dừng để chờ từng quyết định.', enemy: s.location === 'library' ? 'leader2' : 'leader1', options: [{ id: 'fight', label: 'Thách đấu thủ lĩnh' }, { id: 'leave', label: 'Rời đi' }] });
    if (type === 'rest')
        start(s, activity(s, 'rest', Math.max(1, Math.min(240, Math.floor(value || 30)))));
    if (type === 'sleep' && s.location === 'village') {
        if (s.gold >= 5) {
            money(s, -5, 'nhà trọ 60 phút');
            start(s, activity(s, 'sleep', 60));
        }
        else
            log(s, 'Nhà trọ cần 5 đồng; nghỉ ngoài trời miễn phí.');
    }
    if (type === 'training' && s.location === 'village' && statKeys.includes(id as Stat)) {
        const a = activity(s, 'training', 30);
        a.training = id as Stat;
        start(s, a);
    }
    if (type === 'research' && ['mine', 'library'].includes(s.location))
        start(s, activity(s, 'research', 20));
    if (type === 'gather' && s.location !== 'village' && s.sta >= 3.2)
        start(s, activity(s, 'gather', 8));
    if (type === 'npc' && s.location === 'village')
        prompt(s, { kind: 'npc', title: 'Nhiên · Người giữ đèn', text: (s.relationships.Nhiên || 0) >= 10 ? '“Tôi mừng vì bạn đã trở lại.” Những khoảnh khắc riêng tư của hai người trưởng thành tự nguyện khép lại bên ngọn đèn.' : '“Tháp chưa trả lời ai, nhưng chúng ta có thể giúp nhau tìm câu trả lời.”', options: [{ id: 'talk', label: 'Chia sẻ chuyện cũ · tối đa +2 quan hệ/ngày' }, { id: 'work', label: 'Hỏi về công việc và pha chế' }] });
    if (type === 'use') {
        if (id === 'map' && s.bag.map) {
            s.bag.map--;
            for (const n of ['mine', 'bell'])
                if (!s.known.includes(n))
                    s.known.push(n);
            log(s, 'Bản đồ mở thông tin đường mỏ và tháp chuông; không tự đánh dấu đã đi.');
        }
        else
            usePotion(s, id!);
    }
    if (type === 'equip') {
        const g = s.gear.find(g => g.uid === value);
        if (g && canEquip(s, g.id)) {
            s.equipped[item(g.id).slot!] = g.uid;
            clampResources(s);
            log(s, `Trang bị ${item(g.id).name}. Thay giới hạn không hồi thêm tài nguyên.`);
        }
        else
            log(s, 'Chưa đạt chỉ số gốc yêu cầu của trang bị.');
    }
    if (type === 'unequip' && id) {
        delete s.equipped[id as Slot];
        clampResources(s);
    }
    if (type === 'skill') {
        const k = skills.find(k => k.id === id);
        if (k) {
            if (s.active.includes(id!))
                s.active = s.active.filter(x => x !== id);
            else if (s.active.length < 4 && skillUnlocked(s, id!))
                s.active.push(id!);
            else
                log(s, 'Cần ô trống hoặc cấp mở khóa phù hợp.');
        }
    }
    if (type === 'title' && (id === 'none' || s.ownedTitles.includes(id!))) {
        s.activeTitle = id === 'none' ? null : id!;
        log(s, `Danh hiệu kích hoạt: ${titles.find(t => t.id === id)?.name || 'không'}. Chỉ một hiệu ứng được áp dụng.`);
    }
    if (type === 'accept' && canAccept(s, id!)) {
        s.accepted.push(id!);
        if (id === 'cargo') {
            if (!add(s, 'parcel'))
                s.accepted = s.accepted.filter(q => q !== id);
        }
        log(s, `Nhận nhiệm vụ ${quests.find(q => q.id === id)!.name}.`);
    }
    if (type === 'abandon' && s.accepted.includes(id!) && !s.claimed.includes(id!)) {
        s.accepted = s.accepted.filter(q => q !== id);
        if (id === 'cargo')
            s.bag.parcel = 0;
        log(s, 'Đã bỏ nhiệm vụ chưa nhận thưởng. Tiến bộ thực tế không bị xóa.');
    }
    if (type === 'claim') {
        const q = quests.find(q => q.id === id);
        if (q && s.accepted.includes(q.id) && !s.claimed.includes(q.id) && questProgress(s, q.kind) >= q.target)
            prompt(s, { kind: 'quest', quest: q.id, title: `Báo cáo: ${q.name}`, text: `${q.giver}: ${q.motive} Chọn cách nhận thưởng. ${q.reward} đồng; vật phẩm: ${Object.entries(q.items).map(([id, n]) => item(id).name + ' ×' + n).join(', ') || 'không'}. Không thưởng XP chỉ số trực tiếp.`, options: q.branches.map(b => ({ id: b.id, label: b.label })) });
    }
    if (type === 'recover') {
        const r = s.recoveries.find(r => r.id === value && !r.claimed && r.location === s.location);
        if (r) {
            const count = Object.values(r.bag).reduce((a, b) => a + b, 0) + r.gear.length;
            if (bagSize(s) + count > capacity)
                log(s, 'Dọn túi trước khi nhận toàn bộ tài sản.');
            else {
                money(s, r.gold, 'truy hồi');
                for (const [id, n] of Object.entries(r.bag))
                    s.bag[id] = (s.bag[id] || 0) + n;
                s.gear.push(...r.gear);
                r.claimed = true;
                s.recovered++;
                log(s, 'Gói tài sản đã đóng vĩnh viễn, không thể nhận hai lần.');
            }
        }
    }
    if (type === 'discardGear') {
        const g = s.gear.find(g => g.uid === value && !Object.values(s.equipped).includes(g.uid));
        if (g) {
            s.gear = s.gear.filter(x => x.uid !== g.uid);
            log(s, `Bỏ trang bị ${item(g.id).name}, giải phóng tải.`);
        }
    }
    if (type === 'discard' && id && s.bag[id] && !['key', 'parcel'].includes(id)) {
        s.bag[id]--;
        log(s, `Bỏ 1 ${item(id).name}.`);
    }
    if (s.location === 'village')
        villageAction(s, action);
    clampResources(s);
    setMode(s);
    return s;
}
export const skillUnlockLevel = (id: string) => ['pierce', 'poison', 'ice'].includes(id) ? 2 : ['flurry', 'storm', 'light'].includes(id) ? 4 : 1;
export const skillUnlocked = (s: State, id: string) => s.level >= skillUnlockLevel(id);
function villageAction(s: State, { type, id, value }: Action) {
    if (type === 'buy') {
        const i = items.find(i => i.id === id);
        if (i && i.price > 0 && s.gold >= buyPrice(s, i.id) && bagSize(s) < capacity) {
            if (i.id === 'moonblade' && !s.flags.includes('boss3')) {
                log(s, 'Kiếm Nguyệt Tàn chỉ mở bán sau boss tầng 3.');
                return;
            }
            money(s, -buyPrice(s, i.id), `mua ${i.name}`);
            add(s, i.id);
        }
    }
    if (type === 'sell' && id && s.bag[id] && item(id).price > 0) {
        s.bag[id]--;
        money(s, Math.floor(item(id).price * .4), `bán ${item(id).name}`);
    }
    if (type === 'sellGear') {
        const g = s.gear.find(g => g.uid === value && !Object.values(s.equipped).includes(g.uid));
        if (g) {
            s.gear = s.gear.filter(x => x.uid !== g.uid);
            money(s, Math.floor(item(g.id).price * .4 * g.durability / 100), `bán ${item(g.id).name}`);
        }
    }
    if (type === 'store' && id && s.bag[id] && !['key', 'parcel'].includes(id)) {
        s.bag[id]--;
        s.storage[id] = (s.storage[id] || 0) + 1;
        log(s, `Cất kho: ${item(id).name}.`);
    }
    if (type === 'storeGear') {
        const g = s.gear.find(g => g.uid === value);
        if (g) {
            for (const slot of Object.keys(s.equipped) as Slot[])
                if (s.equipped[slot] === g.uid)
                    delete s.equipped[slot];
            s.gear = s.gear.filter(x => x.uid !== g.uid);
            s.storedGear.push(g);
            clampResources(s);
            log(s, `Cất kho trang bị ${item(g.id).name}.`);
        }
    }
    if (type === 'withdrawGear' && bagSize(s) < capacity) {
        const g = s.storedGear.find(g => g.uid === value);
        if (g) {
            s.storedGear = s.storedGear.filter(x => x.uid !== g.uid);
            s.gear.push(g);
            log(s, `Lấy khỏi kho: ${item(g.id).name}.`);
        }
    }
    if (type === 'withdrawItem' && id && s.storage[id] && bagSize(s) < capacity) {
        s.storage[id]--;
        s.bag[id] = (s.bag[id] || 0) + 1;
        log(s, `Lấy khỏi kho: ${item(id).name}.`);
    }
    if (type === 'deposit') {
        const n = Math.min(s.gold, Math.max(0, Math.floor(value || 0)));
        s.gold -= n;
        s.bank += n;
        log(s, `Gửi ngân hàng ${n} đồng.`);
    }
    if (type === 'withdraw') {
        const n = Math.min(s.bank, Math.max(0, Math.floor(value || 0)));
        s.bank -= n;
        s.gold += n;
        log(s, `Rút ngân hàng ${n} đồng.`);
    }
    if (type === 'repair') {
        const cost = s.gear.reduce((n, g) => n + Math.ceil((100 - g.durability) / 15), 0);
        if (s.gold >= cost) {
            money(s, -cost, 'sửa toàn bộ trang bị');
            s.gear.forEach(g => g.durability = 100);
        }
        else
            log(s, `Sửa cần ${cost} đồng.`);
    }
    if (type === 'job') {
        const j = professions.find(j => j.id === id);
        if (j && s.gold >= j.cost && (!j.input || (s.bag[j.input] || 0) >= j.qty) && bagSize(s) < capacity) {
            money(s, -j.cost, `nguyên liệu ${j.name}`);
            if (j.input)
                s.bag[j.input] -= j.qty;
            const a = activity(s, 'job', j.minutes);
            a.job = j.id;
            start(s, a);
        }
        else
            log(s, 'Thiếu tiền, nguyên liệu hoặc chỗ trong túi.');
    }
    if (type === 'craft') {
        if ((s.bag.ore || 0) >= 5 && s.gold >= 20 && bagSize(s) < capacity) {
            s.bag.ore -= 5;
            money(s, -20, 'rèn găng Tro');
            const a = activity(s, 'job', 12);
            a.job = 'sewing';
            a.output = 'ash3';
            start(s, a);
        }
        else
            log(s, 'Cần 5 quặng, 20 đồng và chỗ trong túi.');
    }
    if (type === 'contract' && s.ownedTitles.includes('merchant')) {
        if (s.gold >= 3 && !s.bag.parcel) {
            money(s, -3, 'phí hợp đồng vận chuyển');
            s.bag.parcel = 1;
            s.questCounters.contract = 1;
            s.questCounters.cargo = 0;
            s.accepted = s.accepted.filter(id => id !== 'cargo');
            s.accepted.push('cargo');
            log(s, 'Hợp đồng lặp: mang hàng tới Bến rễ rồi nhận 12 đồng bằng nút giao hợp đồng.');
        }
    }
    if (type === 'contractReward' && s.questCounters.contract === 1 && s.questCounters.cargo === 1) {
        s.questCounters.contract = 0;
        money(s, 12, 'hợp đồng vận chuyển hoàn tất');
    }
}
export function questProgress(s: State, kind: string) { if (kind === 'explore')
    return s.visited.length - 1; if (kind === 'kills')
    return s.kills; if (kind === 'herb')
    return s.bag.herb || 0; if (kind === 'bosses')
    return s.bosses; if (kind === 'recovered')
    return s.recovered; if (kind === 'alchemy')
    return s.jobs.alchemy || 0; if (['cargo', 'runes'].includes(kind))
    return s.questCounters[kind] || 0; return s.flags.includes(kind) ? 1 : 0; }
