# 🔄 HƯỚNG DẪN KHÔI PHỤC KHI MẤT DỮ LIỆU

## 📥 Cách tải lại game về máy

### Bước 1: Mở Terminal
- Nhấn `Cmd + Space`
- Gõ "Terminal"
- Enter

### Bước 2: Clone repo về
```bash
cd ~/Downloads
git clone https://github.com/HungNQ-IT/hand-dodge-game.git
cd hand-dodge-game
```

### Bước 3: Chạy game
```bash
python3 -m http.server 8000
```

### Bước 4: Mở trình duyệt
```
http://localhost:8000
```

## ✅ XONG! Game đã về máy!

---

## 🌐 Hoặc chơi trực tiếp online (không cần tải)

Bạn có 2 link game online:

1. **GitHub Pages**: https://hungnq-it.github.io/hand-dodge-game/
2. **Surge**: https://hand-dodge-game.surge.sh

---

## 📝 Lưu ý quan trọng

### Nếu chưa có Git:
```bash
# Cài Git (chỉ cần 1 lần)
xcode-select --install
```

### Nếu chưa có Python:
Python đã có sẵn trên macOS, không cần cài gì!

---

## 🔐 Backup thêm (khuyến nghị)

### Cách 1: Tải file ZIP từ GitHub
1. Vào: https://github.com/HungNQ-IT/hand-dodge-game
2. Click nút **Code** (màu xanh)
3. Click **Download ZIP**
4. Giải nén và chạy

### Cách 2: Lưu link này
```
https://github.com/HungNQ-IT/hand-dodge-game
```

Chỉ cần có link này, bạn luôn tải lại được!

---

## 🚀 Deploy lại nếu cần

### Deploy lên Surge:
```bash
npm install -g surge
cd hand-dodge-game
surge --domain hand-dodge-game.surge.sh
```

### Deploy lên Netlify:
1. Vào: https://app.netlify.com/drop
2. Kéo thả folder vào
3. Xong!

---

## 📞 Tóm tắt - Chỉ cần nhớ

**1 LỆNH DUY NHẤT:**
```bash
git clone https://github.com/HungNQ-IT/hand-dodge-game.git
```

**1 LINK DUY NHẤT:**
```
https://github.com/HungNQ-IT/hand-dodge-game
```

Có 2 thứ này là bạn luôn khôi phục được game! 🎮

---

Được tạo: 6/12/2024
