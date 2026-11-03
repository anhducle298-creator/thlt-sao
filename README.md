# sao-thaolt · Tháp Tro Tàn v0.2

Game nhập vai text tiếng Việt bằng **TypeScript, React, Vite**, chạy tại máy, không tài khoản/backend/cloud/AI. An, một phụ nữ 28 tuổi từ thế giới hiện đại, bị kéo vào Eidolon. Bối cảnh, nhân vật và địa danh nguyên bản. Bắt giữ và thất bại phi tình dục; tình cảm chỉ giữa người trưởng thành tự nguyện, chuyển cảnh kín đáo.

## Chạy trên Windows

Cài **Node.js 22 LTS hoặc mới hơn**. Mở PowerShell trong thư mục `sao-thaolt`:

```powershell
npm install
npm run dev
```

Mở URL Vite in ra, thường là `http://localhost:5173`. Giữ terminal đang chạy. Sau khi cài dependencies, chơi không cần Internet; không tải ảnh/font/API bên ngoài. Không có service worker: vẫn cần local server khi chơi offline.

```powershell
npm test
npm run check:data
npm run build
npm run preview
```

Bản build nằm trong `dist/`, phải được phục vụ qua HTTP, không mở trực tiếp `file://`. Dùng cùng địa chỉ và cổng để đọc lại dữ liệu IndexedDB.

## Bắt đầu chơi

1. Tại làng, nói chuyện với Nhiên để mở quan hệ và nhiệm vụ, chọn tối đa 4 kỹ năng, mua thuốc, gửi tiền/cất đồ khi cần.
2. Khám phá khu vực để chọn lối đi. Khảo sát địa điểm mới mở thông tin đường kề bên; chỉ đoạn thật sự đi qua mới được ghi là đã đi.
3. Tới **Lùm tần bì** để farm. Điều chỉnh HP/MP/STA, ngưỡng nghỉ/rút lui và số quái. Mục tiêu ban đầu 3–6 quái hợp lý hơn một chuyến dài. Luôn có thể yêu cầu dừng sau trận hoặc thử rút lui ngay.
4. Nhận thưởng nhiệm vụ bằng **Báo cáo & chọn phần thưởng**. Một số nhiệm vụ cần quan hệ, nhiệm vụ trước hoặc tầng đã mở. Nhánh tặng thù lao tăng quan hệ nhiều hơn; không cộng thêm XP chỉ số chỉ vì báo cáo.
5. Có 3 mảnh ấn và ít nhất 3 chiến thắng, tới **Tháp chuông câm** để đánh boss. Chuẩn bị HP, thuốc và kỹ năng đánh vào điểm yếu. Đòn tích lực được báo trước; phòng thủ ở vòng thứ ba.
6. Boss mở cổng tới tầng tiếp theo. Có đường hồi hương 12 phút về làng, và cổng tới Bến rễ/Bến giờ lạc sau khi được mở. Kết thúc tầng 3 hiển thị hoàn thành bản thử nghiệm, không coi là đã vượt tầng 100.

Bản đồ mua tại cửa hàng mở thông tin Mỏ/Tháp chuông, không tự đánh dấu là đã đi. Dấu vết trong hành trình cũng có thể mở thông tin. Dùng thuốc, đọc bản đồ, cất/bán/bỏ đồ trong Túi đồ. Trang bị cũng cất được vào kho.

## Đồng hồ và STA

**1 giây thực = 1 phút game = 1 nhịp.** Đường 30 phút cần đúng 30 nhịp đi bộ; chiến đấu và sự kiện cộng thời gian riêng. Engine không chứa timer. React chỉ có một interval 1 giây khi được phép mô phỏng.

Lựa chọn, bảng quản lý, tab ẩn, tạm dừng và chờ lượt quan trọng không trôi giờ, không hồi phục, không cộng bù. Tải lại luôn tạm dừng và không có tiến trình offline. Các lựa chọn có chi phí thời gian áp dụng số phút ghi rõ sau khi xác nhận; khoảng chờ đọc không tính.

Nhân vật bắt đầu **STR 3 / AGI 4 / VIT 3 / INT 2**, HP 30, MP 11, STA 25. Chỉ số gốc tối đa 20, tổng sau trang bị tối đa 25. Không có điểm tự phân phối.

Công thức tập trung ở `src/balance.ts`:

- HP tối đa = 15 + 5 × VIT; MP = 5 + 3 × INT; STA = 10 + 5 × VIT.
- Hồi đầy STA cơ bản: `max(30, 60 − 1,5 × VIT)` phút; MP: `max(45, 100 − 2 × INT)` phút.
- Hồi mỗi phút = giới hạn tài nguyên / thời gian hồi đầy. Giữ phần lẻ trong state, chỉ làm tròn khi hiển thị.
- Chiến đấu: không hồi thụ động. Phòng thủ là hành động chủ động hồi 0,6 STA, không hồi MP miễn phí.
- Đi bộ: 25% mức hồi STA/MP, trừ chi phí STA theo tải. Hiển thị STA ròng/phút.
- Nghỉ ngoài giao tranh: 100%; tại điểm an toàn: 200%; ngủ nhà trọ: 400%. HP hồi chậm theo thời gian, không tự đầy khi kết thúc nghỉ.
- STA ≤ 30% cảnh báo, ≤ 10% giảm 30% hiệu suất vật lý/tốc độ. 0 STA vẫn đánh yếu/phòng thủ được. Né thành công tốn 1 STA; kỹ năng vật lý có chi phí riêng.
- Farm mặc định nghỉ dưới 20%, tiếp tục ở 80%. Chỉ tự nghỉ ở điểm an toàn; ngoài đó rút về làng, nghỉ và yêu cầu người chơi bật farm lại. Có ETA hồi STA.
- Tăng VIT/INT hoặc mặc đồ tăng giới hạn **không hồi thêm tài nguyên**. Tháo đồ chỉ chặn về giới hạn mới.

STR tăng tải và vũ khí sức mạnh; AGI tăng tốc độ/né/rút lui và vũ khí linh hoạt; VIT tăng HP/STA/kháng vật lý có giới hạn; INT tăng MP/phép. Rìu thiên STR, dao thiên AGI, cung kết hợp, trượng/phép dùng INT. Giáp có lợi ích giảm dần. Tốc độ, né, chí mạng và giảm chi phí đều có trần.

## Tiến bộ riêng biệt

- **Cấp nhân vật:** XP từ chiến thắng. Mỗi lần lên cấp xét tăng 1–2 chỉ số khác nhau ở cấp thấp, ít hơn ở cấp cao. Có thiên hướng nhẹ theo hoạt động gần đây và giảm cơ hội tăng thuộc tính sát trần. Cấp không tăng chỉ số vẫn mở kỹ năng/nội tại. Không hồi đầy khi lên cấp.
- **XP chỉ số ẩn:** mỗi chỉ số có ngưỡng tăng dần `80 × (chỉ số + 1)²`. Đi đường dài, mang tải phù hợp, né, dùng vũ khí, phép có hiệu quả, nghiên cứu và luyện tập cho trọng số riêng. Không có thanh XP ẩn trong giao diện chơi.
- **Thành thạo vũ khí:** số lần dùng hiệu quả theo hướng kiếm/cung/dao/rìu/phép.
- **Cấp kỹ năng:** tăng mỗi 20 lần sử dụng hiệu quả; sát thương tăng có giới hạn. Tối đa 4 kỹ năng chủ động; bậc 2 mở cấp 2, bậc 3 cấp 4.
- **Nghề:** mỗi 5 lần hoàn thành tăng cấp; phục vụ tăng tiền công có trần. Pha chế, phục vụ, nấu ăn, may vá có thời gian, đầu vào và đầu ra riêng.

Không rèn vì đứng yên mang nặng hoặc chịu đòn. Quá tải trên 100% không cho XP đi bộ; trên 150% không khởi hành, cần bỏ/cất bớt đồ. Đánh quái quá yếu không cho rèn/chuyên môn. Phép hồi đầy mục tiêu hoặc lá chắn chưa chặn đòn không tăng thành thạo phép. Biên nhận hành động ngăn cộng lặp trong cùng hành động. Sân luyện tại làng có 4 hướng, mỗi buổi 30 phút; thể chất thiếu STA sẽ dành nhịp nghỉ.

## Chiến đấu, thất bại và kinh tế

Quái thường tự đánh: tốc độ thay khoảng cách hành động, không thay tốc độ đồng hồ. Trận quan trọng chờ chọn, xử lý thứ tự theo tốc độ, mỗi vòng 1 phút. Độc gây 2 sát thương trong 3 phút/vòng, chậm giảm tốc độ 2; hiệu ứng cập nhật một lần mỗi vòng/nhịp. Boss có điểm yếu, kháng và cơ chế báo trước. Boss rừng còn hút STA, boss bình minh rút MP khi bỏ qua phòng thủ.

Rút lui thường có cơ hội `min(90%, 45% + AGI × 2,5% − 15% nếu quá tải)`; thất bại bị chặn và chịu đòn. Ấn thoát hiểm tiêu hao để bảo đảm thoát trận thường. Boss khóa cả hai. Không đủ MP/STA luôn còn đánh yếu/phòng thủ.

HP về 0 dừng ngay, không hồi sinh rồi farm tiếp. Mất 65% tiền mang theo, đồ tiêu hao và trang bị; giữ cốt truyện/kiện nhiệm vụ, cấp, kỹ năng, kho/ngân hàng. Quái có tổ chức giữ tài sản tại Mỏ/Trại mặt sắt, quái hoang để rơi tại nơi thua, vùng nguyền có dấu truy hồi. Tổng kết ghi phí, nơi tỉnh lại, Dạ cứu hộ, suy yếu và manh mối. Trốn khỏi bắt giữ nhanh hơn nhưng tăng suy yếu. Khi tỉnh lại được kiếm cơ bản nếu mất hết vũ khí. Gói truy hồi có trạng thái nhận một lần; phải có đủ chỗ trong túi.

Cửa hàng mua/bán khác giá, bán đồ theo độ bền; sửa chữa, nhà trọ, thuốc, cứu hộ và hợp đồng có chi phí. Nghỉ ngoài trời miễn phí nhưng chậm. Không thu phí trên mọi con đường; phí di chuyển chỉ áp dụng hợp đồng vận chuyển. Nhật ký ghi nguồn nhận/chi tiền và vật phẩm. Tổng kết farm có thời gian, XP, đồ, tiền, thuốc và hao độ bền; thông báo chiến đấu liên tiếp được gom, mở xem chi tiết được.

Có 4 danh hiệu: thành tích thuần, ưu đãi thương hội và giảm phí cứu hộ. Sở hữu nhiều nhưng chỉ kích hoạt một; danh hiệu thương hội không cộng công phép. Hợp đồng sau nhiệm vụ chở hàng cần đi thực tế, không nhận tiền lặp tại chỗ.

## Lưu, migration và bảo vệ dữ liệu

IndexedDB có 3 ô thủ công, 1 ô tự lưu; có xuất/nhập JSON và sao lưu trạng thái trước lần nhập. Tự lưu trễ khoảng 350 ms; đóng đột ngột có thể mất nhịp cuối. Lưu thủ công/xuất JSON trước khi thoát để chắc chắn.

Bản lưu **version 2**. Migration v1 → v2 giữ seed, cấp, thành thạo, tài sản, phần thưởng đã nhận và lựa chọn đang chờ; đổi chỉ số cũ sang thang nhỏ, giữ tỷ lệ HP/MP, khởi tạo STA 50%, bỏ điểm tự phân phối cũ. Không bốc lại tăng cấp hoặc chiến lợi phẩm. Chiến đấu cũ được đổi sang thông số quái mới. Nên xuất bản v1 để lưu trữ trước lần chuyển.

Nhập kiểm tra version, kiểu, giới hạn, ID, UID trang bị, liên kết trạng thái và tham chiếu; lỗi không thay game hiện tại. Bản lưu không phải cơ chế chống gian lận. Xóa dữ liệu trình duyệt sẽ xóa IndexedDB; hãy giữ JSON bên ngoài.

## Nội dung và giới hạn

- 3 tầng viết riêng, 15 địa điểm (5 mỗi tầng, gồm làng ở tầng 1).
- 8 quái thường, 2 thủ lĩnh, 3 boss; 12 kỹ năng chủ động, 2 nội tại.
- 27 vật phẩm/trang bị, 9 ô trang bị, bộ Tro, độ hiếm/độ bền/yêu cầu/tải.
- 10 nhiệm vụ có người giao/động cơ/điều kiện/nhánh/phần thưởng riêng; quan hệ, cứu người, chở hàng, giải mã và học nghề.
- 4 nghề, 4 danh hiệu, kho trang bị/nguyên liệu, ngân hàng, sửa chữa và chế tạo cơ bản.

**Chỉ có 3 tầng chơi được.** Dữ liệu đã chia 10 chương/100 tầng và khai báo kết thúc tầng 100 dựa trên quan hệ/nhánh nhiệm vụ. Chưa có nội dung tầng 4–100 hoặc kết thúc thật của tầng 100. Tuyến NPC/romance còn ngắn, mỗi nghề có một công thức cơ bản, chưa có hệ ngoại hình độc lập hoặc kinh tế chợ đen. Điểm an toàn được khai báo trong cấu hình. Nhiệm vụ ban đầu không hết hạn; bỏ rồi nhận lại được nếu chưa lấy thưởng, nhưng thưởng một lần. Chưa có AI tìm đường nhiều chặng: chọn lối kề bên hoặc cổng/hồi hương; chưa có tấn công nhiều mục tiêu hay PvP.

## Source và mở rộng

| Tệp | Vai trò |
|---|---|
| `src/content.ts` | Địa điểm/đường, quái, sự kiện, kỹ năng, đồ, nghề, nhiệm vụ, danh hiệu, 10 chương |
| `src/balance.ts` | Công thức và giới hạn tài nguyên, tải, hồi phục, giáp, tốc độ, vũ khí |
| `src/progression.ts` | XP ẩn, biên nhận hành động, RNG, tăng cấp và lịch sử kết quả |
| `src/engine.ts` | Reducer/state machine thuần, hoạt động, trận, nhiệm vụ, tài sản |
| `src/saves.ts` | Schema v2, migration v1, IndexedDB và JSON |
| `src/validate-content.ts` | Kiểm tra ID trùng, đường thiếu, nguồn vật phẩm, mục tiêu và chu trình nhiệm vụ |
| `src/simulation.ts` | Mô hình phát triển, ảnh chụp boss và farm dùng chung engine |
| `src/main.tsx` | Giao diện, modal, một timer và chặn tab ẩn |
| `scripts/` | Kiểm tra dữ liệu, mô phỏng cân bằng, hành trình ba tầng, smoke test UI |
| `artifacts/` | Kết quả chạy, báo cáo và ảnh kiểm tra |

Thêm địa điểm bằng ID duy nhất, khai báo đường hai chiều và thời lượng; thêm quái/đồ bằng dữ liệu và nguồn rõ ràng. Thêm tầng cần khai báo cổng mở, giới hạn phát hành, nội dung/chương và kiểm thử; không tự giả lập nội dung tầng chưa viết. Thêm trạng thái lưu phải tăng version và viết migration trước khi đọc bản cũ.

```powershell
npm run simulate
npm run campaign
```

Lệnh đầu chạy 100 seed cho mô hình 100 cấp, farm và các snapshot boss. Lệnh sau dùng **chỉ các action hợp lệ của engine** từ nhân vật mới qua 3 tầng, kiểm tra schema sau mọi action. Đây là mô phỏng engine, không phải chơi tay trên trình duyệt.

Debug: khi chạy `npm run dev`, thêm `?debug` vào URL rồi mở **Công cụ phát triển** bên cột nhân vật. Xem XP ẩn/RNG/lịch sử tăng cấp và chạy mô hình riêng; không có nút cộng tiền/chỉ số vào game. Công cụ không xuất hiện mặc định hoặc ở production.

## Kiểm tra bản bàn giao

Xem `artifacts/validation-v2.md` và `artifacts/balance-notes.md` để biết các lệnh đã chạy, kết quả thực tế, giả định mô phỏng và giới hạn. Chưa kiểm tra trực tiếp trên Windows; chưa chạy chơi tay toàn bộ ba tầng. Không coi kết quả mô hình dài hạn là bằng chứng cân bằng nội dung tầng 4–100.
