# Kiểm tra v0.2 · 03/11/2026

- `npm test`: **57/57 đạt**, gồm engine, tiến bộ, tài nguyên, dữ liệu, migration, JSON và IndexedDB.
- `npm run check:data`: đạt; ID, đường, công thức, nguồn vật phẩm và điều kiện nhiệm vụ hợp lệ.
- `npm run build`: TypeScript và Vite production build thành công.
- `npm run simulate`: hoàn tất 100 seed cho mô hình phát triển, farm, mỗi boss có/không phòng thủ; xem `balance.json`.
- `npm run campaign`: 3/3 seed từ nhân vật mới vượt ba tầng, schema hợp lệ sau từng action; xem `campaign.json`.

## Chromium

Chạy `scripts/ui-smoke.py` bằng Python Playwright, Chromium headless. Viewport 1440×1150 và 390×844:

- Thấy HP/MP/STA và không có công cụ phát triển mặc định.
- Chờ lựa chọn dừng đồng hồ; đi 2 nhịp đúng 2 phút.
- Mở túi đồ dừng đồng hồ.
- Giả lập `visibilitychange` + tab ẩn: đồng hồ dừng; hiện lại chạy các nhịp mới, không cộng bù khoảng chờ.
- Lưu IndexedDB thủ công thành công; reload tự khôi phục hành trình tạm dừng.
- Bắt đầu luyện STR qua giao diện; thấy 12 kỹ năng và điều kiện cấp.
- Mở bảng danh hiệu.
- Fixture STA thấp tại bãi an toàn: farm chuyển sang nghỉ, hiển thị ngưỡng/ETA.
- Fixture boss: chờ lựa chọn không trôi giờ, xác nhận phòng thủ cộng đúng 1 phút; có vật phẩm STA trong menu.
- Tab nhân vật/thế giới trên di động hoạt động; không tràn ngang, không có lỗi JavaScript trong các luồng trên.

Kết quả JSON trong `ui-v2.json`, ảnh `desktop-v2.png`, `mobile-v2.png`, `farm-v2.png`, `battle-v2.png`. Các fixture farm/boss được tạo qua engine và IndexedDB để kiểm tra màn hình, không được tính là chơi từ đầu trên trình duyệt.

## Giới hạn kiểm tra

Chạy trên Linux bằng Node 24 và Chromium có sẵn, bổ sung đường dẫn thư viện có sẵn cho Chromium. Chưa chạy trực tiếp trên Windows, trình duyệt Safari hoặc điện thoại thật. Tab ẩn được kiểm tra bằng sự kiện/thuộc tính trong Chromium; chưa kiểm tra hành vi sleep/kill process trên mọi hệ điều hành. Tự lưu trễ khoảng 350 ms, vẫn có thể mất thay đổi cuối khi tắt đột ngột.

Chưa có nội dung tầng 4–100, chưa có endgame thật; mô hình dài hạn không thay thế kiểm thử nội dung chưa viết. Không tuyên bố đã chơi tay toàn bộ game. Bản `validation.md` và ảnh không có hậu tố v2 là hồ sơ phiên bản 0.1 cũ.
