import { describe, it, expect } from 'vitest';
import { createGame, reduce, defaultFarm, beginBattle, questProgress, skillAvailable, buyPrice, type State, type FarmConfig } from './engine';
import { monster, places, monsters, items, skills, quests, titles } from './content';
import { maxHp, maxMp, maxSta, staRegen, mpRegen, staFullTime, mpFullTime, effectiveStats, walkNet, retreatChance, weightLimit, damageReduction, speed, attackPower } from './balance';
import { awardXp, trainStats, xpNeeded, statThreshold } from './progression';
import { exportSave, importSave, validateSave, migrateSave } from './saves';
import { validateContent } from './validate-content';
import { progressionStudy, bossStudy } from './simulation';
const run = (s: State, n: number) => { for (let i = 0; i < n; i++)
    s = reduce(s, { type: 'tick' }); return s; };
function travelling() { const s = createGame(10); s.edges = ['road|village']; return reduce(s, { type: 'travel', id: 'road' }); }
function farming(hp = 30, config: Partial<FarmConfig> = {}) { let s = createGame(5); s.location = 'grove'; s.visited.push('grove'); s.hp = hp; s = reduce(s, { type: 'farm', config: { ...defaultFarm, stopEmpty: false, ...config } }); beginBattle(s, 'wolf'); return s; }
function turn(id = 'wolf') { const s = createGame(5); beginBattle(s, id, true); return s; }
const choose = (s: State, id: string) => reduce(s, { type: 'choose', id });
describe('đồng hồ duy nhất và hoạt động', () => {
    it('30 phút đi bộ đúng 30 nhịp, không tăng tốc từ render', () => { let s = travelling(); s = run(s, 29); expect(s.activity?.remaining).toBe(1); expect(s.location).toBe('village'); s = run(s, 1); expect(s.location).toBe('road'); expect(s.minutes).toBe(390); expect(s.choice?.kind).toBe('arrival'); });
    it('chờ lựa chọn dừng thời gian, HP/MP/STA và suy yếu', () => { let s = reduce(createGame(3), { type: 'explore' }); s.hp = 15; s.mp = 4; s.sta = 2; s.injury = 12; expect(run(s, 100)).toEqual(s); s = choose(s, 'road'); expect(s.minutes).toBe(360); });
    it('nhàn rỗi và nút tạm dừng không phát sinh hồi phục', () => { let s = createGame(); s.sta = 1; s.hp = 10; expect(run(s, 20)).toEqual(s); s = travelling(); s = reduce(s, { type: 'pause' }); expect(run(s, 50)).toEqual(s); });
    it('trận phát sinh không trừ phút đi bộ', () => { let s = travelling(); beginBattle(s, 'wolf'); const remaining = s.activity!.remaining; let rounds = 0; while (s.battle && rounds < 20) {
        s = run(s, 1);
        rounds++;
        expect(s.activity?.remaining).toBe(remaining);
    } expect(s.minutes).toBe(360 + rounds); s = run(s, 30); expect(s.minutes).toBe(390 + rounds); });
    it('lượt quan trọng chỉ cộng 1 phút và hiệu ứng 1 lần', () => { let s = turn('boss1'); s.battle!.poison = 3; s.injury = 10; const hp = s.battle!.hp; expect(run(s, 50)).toEqual(s); s = reduce(s, { type: 'turn', id: 'defend' }); expect(s.minutes).toBe(361); expect(s.battle?.poison).toBe(2); expect(s.battle?.hp).toBe(hp - 2); expect(s.injury).toBe(9); });
    it('nhịp nghỉ chỉ hồi đúng 1 lần và giữ phần lẻ', () => { let s = createGame(3); s.sta = 1; s.mp = 1; s.hp = 10; s = reduce(s, { type: 'rest' }); const initial = structuredClone(s); s = run(s, 1); expect(s.sta).toBeCloseTo(1 + staRegen(s) * 2); expect(s.mp).toBeCloseTo(1 + mpRegen(s) * 2); expect(s.hp).toBeCloseTo(10.16); expect(initial.sta).toBe(1); });
    it('đi bộ hiển thị/áp dụng hồi ròng, không làm tròn nội bộ', () => { let s = travelling(); const before = s.sta; const net = walkNet(s); s = run(s, 1); expect(s.sta).toBeCloseTo(Math.min(maxSta(s), before + net)); });
    it('sự kiện có ID và không phát lại sau tải/tiếp tục', () => { let s = reduce(createGame(5), { type: 'travel', id: 'road' }); s = run(s, 15); const ids = [...s.processedEvents]; expect(ids.length).toBe(1); s = importSave(exportSave(s)); if (s.choice) {
        const id = s.choice.options.find(o => ['ignore', 'avoid', 'disarm'].includes(o.id))?.id || s.choice.options[0].id;
        s = choose(s, id);
    } s = run(s, 15); expect(s.location).toBe('road'); expect(s.processedEvents).toEqual(ids); });
    it('hủy không dùng thêm thời gian hoặc tạo thưởng', () => { let s = travelling(); const gold = s.gold; s = reduce(s, { type: 'cancel' }); expect(s.activity).toBeNull(); expect(s.gold).toBe(gold); expect(run(s, 10).minutes).toBe(360); });
});
describe('STA, hồi phục và chỉ số nhỏ', () => {
    it('bắt đầu chỉ số 1–5; công thức tài nguyên chính xác', () => { const s = createGame(); expect(Object.values(s.stats).every(x => x >= 1 && x <= 5)).toBe(true); expect([maxHp(s), maxMp(s), maxSta(s)]).toEqual([30, 11, 25]); });
    it('VIT/INT tăng cả giới hạn và tốc độ hồi, không hồi đầy', () => { const s = createGame(); s.hp = 5; s.mp = 2; s.sta = 3; const before = { sta: staRegen(s), mp: mpRegen(s), staTime: staFullTime(s), mpTime: mpFullTime(s) }; s.stats.vitality++; s.stats.intellect++; expect(maxHp(s)).toBe(35); expect(maxMp(s)).toBe(14); expect(maxSta(s)).toBe(30); expect(staRegen(s)).toBeGreaterThan(before.sta); expect(mpRegen(s)).toBeGreaterThan(before.mp); expect(staFullTime(s)).toBeLessThan(before.staTime); expect(mpFullTime(s)).toBeLessThan(before.mpTime); expect([s.hp, s.mp, s.sta]).toEqual([5, 2, 3]); });
    it('giáp, tốc độ và chỉ số trang bị có giới hạn', () => { const s = createGame(); s.stats.agility = 20; expect(speed(s)).toBeLessThanOrEqual(12); expect(damageReduction(10) - damageReduction(9)).toBeLessThan(damageReduction(2) - damageReduction(1)); s.gear.push({ uid: 2, id: 'ash2', durability: 100 }); s.nextId = 3; s.equipped.thân = 2; s.stats.vitality = 20; expect(effectiveStats(s).vitality).toBe(21); });
    it('thay đồ VIT không thể hồi tài nguyên miễn phí', () => { let s = createGame(); s.gear.push({ uid: 2, id: 'ash2', durability: 100 }); s.nextId = 3; s.hp = 10; s.mp = 2; s.sta = 3; for (let i = 0; i < 5; i++) {
        s = reduce(s, { type: 'equip', value: 2 });
        expect(maxHp(s)).toBe(35);
        s = reduce(s, { type: 'unequip', id: 'thân' });
    } expect([s.hp, s.mp, s.sta]).toEqual([10, 2, 3]); });
    it('giảm giới hạn chỉ chặn, không giữ tỷ lệ tạo thêm hồi', () => { let s = createGame(); s.gear.push({ uid: 2, id: 'ash2', durability: 100 }); s.nextId = 3; s = reduce(s, { type: 'equip', value: 2 }); s.hp = 35; s.sta = 30; s = reduce(s, { type: 'unequip', id: 'thân' }); expect([s.hp, s.sta]).toEqual([30, 25]); });
    it('vũ khí dùng hệ số khác nhau, không cộng toàn bộ mọi chỉ số', () => { const s = createGame(); const sword = attackPower(s); s.stats.intellect += 5; expect(attackPower(s)).toBe(sword); s.gear[0].id = 'bow'; const bow = attackPower(s); s.stats.agility++; expect(attackPower(s) - bow).toBeCloseTo(.7); });
    it('0 STA/MP vẫn đánh yếu hoặc phòng thủ được', () => { let s = turn(); s.sta = 0; s.mp = 0; expect(skillAvailable(s, 'slash')).toBe(false); s = reduce(s, { type: 'turn', id: 'attack' }); expect(s.minutes).toBe(361); s = reduce(s, { type: 'turn', id: 'defend' }); expect(s.minutes).toBe(362); expect(s.sta).toBeCloseTo(.6); });
    it('ngủ nhà trọ hồi hệ số4, nghỉ an toàn2, ngoài làng1', () => { let base = createGame(); base.sta = 1; const sleep = run(reduce(base, { type: 'sleep' }), 1); expect(sleep.sta - 1).toBeCloseTo(staRegen(base) * 4); const rest = run(reduce(base, { type: 'rest' }), 1); expect(rest.sta - 1).toBeCloseTo(staRegen(base) * 2); base.location = 'road'; base.visited.push('road'); const field = run(reduce(base, { type: 'rest' }), 1); expect(field.sta - 1).toBeCloseTo(staRegen(base)); });
});
describe('tiến bộ chỉ số ẩn và RNG', () => {
    it('XP ẩn chỉ cấp một lần cho cùng receipt', () => { const s = createGame(1); trainStats(s, { strength: 10, vitality: 3 }, 'cargo:1'); trainStats(s, { strength: 10, vitality: 3 }, 'cargo:1'); expect(s.hiddenXp.strength).toBe(10); expect(s.hiddenXp.vitality).toBe(3); expect(s.hiddenXp.intellect).toBe(0); });
    it('đeo nặng đứng yên, chịu đòn và phép vô tác dụng không rèn', () => { let s = createGame(); s.bag.ore = 25; expect(run(s, 10).hiddenXp).toEqual(s.hiddenXp); let b = turn(); b.active = ['heal']; const before = { ...b.hiddenXp }; b = reduce(b, { type: 'turn', id: 'heal' }); expect(b.hiddenXp.strength).toBe(before.strength); expect(b.hiddenXp.vitality).toBe(before.vitality); });
    it('quá tải không nhận rèn đi bộ, ngưỡng tăng theo chỉ số', () => { let s = travelling(); s.bag.ore = 25; const old = { ...s.hiddenXp }; s = run(s, 1); expect(s.hiddenXp).toEqual(old); expect(statThreshold(10)).toBeGreaterThan(statThreshold(3)); });
    it('đủ ngưỡng tăng +1 nhưng không hồi đầy; chung trần20', () => { const s = createGame(); s.hp = 1; trainStats(s, { vitality: statThreshold(3) }, 'test'); expect(s.stats.vitality).toBe(4); expect(s.hp).toBe(1); s.stats.vitality = 20; trainStats(s, { vitality: 999999 }, 'cap'); expect(s.stats.vitality).toBe(20); });
    it('lên cấp không cho điểm tự phân phối, không hồi tài nguyên', () => { const s = createGame(8); s.hp = 1; s.mp = 1; s.sta = 1; awardXp(s, xpNeeded(s)); expect(s.level).toBe(2); expect('points' in s).toBe(false); expect([s.hp, s.mp, s.sta]).toEqual([1, 1, 1]); expect(s.levelRolls).toHaveLength(1); });
    it('kết quả lên cấp và RNG giữ nguyên khi lưu/tải', () => { const s = createGame(0xffffffff); awardXp(s, xpNeeded(s)); const loaded = importSave(exportSave(s)); expect(loaded.seed).toBe(s.seed); expect(loaded.levelRolls).toEqual(s.levelRolls); expect(loaded.stats).toEqual(s.stats); awardXp(s, xpNeeded(s)); awardXp(loaded, xpNeeded(loaded)); expect(loaded).toEqual(s); });
    it('kỹ năng bậc cao còn giá trị ở cấp không tăng chỉ số', () => { let s = createGame(900); s.level = 4; s.active = []; s = reduce(s, { type: 'skill', id: 'light' }); expect(s.active).toEqual(['light']); });
});
describe('farm, thuốc, nghỉ và chiến đấu', () => {
    it('chỉ farm tại bãi đã phát hiện', () => { let s = createGame(); s.location = 'grove'; expect(reduce(s, { type: 'farm' }).activity).toBeNull(); s.visited.push('grove'); expect(reduce(s, { type: 'farm' }).activity?.kind).toBe('farm'); });
    it('HP về0 dừng farm ngay, không nhận thưởng nữa', () => { let s = farming(1, { retreat: 0, hp: 0, mp: 0, sta: 0 }); s.stats.agility = 1; s.battle!.enemy = { ...monster('hound') }; s.battle!.hp = 31; s = run(s, 1); expect(s.hp).toBe(0); expect(s.activity).toBeNull(); expect(s.choice?.kind).toBe('defeat'); expect(s.kills).toBe(0); expect(run(s, 50)).toEqual(s); });
    it('thuốc HP, MP, STA theo ngưỡng thực sự được tiêu hao', () => { for (const id of ['hp', 'mp', 'sta'] as const) {
        let s = farming();
        s[id] = id === 'hp' ? 10 : 0;
        s.activity!.config!.retreat = 0;
        const old = s.bag[id];
        s = run(s, 1);
        expect(s.bag[id]).toBe(old - 1);
        expect(s[id]).toBeGreaterThan(0);
    } });
    it('trên ngưỡng không tiêu hao thuốc', () => { let s = farming(); const before = { ...s.bag }; s = run(s, 1); expect(s.bag).toEqual(before); });
    it('rút lui được xét trước thuốc, có thể thất bại', () => { let s = farming(3); const hp = s.bag.hp; s.seed = 5; s = run(s, 1); expect(s.bag.hp).toBe(hp); expect(s.activity).toBeNull(); let f = farming(4); f.seed = 1100; f = run(f, 1); expect(f.log.some(l => l.includes('Rút lui thất bại'))).toBe(true); });
    it('nghỉ ở điểm an toàn tới ngưỡng, không phát thưởng lúc nghỉ', () => { let s = farming(); s.battle = null; s.sta = 4; s = run(s, 1); expect(s.activity?.resting).toBe(true); const gold = s.gold; for (let i = 0; i < 80 && s.activity?.resting; i++)
        s = run(s, 1); expect(s.sta).toBeGreaterThanOrEqual(maxSta(s) * .8); expect(s.gold).toBe(gold); expect(s.kills).toBe(0); expect(s.activity?.resting).toBe(false); });
    it('STA thấp ngoài điểm an toàn rút về nơi đã biết', () => { let s = farming(); s.location = 'road'; s.battle = null; s.sta = 1; s = run(s, 1); expect(s.activity?.kind).toBe('travel'); expect(s.activity?.destination).toBe('village'); expect(s.activity?.safeReturn).toBe(true); });
    it('hủy farm trong trận chỉ dừng sau ranh giới hợp lệ', () => { let s = farming(); s = reduce(s, { type: 'cancel' }); expect(s.activity?.stopRequested).toBe(true); s.battle!.hp = 1; s.battle!.playerWait = 0; s = run(s, 1); expect(s.activity).toBeNull(); expect(s.kills).toBe(1); });
    it('kỹ năng tuân thủ STA/MP/hồi chiêu và 4 ô', () => { let s = turn('boss1'); s.sta = 0; const old = s.minutes; s = reduce(s, { type: 'turn', id: 'slash' }); expect(s.minutes).toBe(old); s.sta = 25; s = reduce(s, { type: 'turn', id: 'slash' }); const again = reduce(s, { type: 'turn', id: 'slash' }); expect(again.minutes).toBe(s.minutes); const full = reduce(createGame(), { type: 'skill', id: 'shot' }); expect(full.active).toHaveLength(4); });
    it('boss báo trước và phòng thủ chặn đòn tích lực', () => { let s = turn('boss1'); s.battle!.round = 2; s.stats.agility = 1; const defend = reduce(s, { type: 'turn', id: 'defend' }); const hit = reduce(s, { type: 'turn', id: 'attack' }); expect(defend.hp).toBeGreaterThan(hit.hp); });
    it('tốc độ thay khoảng hành động, không đổi số phút', () => { let slow = farming(); slow.active = []; slow.stats.agility = 1; let fast = structuredClone(slow); fast.stats.agility = 20; slow = run(slow, 3); fast = run(fast, 3); expect(slow.minutes).toBe(363); expect(fast.minutes).toBe(363); expect(fast.battle?.hp || 0).toBeLessThan(slow.battle?.hp || 0); });
    it('hết thuốc và độ bền gần hỏng dừng trước khi tìm quái', () => { let s = farming(); s.battle = null; s.activity!.config!.stopEmpty = true; s.bag.sta = 0; s = run(s, 1); expect(s.activity).toBeNull(); let d = farming(); d.battle = null; d.gear[0].durability = 0; d = run(d, 1); expect(d.activity).toBeNull(); });
});
describe('nhiệm vụ, danh hiệu, kinh tế và truy hồi', () => {
    it('nhận thưởng có nhánh và chỉ một lần, không rèn STR/XP thêm', () => { let s = createGame(); s.kills = 5; const before = { ...s.hiddenXp }; const xp = s.xp; s = reduce(s, { type: 'claim', id: 'hunt' }); expect(s.choice?.kind).toBe('quest'); s = choose(s, 'favor'); expect(s.claimed).toContain('hunt'); expect(s.questBranches.hunt).toBe('favor'); expect(s.relationships.Dạ).toBe(4); expect(s.hiddenXp).toEqual(before); expect(s.xp).toBe(xp); const gold = s.gold; s = reduce(s, { type: 'claim', id: 'hunt' }); expect(s.choice).toBeNull(); expect(s.gold).toBe(gold); });
    it('nhiệm vụ có điều kiện nhận và giao hàng có tiến trình thật', () => { let s = createGame(); expect(reduce(s, { type: 'accept', id: 'cargo' }).accepted).not.toContain('cargo'); s.claimed.push('first'); s.unlocked = 2; s.known.push('root'); s = reduce(s, { type: 'accept', id: 'cargo' }); expect(s.bag.parcel).toBe(1); const limit = weightLimit(s); expect(limit).toBe(14); s.edges.push('root|village'); s = reduce(s, { type: 'travel', id: 'root' }); s = run(s, 12); expect(s.location).toBe('root'); expect(s.bag.parcel).toBe(0); expect(questProgress(s, 'cargo')).toBe(1); });
    it('danh hiệu thương hội chỉ giảm giá mua; chỉ một hiệu ứng', () => { let s = createGame(); const power = attackPower(s); s.ownedTitles = ['merchant', 'survivor']; s = reduce(s, { type: 'title', id: 'merchant' }); expect(buyPrice(s, 'staff')).toBeLessThan(itemPrice('staff')); expect(attackPower(s)).toBe(power); s = reduce(s, { type: 'title', id: 'survivor' }); expect(buyPrice(s, 'staff')).toBe(itemPrice('staff')); expect(s.activeTitle).toBe('survivor'); });
    it('mua rồi bán không tạo lợi nhuận', () => { let s = createGame(); const old = s.gold; s = reduce(s, { type: 'buy', id: 'hp' }); s = reduce(s, { type: 'sell', id: 'hp' }); expect(s.gold).toBeLessThan(old); });
    it('truy hồi tiền/đồ/gear một lần; kho và ngân hàng an toàn', () => { let s = createGame(); s.bank = 100; s.storage.herb = 4; s.recoveries = [{ id: 9, location: 'village', gold: 25, bag: { herb: 3 }, gear: [{ uid: 7, id: 'bow', durability: 80 }], claimed: false, kind: 'drop' }]; s.nextId = 10; const old = s.gold; s = reduce(s, { type: 'recover', value: 9 }); expect(s.gold).toBe(old + 25); const same = reduce(s, { type: 'recover', value: 9 }); expect(same.gold).toBe(s.gold); expect(same.gear).toHaveLength(2); expect(same.bank).toBe(100); expect(same.storage.herb).toBe(4); });
    it('thất bại mất vũ khí vẫn được kiếm cơ bản khi cứu, không tự farm', () => { let s = farming(1, { retreat: 0, hp: 0, mp: 0, sta: 0 }); s.stats.agility = 1; s.battle!.enemy = { ...monster('hound') }; s = run(s, 1); expect(s.gear).toHaveLength(0); s = choose(s, 'rescue'); expect(s.gear.some(g => g.id === 'sword')).toBe(true); expect(s.activity).toBeNull(); expect(s.hp).toBeGreaterThan(0); });
    it('cất cả trang bị trong kho, lấy lại không tạo hồi miễn phí', () => { let s = createGame(); s.hp = 10; s = reduce(s, { type: 'storeGear', value: 1 }); expect(s.gear).toHaveLength(0); expect(s.storedGear).toHaveLength(1); s = reduce(s, { type: 'withdrawGear', value: 1 }); expect(s.gear).toHaveLength(1); expect(s.storedGear).toHaveLength(0); expect(s.hp).toBe(10); });
    it('mỗi nghề chỉ trả đầu ra sau đủ nhịp và chỉ một lần', () => { for (const id of ['alchemy', 'tavern', 'cooking', 'sewing']) {
        let s = createGame();
        s.bag.herb = 5;
        s.bag.cloth = 3;
        s = reduce(s, { type: 'job', id });
        const duration = s.activity!.total;
        s = run(s, duration - 1);
        expect(s.jobs[id] || 0).toBe(0);
        s = run(s, 1);
        expect(s.jobs[id]).toBe(1);
        expect(run(s, 50).jobs[id]).toBe(1);
    } });
});
function itemPrice(id: string) { return items.find(i => i.id === id)!.price; }
describe('bản lưu, dữ liệu và mô phỏng', () => {
    it('giữ đúng lựa chọn chờ, battle, hidden XP và seed lớn', () => { for (const s of [reduce(createGame(0xffffffff), { type: 'explore' }), travelling(), farming(), turn('boss2')])
        expect(importSave(exportSave(s))).toEqual(s); });
    it('từ chối hỏng/sai version/seed/STA/tham chiếu', () => { expect(() => importSave('{')).toThrow(); for (const patch of [{ version: 9 }, { sta: -1 }, { seed: 1e12 }, { location: 'missing' }, { active: ['not-real'] }, { stats: { strength: 21, agility: 4, vitality: 3, intellect: 2 } }])
        expect(() => validateSave({ ...createGame(), ...patch })).toThrow(); });
    it('migration v1 giữ phần thưởng, lựa chọn, RNG; không bốc lại', () => { const old: any = structuredClone(createGame(55)); old.version = 1; old.stats = { strength: 6, agility: 6, vitality: 6, intellect: 6 }; old.hp = 50; old.mp = 20; delete old.sta; old.points = 3; old.claimed = ['first']; old.choice = { kind: 'fork', title: 'Ngã rẽ', text: 'Chọn đường', options: [{ id: 'road', label: 'Đi đường tro' }] }; const migrated = validateSave(old); expect(migrated.version).toBe(2); expect(migrated.seed).toBe(55); expect(migrated.claimed).toEqual(['first']); expect(migrated.choice?.title).toBe('Ngã rẽ'); expect(migrated.stats.strength).toBe(3); expect(migrated.hp).toBe(15); expect(migrated.paused).toBe(true); expect(migrated.levelRolls).toHaveLength(0); expect(migrateSave(migrated)).toEqual(migrated); });
    it('dữ liệu không trùng ID/thiếu liên kết/nguồn/chu trình nhiệm vụ', () => { expect(validateContent()).toEqual([]); for (let f = 1; f <= 3; f++)
        expect(places.filter(p => p.floor === f).length).toBeGreaterThanOrEqual(5); expect(monsters.filter(m => !m.special)).toHaveLength(8); expect(skills.length).toBeGreaterThanOrEqual(12); expect(items.length).toBeGreaterThanOrEqual(20); expect(quests.length).toBeGreaterThanOrEqual(6); expect(titles).toHaveLength(4); });
    it('tiến bộ 100 cấp giữ thang nhỏ theo giả định mô phỏng', () => { const study = progressionStudy(20); expect(study.min).toBeGreaterThanOrEqual(15); expect(study.max).toBeLessThanOrEqual(20); expect(study.earliestCap).toBeGreaterThan(50); expect(study.milestones[10].max).toBeLessThan(12); });
    it('boss có thể thắng với chuẩn bị hợp lý ở mỗi tầng', () => { for (let f = 1; f <= 3; f++) {
        const results = Array.from({ length: 10 }, (_, i) => bossStudy(f, i + 1));
        expect(results.filter(x => x.win).length).toBeGreaterThanOrEqual(7);
    } });
});
it('JSON đổi thứ tự thuộc tính quái vẫn là bản lưu hợp lệ',()=>{const s=turn('boss1');const raw=JSON.parse(exportSave(s));raw.state.battle.enemy=Object.fromEntries(Object.entries(raw.state.battle.enemy).reverse());expect(importSave(JSON.stringify(raw)).battle?.enemy.id).toBe('boss1');});
it('từ chối trộn trang bị vào túi vật phẩm và UID truy hồi ngoài phạm vi',()=>{const s=createGame();s.bag.sword=1;expect(()=>validateSave(s)).toThrow();const r=createGame();r.recoveries=[{id:9,location:'village',gold:0,bag:{},gear:[{uid:999,id:'bow',durability:100}],kind:'drop',claimed:false}];expect(()=>validateSave(r)).toThrow();});
it('boss rễ hút STA khi bỏ phòng thủ, phòng thủ ngăn hút',()=>{const s=turn('boss2');s.battle!.round=2;s.stats.agility=1;s.sta=20;const defended=reduce(s,{type:'turn',id:'defend'});const open=reduce(s,{type:'turn',id:'attack'});expect(open.sta).toBe(17);expect(defended.sta).toBeCloseTo(20.6);});
it('phép có hiệu quả rèn INT và thành thạo phép, không cộng thành thạo kiếm',()=>{let s=turn('boss1');s=reduce(s,{type:'turn',id:'fire'});expect(s.weaponMastery.phép).toBe(1);expect(s.weaponMastery.kiếm||0).toBe(0);expect(s.hiddenXp.intellect).toBeGreaterThan(0);expect(s.hiddenXp.strength).toBe(0);});
it('bộ kiểm tra dữ liệu phát hiện đường thiếu và mục tiêu vượt nguồn hữu hạn',()=>{const old=quests[0].target;try{places[0].links.push('missing-link');quests[0].target=999;const errors=validateContent();expect(errors.some(e=>e.includes('missing-link'))).toBe(true);expect(errors.some(e=>e.includes('nguồn hữu hạn'))).toBe(true);}finally{places[0].links.pop();quests[0].target=old;}expect(validateContent()).toEqual([]);});
it('bản lưu hỏng ở đầu ra nghề hoặc nhánh lựa chọn bị từ chối trước khi chạy',()=>{const s=reduce(createGame(),{type:'job',id:'tavern'});s.activity!.output='khong-ton-tai';expect(()=>validateSave(s)).toThrow();const q=createGame();q.kills=5;const waiting=reduce(q,{type:'claim',id:'hunt'});waiting.choice!.options[0].id='khong-ton-tai';expect(()=>validateSave(waiting)).toThrow();});
