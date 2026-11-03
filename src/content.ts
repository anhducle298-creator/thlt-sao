export type Slot = 'vũ khí' | 'phụ trợ' | 'đầu' | 'thân' | 'tay' | 'chân' | 'giày' | 'áo choàng' | 'phụ kiện';
export type Item = {
    id: string;
    name: string;
    price: number;
    slot?: Slot;
    power: number;
    rarity: 'Thường' | 'Hiếm' | 'Sử thi';
    set?: string;
};
export const items: Item[] = [
    { id: 'sword', name: 'Kiếm của người lữ hành', price: 20, slot: 'vũ khí', power: 1, rarity: 'Thường' },
    { id: 'bow', name: 'Cung gỗ tần bì', price: 35, slot: 'vũ khí', power: 2, rarity: 'Thường' },
    { id: 'staff', name: 'Trượng thủy tinh', price: 45, slot: 'vũ khí', power: 2, rarity: 'Hiếm' },
    ...(['phụ trợ', 'đầu', 'thân', 'tay', 'chân', 'giày', 'áo choàng', 'phụ kiện'] as Slot[]).map((slot, i) => ({ id: `ash${i}`, name: ['Khiên Tro', 'Mũ Tro', 'Giáp Tro', 'Găng Tro', 'Quần Tro', 'Ủng Tro', 'Áo choàng Tro', 'Nhẫn Tro'][i], price: 30 + i * 8, slot, power: 0, rarity: 'Hiếm' as const, set: 'Tro' })),
    { id: 'moonblade', name: 'Kiếm Nguyệt Tàn', price: 180, slot: 'vũ khí', power: 4, rarity: 'Sử thi' },
    { id: 'axe', name: 'Rìu người khai mỏ', price: 65, slot: 'vũ khí', power: 3, rarity: 'Hiếm' },
    { id: 'dagger', name: 'Dao gió lặng', price: 55, slot: 'vũ khí', power: 2, rarity: 'Hiếm' },
    { id: 'sta', name: 'Nước hạt đèn', price: 7, power: 12, rarity: 'Thường' },
    { id: 'map', name: 'Bản đồ đường mỏ', price: 18, power: 0, rarity: 'Thường' },
    { id: 'parcel', name: 'Kiện hàng thương hội', price: 0, power: 0, rarity: 'Thường' },
    { id: 'hp', name: 'Thuốc sinh lực', price: 8, power: 18, rarity: 'Thường' },
    { id: 'mp', name: 'Thuốc tinh thần', price: 8, power: 10, rarity: 'Thường' },
    { id: 'escape', name: 'Ấn thoát hiểm', price: 20, power: 0, rarity: 'Hiếm' },
    { id: 'herb', name: 'Thảo dược xám', price: 3, power: 0, rarity: 'Thường' },
    { id: 'ore', name: 'Quặng tro', price: 4, power: 0, rarity: 'Thường' },
    { id: 'cloth', name: 'Vải bóng đêm', price: 4, power: 0, rarity: 'Thường' },
    { id: 'soup', name: 'Canh nấm ấm', price: 12, power: 24, rarity: 'Thường' },
    { id: 'key', name: 'Mảnh ấn cổng', price: 0, power: 0, rarity: 'Sử thi' },
    { id: 'fang', name: 'Nanh thú Eidolon', price: 5, power: 0, rarity: 'Thường' },
    { id: 'crystal', name: 'Tinh thể âm vang', price: 10, power: 0, rarity: 'Hiếm' }
];
export const item = (id: string) => items.find(x => x.id === id)!;
export const skills = [
    { id: 'slash', name: 'Trảm tro', path: 'kiếm', mp: 0, cd: 2, mult: 1.8, element: 'vật lý', effect: '' },
    { id: 'pierce', name: 'Xuyên giáp', path: 'kiếm', mp: 1, cd: 3, mult: 2.3, element: 'vật lý', effect: '' },
    { id: 'flurry', name: 'Liên trảm', path: 'kiếm', mp: 2, cd: 4, mult: 3, element: 'vật lý', effect: '' },
    { id: 'shot', name: 'Tên xuyên gió', path: 'cung', mp: 0, cd: 2, mult: 1.9, element: 'gió', effect: '' },
    { id: 'poison', name: 'Tên độc', path: 'cung', mp: 1, cd: 3, mult: 1.4, element: 'gió', effect: 'độc' },
    { id: 'storm', name: 'Mưa tên', path: 'cung', mp: 2, cd: 4, mult: 3, element: 'gió', effect: '' },
    { id: 'fire', name: 'Lửa ký ức', path: 'phép', mp: 3, cd: 2, mult: 2.1, element: 'lửa', effect: '' },
    { id: 'ice', name: 'Sương xiềng', path: 'phép', mp: 4, cd: 3, mult: 1.8, element: 'băng', effect: 'chậm' },
    { id: 'light', name: 'Quang âm', path: 'phép', mp: 6, cd: 4, mult: 3.3, element: 'ánh sáng', effect: '' },
    { id: 'heal', name: 'Mạch sống', path: 'phòng thủ', mp: 4, cd: 3, mult: 0, element: 'ánh sáng', effect: 'hồi' },
    { id: 'bash', name: 'Khiên chấn', path: 'phòng thủ', mp: 0, cd: 2, mult: 1.5, element: 'vật lý', effect: 'chậm' },
    { id: 'ward', name: 'Màn tro', path: 'phòng thủ', mp: 3, cd: 3, mult: 0, element: 'vật lý', effect: 'khiên' }
];
export type Monster = {
    id: string;
    name: string;
    hp: number;
    atk: number;
    speed: number;
    xp: number;
    gold: number;
    weak: string;
    resist: string;
    kind: 'wild' | 'organized' | 'cursed';
    special?: boolean;
    boss?: boolean;
    mechanic?: string;
};
export const monsters: Monster[] = [
    { id: 'wolf', name: 'Sói tro', hp: 16, atk: 4, speed: 4, xp: 18, gold: 7, weak: 'lửa', resist: 'băng', kind: 'wild' },
    { id: 'moth', name: 'Ngài thủy tinh', hp: 14, atk: 4, speed: 5, xp: 19, gold: 8, weak: 'gió', resist: 'ánh sáng', kind: 'wild' },
    { id: 'rat', name: 'Chuột mỏ quặng', hp: 19, atk: 4, speed: 3, xp: 20, gold: 7, weak: 'băng', resist: 'vật lý', kind: 'wild' },
    { id: 'bandit', name: 'Kẻ cướp mặt sắt', hp: 24, atk: 5, speed: 5, xp: 30, gold: 14, weak: 'băng', resist: 'gió', kind: 'organized' },
    { id: 'vine', name: 'Dây leo khát sáng', hp: 27, atk: 6, speed: 3, xp: 34, gold: 14, weak: 'lửa', resist: 'gió', kind: 'cursed' },
    { id: 'wisp', name: 'Đốm hồn lạc', hp: 23, atk: 6, speed: 6, xp: 38, gold: 16, weak: 'ánh sáng', resist: 'vật lý', kind: 'cursed' },
    { id: 'sentinel', name: 'Vệ binh rỗng', hp: 34, atk: 7, speed: 4, xp: 50, gold: 22, weak: 'gió', resist: 'vật lý', kind: 'organized' },
    { id: 'hound', name: 'Khuyển đồng hồ', hp: 31, atk: 8, speed: 6, xp: 52, gold: 24, weak: 'băng', resist: 'lửa', kind: 'wild' },
    { id: 'leader1', name: 'Hắc đội trưởng Vey', hp: 40, atk: 6, speed: 5, xp: 85, gold: 45, weak: 'băng', resist: 'vật lý', kind: 'organized', special: true },
    { id: 'leader2', name: 'Người dệt tang', hp: 55, atk: 8, speed: 6, xp: 120, gold: 65, weak: 'lửa', resist: 'gió', kind: 'cursed', special: true },
    { id: 'boss1', mechanic: 'Chuông báo nhịp: mỗi vòng thứ ba gây sát thương gấp ba. Phòng thủ giảm 70%.', name: 'Người Giữ Chuông Câm', hp: 55, atk: 7, speed: 4, xp: 150, gold: 80, weak: 'gió', resist: 'vật lý', kind: 'organized', special: true, boss: true },
    { id: 'boss2', mechanic: 'Rễ siết: vòng thứ ba gây sát thương gấp ba và hút 3 STA; phòng thủ ngăn hút STA.', name: 'Mẫu Rễ Không Mặt', hp: 75, atk: 9, speed: 5, xp: 230, gold: 120, weak: 'lửa', resist: 'băng', kind: 'cursed', special: true, boss: true },
    { id: 'boss3', mechanic: 'Mũi khâu hồn: vòng thứ ba gây sát thương gấp ba và rút 2 MP; phòng thủ ngăn rút MP.', name: 'Kẻ Khâu Bình Minh', hp: 95, atk: 11, speed: 6, xp: 350, gold: 200, weak: 'ánh sáng', resist: 'gió', kind: 'cursed', special: true, boss: true }
];
export const monster = (id: string) => monsters.find(m => m.id === id)!;
export type Place = {
    id: string;
    floor: number;
    name: string;
    description: string;
    type: 'village' | 'field' | 'ruin' | 'boss';
    enemies: string[];
    links: string[];
    minutes: number;
};
export const places: Place[] = [
    { id: 'village', floor: 1, name: 'Làng Đèn Cuối', description: 'Những ngọn đèn đồng không bao giờ tắt. Đây là nơi những người lạc thế giới bắt đầu lại.', type: 'village', enemies: [], links: ['road', 'grove'], minutes: 0 },
    { id: 'road', floor: 1, name: 'Đường tro trắng', description: 'Dấu chân chìm trong lớp bụi ấm. Tiếng chuông đã mất âm vang vẫn gọi từ phía bắc.', type: 'field', enemies: ['wolf', 'moth'], links: ['village', 'mine', 'bell'], minutes: 30 },
    { id: 'grove', floor: 1, name: 'Lùm tần bì', description: 'Những dải vải buộc trên cây nhắc người sống về đường về.', type: 'field', enemies: ['moth', 'wolf'], links: ['village', 'mine'], minutes: 12 },
    { id: 'mine', floor: 1, name: 'Mỏ than nguội', description: 'Một vết ấn phát sáng dưới quặng. Đội cướp mặt sắt đang lùng tìm nó.', type: 'ruin', enemies: ['rat', 'bandit'], links: ['road', 'grove', 'bell'], minutes: 18 },
    { id: 'bell', floor: 1, name: 'Tháp chuông câm', description: 'Ba mảnh ấn và chiến công của một người sống sẽ đánh thức cổng.', type: 'boss', enemies: ['boss1'], links: ['road', 'mine'], minutes: 20 },
    { id: 'root', floor: 2, name: 'Bến rễ', description: 'Một bến đá lơ lửng trên biển rễ. Đèn làng vẫn soi lối trở về.', type: 'field', enemies: ['vine', 'bandit'], links: ['garden', 'camp'], minutes: 12 },
    { id: 'garden', floor: 2, name: 'Vườn không mặt', description: 'Hoa quay về phía những ký ức thay vì ánh sáng.', type: 'field', enemies: ['vine', 'wisp'], links: ['root', 'pond'], minutes: 18 },
    { id: 'camp', floor: 2, name: 'Trại mặt sắt', description: 'Một người đưa thư bị giam sau hàng rào; đội trưởng giữ chìa khóa.', type: 'ruin', enemies: ['bandit', 'vine'], links: ['root', 'pond'], minutes: 20 },
    { id: 'pond', floor: 2, name: 'Hồ gương đen', description: 'Gương nước phản chiếu một bình minh chưa từng đến.', type: 'field', enemies: ['wisp', 'vine'], links: ['garden', 'camp', 'heart'], minutes: 24 },
    { id: 'heart', floor: 2, name: 'Tim rừng', description: 'Mẫu Rễ ôm chặt cổng bằng những bàn tay gỗ.', type: 'boss', enemies: ['boss2'], links: ['pond'], minutes: 25 },
    { id: 'quay', floor: 3, name: 'Bến giờ lạc', description: 'Thời gian ở đây rơi thành những giọt đồng.', type: 'field', enemies: ['hound', 'sentinel'], links: ['forge', 'library'], minutes: 12 },
    { id: 'forge', floor: 3, name: 'Lò sao tắt', description: 'Những vệ binh vẫn rèn giáp cho một đoàn quân không trở lại.', type: 'field', enemies: ['sentinel', 'hound'], links: ['quay', 'bridge'], minutes: 18 },
    { id: 'library', floor: 3, name: 'Thư viện im', description: 'Người dệt tang cất giữ thư của những kẻ mắc kẹt trong tháp.', type: 'ruin', enemies: ['wisp', 'sentinel'], links: ['quay', 'bridge'], minutes: 22 },
    { id: 'bridge', floor: 3, name: 'Cầu kim phút', description: 'Cầu rung theo nhịp một trái tim khổng lồ.', type: 'field', enemies: ['hound', 'sentinel'], links: ['forge', 'library', 'dawn'], minutes: 30 },
    { id: 'dawn', floor: 3, name: 'Cổng bình minh', description: 'Kẻ Khâu Bình Minh canh giữ vết rách giữa hai tầng.', type: 'boss', enemies: ['boss3'], links: ['bridge'], minutes: 25 }
];
export const place = (id: string) => places.find(p => p.id === id)!;
export type Quest = {
    id: string;
    name: string;
    description: string;
    kind: string;
    target: number;
    reward: number;
    giver: string;
    motive: string;
    requires: string[];
    relation: number;
    items: Record<string, number>;
    title?: string;
    repeatable: false;
    failure: string;
    branches: {
        id: string;
        label: string;
        goldFactor: number;
        relation: number;
        flag: string;
    }[];
};
const q = (x: Partial<Quest> & Pick<Quest, 'id' | 'name' | 'description' | 'kind' | 'target' | 'reward'>): Quest => ({ giver: 'Nhiên', motive: 'Giữ ngọn đèn của làng và những người lạc giới được an toàn.', requires: [], relation: 0, items: {}, repeatable: false, failure: 'Không hết hạn; thất bại chiến đấu chỉ làm gián đoạn. Có thể bỏ rồi nhận lại nếu chưa nhận thưởng.', branches: [{ id: 'pay', label: 'Nhận thù lao', goldFactor: 1, relation: 1, flag: 'paid' }, { id: 'favor', label: 'Tặng lại thù lao · quan hệ +4', goldFactor: 0, relation: 4, flag: 'generous' }], ...x });
export const quests: Quest[] = [
    q({ id: 'first', name: 'Một chỗ giữa tro', description: 'Khám phá 3 địa điểm ngoài làng.', kind: 'explore', target: 3, reward: 30, title: 'wanderer' }),
    q({ id: 'hunt', name: 'Đêm không tiếng hú', description: 'Đánh bại 5 quái thường.', kind: 'kills', target: 5, reward: 35, giver: 'Dạ', motive: 'Đàn thú chặn đường tuần tra.', items: { hp: 1 } }),
    q({ id: 'herbs', name: 'Ấm thuốc của Nhiên', description: 'Mang về 4 thảo dược (tiêu hao).', kind: 'herb', target: 4, reward: 20, relation: 2, items: { mp: 1 } }),
    q({ id: 'leader', name: 'Thư chưa gửi', description: 'Hạ Hắc đội trưởng Vey, sau đó chọn cách cứu người đưa thư.', kind: 'courier', target: 1, reward: 50, giver: 'Dạ', requires: ['first'], items: { escape: 1 } }),
    q({ id: 'weaver', name: 'Người dệt ký ức', description: 'Đánh bại Người dệt tang ở thư viện.', kind: 'leader2', target: 1, reward: 75, requires: ['leader'], items: { crystal: 2 } }),
    q({ id: 'tower', name: 'Ba lần bình minh', description: 'Vượt qua 3 boss của bản đầu.', kind: 'bosses', target: 3, reward: 100, title: 'dawn' }),
    q({ id: 'recovery', name: 'Nhặt lại tên mình', description: 'Truy hồi một gói tài sản thất lạc.', kind: 'recovered', target: 1, reward: 20, giver: 'Dạ', title: 'survivor' }),
    q({ id: 'cargo', name: 'Hàng cho Bến rễ', description: 'Mang kiện hàng từ làng tới Bến rễ (nặng 5 kg); giao hàng tại nơi đến.', kind: 'cargo', target: 1, reward: 40, giver: 'Liên · Thương hội', requires: ['first'], motive: 'Bến rễ thiếu vải và đèn. Trả hàng an toàn để mở hợp đồng thương hội.', title: 'merchant' }),
    q({ id: 'runes', name: 'Giải mã chuông câm', description: 'Nghiên cứu tại Mỏ than nguội đủ 20 phút, rồi báo cáo.', kind: 'runes', target: 20, reward: 0, requires: ['first'], items: { crystal: 1 }, motive: 'Văn tự dưới mỏ hé lộ lối tới tháp chuông.' }),
    q({ id: 'apprentice', name: 'Một nghề giữa đêm', description: 'Hoàn thành 3 lần pha chế.', kind: 'alchemy', target: 3, reward: 15, relation: 2, items: { herb: 2 }, motive: 'Nhiên cần một người kế tục công thức pha thuốc.' })
];
export const professions = [{ id: 'alchemy', name: 'Pha chế', minutes: 8, cost: 3, input: 'herb', qty: 2, output: 'hp' }, { id: 'tavern', name: 'Phục vụ quán rượu', minutes: 15, cost: 0, input: '', qty: 0, output: '' }, { id: 'cooking', name: 'Nấu ăn', minutes: 10, cost: 3, input: 'herb', qty: 1, output: 'soup' }, { id: 'sewing', name: 'May vá', minutes: 12, cost: 5, input: 'cloth', qty: 2, output: 'ash3' }];
export const titles = [
    { id: 'wanderer', name: 'Người giữ đường', description: 'Khám phá và báo cáo 3 địa điểm.', effect: 'Ghi nhận thành tích; không cộng chỉ số.', kind: 'cosmetic' },
    { id: 'merchant', name: 'Bạn của thương hội', description: 'Giao kiện hàng tới Bến rễ.', effect: 'Kích hoạt: giảm 5% giá mua cửa hàng, mở hợp đồng chở hàng.', kind: 'trade' },
    { id: 'survivor', name: 'Người nhặt lại tên', description: 'Truy hồi tài sản và báo cáo.', effect: 'Kích hoạt: phí cứu hộ giảm từ 5 xuống 3 đồng.', kind: 'rescue' },
    { id: 'dawn', name: 'Người khâu bình minh', description: 'Hoàn thành ba cổng và báo cáo.', effect: 'Ghi nhận hoàn thành bản đầu; không cộng sát thương.', kind: 'cosmetic' }
];
export const passives = [{ id: 'breath', name: 'Nhịp thở vững', level: 3, description: 'Hồi STA khi nghỉ ngoài giao tranh tăng 5%.' }, { id: 'focus', name: 'Ý niệm trong tro', level: 5, description: 'Hồi MP khi nghỉ tăng 5%.' }];
export const travelEvents = [{ id: 'road-enemy', kind: 'encounter', minFloor: 1, weight: 40 }, { id: 'ash-chest', kind: 'chest', minFloor: 1, weight: 20 }, { id: 'thread-trap', kind: 'trap', minFloor: 1, weight: 15 }, { id: 'trail-clue', kind: 'clue', minFloor: 1, weight: 15 }, { id: 'lantern-npc', kind: 'traveler', minFloor: 1, weight: 10 }];
export const chapters = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, first: i * 10 + 1, last: (i + 1) * 10, releasedFloors: i === 0 ? [1, 2, 3] : [] }));
export const endingAtFloor100 = { floor: 100, requires: 'boss100', choices: ['Trở về thế giới cũ', 'Ở lại Eidolon'], influences: ['relationships', 'questBranches'] };
