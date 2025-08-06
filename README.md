# block_short_video_yb# YouTube CleanFeed Extension

Extension Chrome để chặn video YouTube theo từ khóa, tên kênh và YouTube Shorts.

## Tính năng

- ✅ **Chặn từ khóa**: Ẩn video có chứa từ khóa không mong muốn trong tiêu đề
- ✅ **Chặn kênh**: Ẩn video từ các kênh cụ thể
- ✅ **Chặn YouTube Shorts**: Ẩn tất cả video Shorts
- ✅ **Hoạt động trên tất cả trang**: Trang chủ, kết quả tìm kiếm, đề xuất, v.v.
- 🆕 **Modal thông báo**: Hiển thị thông báo khi search kênh đã chặn
- 🆕 **Bỏ chặn nhanh**: Có thể bỏ chặn kênh trực tiếp từ modal

## Cách sử dụng

### 1. Cài đặt Extension
1. Mở Chrome và vào `chrome://extensions/`
2. Bật "Developer mode" ở góc trên bên phải
3. Click "Load unpacked" và chọn thư mục chứa extension này
4. Extension sẽ xuất hiện trên thanh công cụ

### 2. Chặn từ khóa
1. Click vào icon extension
2. Trong phần "Block Keywords", nhập từ khóa muốn chặn
3. Click "Add" hoặc nhấn Enter
4. Video có chứa từ khóa này sẽ bị ẩn

### 3. Chặn kênh
1. Click vào icon extension  
2. Trong phần "Block Channels", nhập tên kênh muốn chặn
3. Có thể nhập:
   - Tên kênh: `PewDiePie`
   - Username với @: `@pewdiepie`
   - Tên hiển thị: `MrBeast`
4. Click "Add" hoặc nhấn Enter
5. Tất cả video từ kênh này sẽ bị ẩn

### 4. Chặn YouTube Shorts
1. Click vào icon extension
2. Tick vào checkbox "Block YouTube Shorts"
3. Tất cả video Shorts sẽ bị ẩn

### 5. Modal thông báo khi gặp kênh đã chặn
**Khi search kênh đã chặn:**
1. Search tên kênh đã có trong blacklist
2. Modal sẽ hiển thị thông báo kênh đã bị chặn
3. Có thể click "Bỏ chặn kênh" để xóa khỏi blacklist ngay lập tức

**Khi vào trang kênh đã chặn:**
1. Truy cập trực tiếp trang kênh đã chặn (ví dụ: `youtube.com/@channelname`)
2. Modal sẽ hiển thị sau 2 giây với thông báo phù hợp
3. Có thể bỏ chặn trực tiếp từ trang kênh

**Lưu ý:** Modal chỉ hiển thị 1 lần mỗi session để tránh spam

### 6. Xóa khỏi danh sách chặn
- Click vào bất kỳ item nào trong danh sách để xóa nó
- Hoặc sử dụng nút "Bỏ chặn kênh" trong modal thông báo

## Cải tiến trong phiên bản này

### Chặn kênh được cải thiện:
- **Selector mở rộng**: Hỗ trợ nhiều định dạng tên kênh hơn
- **Làm sạch tên kênh**: Tự động loại bỏ tiền tố "@" và "by "
- **So sánh thông minh**: Kiểm tra cả hai chiều (tên chặn chứa trong tên kênh và ngược lại)
- **Refresh tức thì**: Tự động làm mới khi thêm kênh mới
- **Hiển thị số lượng**: Hiển thị số từ khóa và kênh đã chặn

### Chặn Shorts được cải thiện:
- **6 phương pháp phát hiện**: URL, thời lượng, badge, aspect ratio, hashtag, layout
- **Hoạt động trên mọi trang**: Trang chủ, tìm kiếm, đề xuất, sidebar

## Cấu trúc file

- `manifest.json`: Cấu hình extension
- `popup.html`: Giao diện popup
- `popup.js`: Logic popup
- `content.js`: Script chạy trên YouTube
- `background.js`: Service worker

## Troubleshooting

### Kênh không bị chặn?
1. Kiểm tra tên kênh có chính xác không
2. Thử nhập cả tên hiển thị và username
3. Refresh trang YouTube sau khi thêm kênh
4. Mở Developer Tools (F12) để xem console log

### Extension không hoạt động?
1. Kiểm tra extension đã được bật trong `chrome://extensions/`
2. Refresh trang YouTube
3. Thử tắt/bật extension

## Phát triển

Để phát triển thêm:
1. Sửa code trong các file tương ứng
2. Reload extension trong `chrome://extensions/`
3. Test trên YouTube

## Ghi chú kỹ thuật

- Extension sử dụng Manifest V3
- Chạy content script trên tất cả trang YouTube
- Sử dụng Chrome Storage API để lưu cài đặt
- MutationObserver để theo dõi thay đổi DOM
- Interval 800ms để kiểm tra video mới
