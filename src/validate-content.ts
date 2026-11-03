import { items, skills, monsters, places, quests, professions, titles, travelEvents, chapters } from './content';
import { equipmentRules, skillSta, BALANCE } from './balance';
export function validateContent() {
    const errors: string[] = [];
    for (const [name, data] of Object.entries({ items, skills, monsters, places, quests, professions, titles, travelEvents })) {
        const ids = data.map(x => x.id);
        if (new Set(ids).size !== ids.length)
            errors.push(`${name}: ID trùng.`);
    }
    const has = (data: {
        id: string;
    }[], id: string) => data.some(x => x.id === id);
    for (const p of places) {
        if (p.minutes < 0 || p.floor < 1 || p.floor > 100)
            errors.push(`Địa điểm ${p.id}: thời gian/tầng không hợp lệ.`);
        for (const link of p.links) {
            if (!has(places, link))
                errors.push(`${p.id}: thiếu liên kết ${link}`);
            else if (!places.find(x => x.id === link)!.links.includes(p.id))
                errors.push(`${p.id} ↔ ${link}: đường không hai chiều.`);
        }
        for (const m of p.enemies)
            if (!has(monsters, m))
                errors.push(`${p.id}: quái ${m} không tồn tại.`);
    }
    const visited = new Set<string>();
    const queue = ['village'];
    while (queue.length) {
        const id = queue.shift()!;
        if (visited.has(id))
            continue;
        visited.add(id);
        for (const link of places.find(p => p.id === id)?.links || [])
            queue.push(link);
    }
    // Unlocked portals explicitly connect the three floor networks.
    for (const entry of ['root', 'quay']) {
        queue.push(entry);
        while (queue.length) {
            const id = queue.shift()!;
            if (visited.has(id))
                continue;
            visited.add(id);
            queue.push(...(places.find(p => p.id === id)?.links || []));
        }
    }
    for (const p of places)
        if (!visited.has(p.id))
            errors.push(`Không thể tới ${p.id}`);
    const kinds = ['explore', 'kills', 'herb', 'courier', 'leader2', 'bosses', 'recovered', 'cargo', 'runes', 'alchemy'];
    for (const q of quests) {
        if (!kinds.includes(q.kind) || q.target < 1 || !q.giver || !q.motive || !q.branches.length)
            errors.push(`${q.id}: mục tiêu/nhánh không hoàn thành được.`);
        if ((q.kind === 'explore' && q.target > places.length - 1) || (q.kind === 'bosses' && q.target > monsters.filter(m => m.boss).length) || (['courier','leader2','cargo'].includes(q.kind) && q.target > 1)) errors.push(`${q.id}: mục tiêu vượt nguồn hữu hạn.`);
        for (const r of q.requires)
            if (!has(quests, r))
                errors.push(`${q.id}: thiếu điều kiện ${r}`);
        for (const id of Object.keys(q.items))
            if (!has(items, id))
                errors.push(`${q.id}: phần thưởng thiếu ${id}`);
        if (q.title && !has(titles, q.title))
            errors.push(`${q.id}: thiếu danh hiệu ${q.title}`);
        const loop = (id: string, path: string[]): boolean => path.includes(id) || (quests.find(x => x.id === id)?.requires.some(n => loop(n, [...path, id])) || false);
        if (loop(q.id, []))
            errors.push(`${q.id}: điều kiện nhiệm vụ tạo chu trình.`);
    }
    for (const i of items) {
        const source = i.price > 0 || i.id === 'key' || i.id === 'parcel' || professions.some(j => j.output === i.id) || quests.some(q => (q.items[i.id] || 0) > 0);
        if (!source)
            errors.push(`${i.id}: vật phẩm không có nguồn.`);
        if (i.slot && !equipmentRules[i.id])
            errors.push(`${i.id}: thiếu quy tắc trang bị.`);
        if (i.price < 0)
            errors.push(`${i.id}: giá âm.`);
    }
    for (const j of professions)
        if (j.minutes < 1 || j.cost < 0 || (j.input && !has(items, j.input)) || (j.output && !has(items, j.output)))
            errors.push(`${j.id}: công thức không hợp lệ.`);
    for (const k of skills)
        if (!(k.id in skillSta) || k.mp < 0 || k.cd < 0)
            errors.push(`${k.id}: chi phí/hồi chiêu sai.`);
    for (const p of BALANCE.safePlaces)
        if (!has(places, p))
            errors.push(`Điểm nghỉ ${p} không tồn tại.`);
    if (chapters.length !== 10 || chapters[9].last !== 100)
        errors.push('Chương không phủ 100 tầng.');
    return errors;
}
