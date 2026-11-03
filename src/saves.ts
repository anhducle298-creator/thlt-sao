import { createGame, defaultFarm, type State, type Gear } from './engine';
import { items, monsters, monster, places, skills, professions, quests, titles } from './content';
import { statKeys, allSlots, maxHp, maxMp, maxSta, BALANCE } from './balance';
export type Save = {
    slot: string;
    savedAt: string;
    state: State;
};
const bad = (): never => { throw new Error('Bản lưu hỏng hoặc không tương thích. Không thay đổi trò chơi hiện tại.'); };
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER;
const int = (v: unknown): v is number => num(v) && Number.isInteger(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(a => typeof a === 'string');
const record = (v: unknown): v is Record<string, number> => obj(v) && Object.values(v).every(num);
const mapStrings = (v: unknown) => obj(v) && Object.values(v).every(x => typeof x === 'string');
const itemIds = new Set(items.map(i => i.id)), placeIds = new Set(places.map(p => p.id)), skillIds = new Set(skills.map(k => k.id));
const bag = (v: unknown) => record(v) && Object.keys(v).every(k => itemIds.has(k) && !items.find(i => i.id === k)?.slot && int(v[k]));
const gear = (v: unknown): v is Gear[] => Array.isArray(v) && v.every(g => obj(g) && int(g.uid) && g.uid > 0 && items.some(i => i.id === g.id && i.slot) && num(g.durability) && g.durability <= 100);
/** v1 resources used a larger scale and manual stat points. Migration retains
 * completed actions/rewards and RNG, converts resource ratios, never rolls stats. */
export function migrateSave(input: unknown): unknown {
    if (!obj(input) || input.version !== 1)
        return input;
    const old = input;
    for (const key of ['seed', 'nextId', 'minutes', 'level', 'xp', 'totalXp', 'gold', 'bank', 'hp', 'mp', 'floor', 'unlocked', 'kills', 'bosses', 'recovered', 'injury'])
        if (!num(old[key]))
            return bad();
    if (!obj(old.stats) || !statKeys.every(k => num((old.stats as Record<string, unknown>)[k])) || !bag(old.bag) || !bag(old.storage) || !gear(old.gear) || !record(old.equipped))
        return bad();
    for (const key of ['known', 'visited', 'marked', 'edges', 'active', 'claimed', 'flags', 'log'])
        if (!strings(old[key]))
            return bad();
    for (const key of ['mastery', 'jobs', 'relationships'])
        if (!record(old[key]))
            return bad();
    if (!placeIds.has(old.location as string) || !Array.isArray(old.recoveries) || typeof old.paused !== 'boolean' || typeof old.name !== 'string')
        return bad();
    const s = createGame(old.seed as number);
    const common = ['seed', 'nextId', 'name', 'minutes', 'location', 'floor', 'unlocked', 'known', 'visited', 'marked', 'edges', 'level', 'xp', 'totalXp', 'gold', 'bank', 'bag', 'storage', 'gear', 'equipped', 'active', 'mastery', 'jobs', 'relationships', 'claimed', 'flags', 'kills', 'bosses', 'recovered', 'injury', 'paused', 'log', 'summary'];
    for (const key of common)
        (s as unknown as Record<string, unknown>)[key] = structuredClone(old[key]);
    const st = old.stats as Record<string, number>;
    for (const key of statKeys)
        s.stats[key] = Math.max(1, Math.min(20, Math.round(st[key] / 2)));
    const oldMaxHp = 100 + (st.vitality - 6) * 8 + ((old.level as number) - 1) * 10;
    const oldMaxMp = 45 + (st.intellect - 6) * 5 + ((old.level as number) - 1) * 4;
    s.hp = Math.min(maxHp(s), (old.hp as number) / Math.max(1, oldMaxHp) * maxHp(s));
    s.mp = Math.min(maxMp(s), (old.mp as number) / Math.max(1, oldMaxMp) * maxMp(s));
    s.sta = maxSta(s) * .5;
    s.accepted = [...new Set([...s.accepted, ...s.claimed])];
    s.ownedTitles = quests.filter(q => s.claimed.includes(q.id) && q.title).map(q => q.title!);
    if (s.flags.includes('leader1'))
        s.flags.push('courier');
    if (old.activity) {
        if (!obj(old.activity))
            return bad();
        const a = old.activity;
        if (!['travel', 'farm', 'rest', 'job', 'gather'].includes(a.kind as string) || !['total', 'remaining', 'kills', 'elapsed', 'phase', 'started', 'goldStart', 'xpStart'].every(k => num(a[k])))
            return bad();
        s.activity = { ...structuredClone(a), bagStart: { ...s.bag }, durabilityStart: s.gear.reduce((n, g) => n + g.durability, 0), potionsUsed: 0, loot: {}, resting: false, stopRequested: false } as State['activity'];
        if (a.kind === 'farm') {
            if (!obj(a.config))
                return bad();
            s.activity!.config = { ...defaultFarm, ...a.config };
        }
    }
    if (old.battle) {
        if (!obj(old.battle) || !obj(old.battle.enemy) || !monsters.some(m => m.id === (old.battle as Record<string, any>).enemy.id) || !num(old.battle.hp) || !num(old.battle.enemy.hp))
            return bad();
        const b = old.battle as Record<string, any>;
        const m = monster(b.enemy.id);
        s.battle = { ...structuredClone(b), id: s.nextId++, enemy: { ...m }, hp: Math.min(m.hp, b.hp / Math.max(1, b.enemy.hp) * m.hp), playerWait: 0, enemyWait: 0 } as State['battle'];
    }
    s.choice = structuredClone(old.choice) as State['choice'];
    s.recoveries = old.recoveries.map((r: any) => ({ ...r, kind: 'drop' }));
    s.mode = s.choice ? (s.choice.kind === 'defeat' ? 'defeat' : 'choice') : s.battle?.important ? 'turn' : s.activity?.kind || 'idle';
    s.paused = true;
    s.log.unshift('Đã chuyển bản lưu v1 → v2: chỉ số đổi sang thang nhỏ, HP/MP giữ tỷ lệ, STA khởi tạo 50%. Điểm phân phối cũ đã bỏ. Không bốc lại RNG hoặc phần thưởng.');
    return s;
}
export function validateSave(input: unknown): State {
    const migrated = migrateSave(input);
    if (!obj(migrated) || migrated.version !== 2)
        return bad();
    const x = migrated as unknown as State;
    const base = createGame(1);
    for (const k of Object.keys(base) as (keyof State)[]) {
        if (!(k in x))
            return bad();
        if (typeof base[k] === 'number' && !num(x[k]))
            return bad();
    }
    if (!int(x.seed) || x.seed > 0xffffffff || !int(x.nextId) || !int(x.minutes) || !int(x.level) || x.level < 1 || typeof x.name !== 'string' || typeof x.paused !== 'boolean' || !placeIds.has(x.location) || x.floor !== places.find(p => p.id === x.location)?.floor || x.unlocked < 1 || x.unlocked > 3)
        return bad();
    if (!obj(x.stats) || !statKeys.every(k => int(x.stats[k]) && x.stats[k] >= 1 && x.stats[k] <= BALANCE.baseCap) || !record(x.hiddenXp) || !record(x.recent) || !statKeys.every(k => num(x.hiddenXp[k]) && num(x.recent[k])))
        return bad();
    for (const k of ['known', 'visited', 'marked'] as const)
        if (!strings(x[k]) || !x[k].every(p => placeIds.has(p)))
            return bad();
    for (const k of ['edges', 'active', 'accepted', 'claimed', 'flags', 'log', 'processedEvents', 'ownedTitles', 'progressionReceipts'] as const)
        if (!strings(x[k]) || x[k].length > 10000)
            return bad();
    if (!strings(x.active) || x.active.length > 4 || new Set(x.active).size !== x.active.length || !x.active.every(k => skillIds.has(k)) || !bag(x.bag) || !bag(x.storage) || !gear(x.gear) || !gear(x.storedGear) || !record(x.jobs) || !record(x.relationships) || !record(x.mastery) || !record(x.weaponMastery) || !record(x.equipped) || !record(x.questCounters) || !mapStrings(x.questBranches))
        return bad();
    if (!x.accepted.every(id => quests.some(q => q.id === id)) || !x.claimed.every(id => quests.some(q => q.id === id)) || new Set(x.claimed).size !== x.claimed.length || !x.ownedTitles.every(id => titles.some(t => t.id === id)) || (x.activeTitle !== null && !x.ownedTitles.includes(x.activeTitle)) || typeof x.lastStop !== 'string')
        return bad();
    if (!Array.isArray(x.levelRolls) || x.levelRolls.some(r => !r || !int(r.level) || !strings(r.changes) || !int(r.seed) || r.seed > 0xffffffff))
        return bad();
    const allGear = [...x.gear, ...x.storedGear];
    if (allGear.some(g => g.uid >= x.nextId) || new Set(allGear.map(g => g.uid)).size !== allGear.length || !Object.entries(x.equipped).every(([slot, uid]) => allSlots.includes(slot as SlotLike) && x.gear.some(g => g.uid === uid && items.find(i => i.id === g.id)?.slot === slot)))
        return bad();
    if (x.hp > maxHp(x) + 1e-6 || x.mp > maxMp(x) + 1e-6 || x.sta > maxSta(x) + 1e-6)
        return bad();
    if (!['idle', 'travel', 'farm', 'rest', 'sleep', 'job', 'gather', 'training', 'research', 'choice', 'turn', 'defeat'].includes(x.mode) || (x.summary !== null && typeof x.summary !== 'string'))
        return bad();
    if (!Array.isArray(x.recoveries) || x.recoveries.some(r => !r || !int(r.id) || !num(r.gold) || !placeIds.has(r.location) || typeof r.claimed !== 'boolean' || !['drop', 'camp', 'curse'].includes(r.kind) || !bag(r.bag) || !gear(r.gear)))
        return bad();
    const outstanding = x.recoveries.filter(r => !r.claimed).flatMap(r => r.gear);
    if (outstanding.some(g => g.uid >= x.nextId) || new Set([...allGear, ...outstanding].map(g => g.uid)).size !== allGear.length + outstanding.length)
        return bad();
    if (x.activity) {
        const a = x.activity;
        if ((a.output !== undefined && a.output !== '' && !itemIds.has(a.output)) || (a.safeReturn !== undefined && typeof a.safeReturn !== 'boolean') || (a.eventId !== undefined && typeof a.eventId !== 'string')) return bad();
        if (!['travel', 'farm', 'rest', 'sleep', 'job', 'gather', 'training', 'research'].includes(a.kind) || !['total', 'remaining', 'kills', 'elapsed', 'phase', 'started', 'goldStart', 'xpStart', 'durabilityStart', 'potionsUsed'].every(k => num(a[k as keyof typeof a])) || a.total < 1 || a.remaining > a.total || a.started > x.minutes || !bag(a.bagStart) || !record(a.loot) || !Object.keys(a.loot).every(k => itemIds.has(k)) || typeof a.resting !== 'boolean' || typeof a.stopRequested !== 'boolean')
            return bad();
        if (a.kind === 'travel' && (!placeIds.has(a.destination!) || !num(a.eventAt) || typeof a.eventDone !== 'boolean'))
            return bad();
        if (a.kind === 'job' && !professions.some(j => j.id === a.job))
            return bad();
        if (a.kind === 'training' && !statKeys.includes(a.training!))
            return bad();
        if (a.kind === 'farm') {
            const c = a.config;
            if (!c || !['duration', 'target', 'hp', 'mp', 'sta', 'retreat', 'restBelow', 'resumeAbove'].every(k => num(c[k as keyof typeof c])) || c.duration < 1 || c.target < 1 || ['hp', 'mp', 'sta', 'retreat', 'restBelow', 'resumeAbove'].some(k => Number(c[k as keyof typeof c]) > 100) || c.resumeAbove <= c.restBelow || typeof c.stopEmpty !== 'boolean' || typeof c.stopDurability !== 'boolean' || !['all', 'rare'].includes(c.loot) || !strings(c.priority) || !c.priority.every(k => skillIds.has(k)))
                return bad();
        }
    }
    if (x.choice) {
        const c = x.choice;
        if (!['fork', 'arrival', 'encounter', 'chest', 'trap', 'npc', 'defeat', 'ending', 'clue', 'traveler', 'rescue', 'quest'].includes(c.kind) || typeof c.title !== 'string' || typeof c.text !== 'string' || !Array.isArray(c.options) || !c.options.length || c.options.some(o => !o || typeof o.id !== 'string' || typeof o.label !== 'string') || (c.enemy && !monsters.some(m => m.id === c.enemy)) || (c.kind === 'encounter' && !c.enemy) || (c.kind === 'quest' && !quests.some(q => q.id === c.quest)))
            return bad();
        const optionIds: Record<string,string[]>={arrival:['explore','mark','ignore'],encounter:['fight','avoid','leave'],chest:['open','ignore'],trap:['disarm','rush'],npc:['talk','work'],defeat:['sneak','rescue'],ending:['continue'],clue:['read','ignore'],traveler:['help','ignore'],rescue:['unlock','break']};
        const allowed = c.kind==='fork' ? [...placeIds] : c.kind==='quest' ? quests.find(q=>q.id===c.quest)!.branches.map(b=>b.id) : optionIds[c.kind];
        if (!allowed || c.options.some(o=>!allowed.includes(o.id)) || new Set(c.options.map(o=>o.id)).size!==c.options.length) return bad();
    }
    if (x.battle) {
        const b = x.battle;
        const m = monsters.find(m => m.id === b.enemy?.id);
        if (!m || (Object.keys(m).length !== Object.keys(b.enemy).length || !Object.entries(m).every(([k, v]) => b.enemy[k as keyof typeof b.enemy] === v)) || !int(b.id) || !num(b.hp) || b.hp > m.hp || !int(b.round) || !record(b.cooldowns) || !num(b.poison) || !num(b.slow) || !num(b.playerWait) || !num(b.enemyWait) || typeof b.shield !== 'boolean' || typeof b.important !== 'boolean' || (!b.important && !x.activity))
            return bad();
    }
    const expected = x.choice ? (x.choice.kind === 'defeat' ? 'defeat' : 'choice') : x.battle?.important ? 'turn' : x.activity?.kind || 'idle';
    if (x.mode !== expected)
        return bad();
    return structuredClone(x);
}
type SlotLike = typeof allSlots[number];
function db(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const r = indexedDB.open('sao-thaolt', 1); r.onupgradeneeded = () => r.result.createObjectStore('saves', { keyPath: 'slot' }); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
export async function saveSlot(slot: string, state: State) { const validated = validateSave(state); const d = await db(); return new Promise<void>((resolve, reject) => { const t = d.transaction('saves', 'readwrite'); t.objectStore('saves').put({ slot, savedAt: new Date().toISOString(), state: validated }); t.oncomplete = () => { d.close(); resolve(); }; t.onerror = () => { d.close(); reject(t.error); }; }); }
export async function listSaves(): Promise<Save[]> { const d = await db(); return new Promise((resolve, reject) => { const t = d.transaction('saves', 'readonly'); const r = t.objectStore('saves').getAll(); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); t.oncomplete = () => d.close(); }); }
export async function loadSlot(slot: string) { const all = await listSaves(); const found = all.find(s => s.slot === slot); if (!found)
    throw new Error('Ô lưu đang trống.'); return validateSave(found.state); }
export function exportSave(s: State) { return JSON.stringify({ format: 'sao-thaolt', version: 2, state: validateSave(s) }, null, 2); }
export function importSave(text: string) { if (text.length > 2000000)
    throw new Error('Tệp quá lớn (tối đa 2 MB).'); const x = JSON.parse(text); if (!x || x.format !== 'sao-thaolt' || ![1, 2].includes(x.version) || x.state?.version !== x.version)
    return bad(); return validateSave(x.state); }
