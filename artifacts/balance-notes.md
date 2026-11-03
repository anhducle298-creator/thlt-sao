# Cân bằng v0.2 · 03/11/2026

Chạy bằng `npm run simulate` và `npm run campaign`. Dữ liệu thô: `balance.json`, `campaign.json`.

## Những công thức đã thay đổi và lý do

1. Bỏ chỉ số khởi đầu 6, +3 điểm phân phối/lên cấp, sát thương theo cấp và hồi đầy khi lên cấp. Bắt đầu 3/4/3/2, dùng công thức HP/MP/STA theo đặc tả. Một điểm VIT tăng 5 HP và 5 STA; một điểm INT tăng 3 MP và tăng công phép. Vũ khí/trang bị đổi sang thưởng nhỏ, theo hệ số riêng.
2. Thử ban đầu `20 × (chỉ số + 1)²` XP chỉ số khiến cả 400 chỉ số của 100 mẫu chạm 20 ở cuối mô hình. Tăng hệ số ngưỡng lên **80**, đồng thời giảm xác suất chọn thuộc tính sát trần trong lần tăng cấp. Thiên hướng hoạt động gần đây chỉ tối đa 35%; mọi thuộc tính chưa đạt trần vẫn có cơ hội.
3. Hồi tài nguyên dùng thời gian hồi đầy, giữ phần lẻ. Đi bộ có hồi ròng, chiến đấu không hồi thụ động. Nghỉ/nhà trọ có hệ số rõ. Thay đồ hoặc tăng chỉ số chỉ đổi giới hạn, không phát sinh tài nguyên.
4. Giá bán bằng 40% giá mua cơ bản, bán trang bị còn phụ thuộc độ bền. Thương hội giảm mua tối đa 5%, chỉ một danh hiệu; không tạo chênh lệch mua–bán có lời tức thời. Nghề cần thời gian và đầu vào; hợp đồng cần giao hàng thực tế.

## Mô hình dài hạn 100 cấp

100 seed được phân tán bằng hàm nhân 32-bit. Mỗi cấp giả định **2.000 phút hoạt động có ý nghĩa, 2 XP rèn/phút tổng, chia đều bốn thuộc tính** (1.000 XP/thuộc tính/cấp). Đây là phép thử hệ thống tiến bộ, không phải nội dung tầng 4–100 và không phải dự báo chắc chắn thời lượng chơi.

| Cấp | Chỉ số trung bình | Nhỏ nhất | Lớn nhất |
|---|---:|---:|---:|
| 10 | 7,55 | 6 | 10 |
| 25 | 10,89 | 9 | 15 |
| 50 | 14,27 | 11 | 18 |
| 75 | 16,50 | 14 | 20 |
| 100 | 18,31 | 15 | 20 |

Tại cấp 100, trung bình STR 18,36 / AGI 18,38 / VIT 18,29 / INT 18,22. Lần chạm trần sớm nhất trong 100 mẫu là **cấp 71**, thay vì đồng loạt đạt trần sớm. Vẫn cần kiểm tra lại khi bổ sung nội dung/tần suất hoạt động và tiến độ cấp của các chương sau. Người chuyên luyện một hướng có phân bố khác mô hình chia đều.

## Farm và boss

Farm: 100 seed mới tại Lùm tần bì, tối đa 180 phút hoặc 6 quái, không bật dừng ngay khi hết thuốc. Cả 100 mẫu đạt 6 quái, không mẫu chết; trung bình **40,96 phút game**. Lãi trung bình **20,22 đồng sau thuốc và sửa chữa**, chưa bán chiến lợi phẩm, chưa tính đường đi/giờ nghỉ. Đây là bãi khởi đầu; không áp dụng kết luận này cho bãi nguy hiểm tầng cao.

Snapshot boss: 100 seed/tầng, cấp 2/4/6, trang bị cửa hàng theo tầng, tài nguyên đầy, 6 thuốc HP / 4 MP / 3 STA. Chính sách dùng điểm yếu, dùng thuốc khi cần và phòng thủ đòn báo trước:

| Boss tầng | Thắng / 100 | Phút trung bình | Thắng nếu bỏ phòng thủ / 100 |
|---|---:|---:|---:|
| 1 | 100 | 5,14 | 57 |
| 2 | 100 | 8,50 | 100 |
| 3 | 100 | 8,03 | 91 |

Snapshot chuẩn bị này khá dư thuốc và giáp; boss tầng 2 vẫn dễ khi bỏ phòng thủ. Đây là giới hạn cân bằng hiện tại, không nên diễn giải tỉ lệ thắng thành độ khó của mọi nhân vật. Boss có điểm yếu khác nhau, và boss 2/3 trừng phạt bỏ phòng thủ bằng mất STA/MP. Tương lai có thể bổ sung nhánh cơ chế và giảm lượng thuốc mang vào để tăng yêu cầu chiến thuật.

## Hành trình từ nhân vật mới

`campaign.ts` không chỉnh tiền, cấp, chỉ số hoặc tài sản: chỉ gọi action khám phá, di chuyển, farm, nghỉ, mua/bán, nhận nhiệm vụ, làm nghề và chiến đấu. Sau **mỗi action** chạy kiểm tra schema bản lưu. Ba seed 1 / 17 / 104729 đều vượt đủ ba tầng, không chết; kết thúc cấp 7, chỉ số gốc trong khoảng 2–7. Thời gian mô phỏng 4.454–5.456 phút game (khoảng 74–91 phút thực nếu không chờ lựa chọn).

Bộ điều khiển ưu tiên an toàn, dùng các khoảng nghỉ dài, nên đây không phải tốc độ tối ưu hay playthrough tay. Chưa mô phỏng hàng trăm phong cách xây dựng, economy endgame hoặc thất bại lặp ở mọi địa điểm. Những cơ chế thất bại/truy hồi và chống nhận trùng có kiểm thử riêng.
