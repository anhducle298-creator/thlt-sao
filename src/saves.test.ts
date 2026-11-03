import 'fake-indexeddb/auto';
import { it, expect } from 'vitest';
import { createGame, reduce } from './engine';
import { saveSlot, loadSlot, listSaves } from './saves';
it('IndexedDB giữ nhiều ô riêng biệt và lựa chọn chờ', async () => { const a = reduce(createGame(55), { type: 'explore' }); const b = createGame(90); b.gold = 999; await saveSlot('1', a); await saveSlot('2', b); expect(await loadSlot('1')).toEqual(a); expect((await loadSlot('2')).gold).toBe(999); expect((await listSaves()).length).toBe(2); await expect(loadSlot('empty')).rejects.toThrow(); });
