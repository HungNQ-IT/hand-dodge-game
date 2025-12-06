# 🔐 HƯỚNG DẪN BACKUP & KHÔI PHỤC

## 📦 Các file quan trọng cần backup:

### Files game:
- `index.html` - Trang chủ chọn chế độ
- `game-hand.html` - Phiên bản hand tracking
- `game-simple.html` - Phiên bản chuột
- `game.js` - Code game gốc (TensorFlow version)
- `README.md` - Hướng dẫn
- `netlify.toml` - Config deploy

### Folder:
- `libs/` - MediaPipe files (nếu có)
- `deploy/` - Folder đã deploy

## 🔄 Cách khôi phục:

### Cách 1: Từ file zip
1. Giải nén file `hand-dodge-game-backup.zip`
2. Chạy server: `python3 -m http.server 8000`
3. Mở: `http://localhost:8000`

### Cách 2: Deploy lại lên Surge
```bash
npm install -g surge
cd deploy
surge --domain hand-dodge-game.surge.sh
```

### Cách 3: Deploy lên Netlify
1. Vào: https://app.netlify.com/drop
2. Kéo thả folder `deploy` vào
3. Xong!

## 🌐 Link game đã deploy:
https://hand-dodge-game.surge.sh

## 📝 Ghi chú:
- Backup này chứa toàn bộ source code
- Không cần cài đặt gì thêm
- Chạy được ngay trên mọi máy có Python hoặc Node.js
- Có thể deploy lại bất cứ lúc nào

---
Được tạo: $(date)
