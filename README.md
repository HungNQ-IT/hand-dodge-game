# 🎮 Hand Dodge Game - Điều khiển bằng Computer Vision

Game mini sử dụng **MediaPipe Hands** để nhận diện cử chỉ bàn tay và điều khiển nhân vật trong thời gian thực.

## 🚀 Công nghệ sử dụng

- **MediaPipe Hands** (Google) - Hand tracking realtime
- **HTML5 Canvas** - Game rendering
- **Vanilla JavaScript** - Game logic
- **Camera API** - Webcam access

## 🎯 Cách chơi

1. **✋ Mở bàn tay** - Di chuyển nhân vật theo vị trí bàn tay
2. **👊 Nắm tay** - Kích hoạt khiên bảo vệ (3 giây, cooldown 3 giây)
3. **🎯 Né chướng ngại vật** màu đỏ bay từ phải sang trái
4. **⭐ Ăn vật phẩm** màu vàng để tăng điểm
5. **❤️ 3 mạng** - Chạm chướng ngại vật mất 1 mạng

## 📦 Cài đặt & Chạy

### Cách 1: Chạy trực tiếp (Khuyến nghị)

```bash
# Sử dụng Python
python3 -m http.server 8000

# Hoặc sử dụng Node.js
npx http-server -p 8000
```

Sau đó mở trình duyệt: `http://localhost:8000`

### Cách 2: Live Server (VS Code)

1. Cài extension "Live Server"
2. Click phải vào `index.html` → "Open with Live Server"

## 🎮 Cử chỉ được nhận diện

| Cử chỉ | Hành động | Mô tả |
|--------|-----------|-------|
| ✋ Open Palm | Di chuyển | Tâm bàn tay = vị trí nhân vật |
| 👊 Fist | Shield | Khiên bảo vệ 3 giây |

## 🔧 Cấu hình Hand Tracking

```javascript
hands.setOptions({
    maxNumHands: 1,              // Chỉ nhận 1 tay
    modelComplexity: 1,          // Độ phức tạp model (0-2)
    minDetectionConfidence: 0.7, // Ngưỡng phát hiện
    minTrackingConfidence: 0.7   // Ngưỡng tracking
});
```

## 📊 Hệ thống điểm

- **+10 điểm** - Né được 1 chướng ngại vật
- **+50 điểm** - Phá hủy chướng ngại vật bằng shield
- **+100 điểm** - Ăn được vật phẩm vàng
- **Độ khó tăng** - Mỗi 10 giây tốc độ tăng

## 🎨 Tính năng

✅ Hand tracking realtime < 80ms latency  
✅ Gesture recognition (Open/Fist)  
✅ Particle effects & animations  
✅ Shield system với cooldown  
✅ Progressive difficulty  
✅ Score & lives system  
✅ Responsive UI  
✅ Camera preview  

## 🔍 Yêu cầu hệ thống

- **Browser**: Chrome/Edge (khuyến nghị), Firefox, Safari
- **Camera**: Webcam hoặc camera laptop
- **FPS**: Tối thiểu 30fps
- **Resolution**: 640x480 trở lên

## 🐛 Troubleshooting

### Camera không hoạt động
- Kiểm tra quyền truy cập camera trong browser
- Đảm bảo không có app nào khác đang dùng camera
- Thử refresh trang (F5)

### Lag/Giật
- Đóng các tab browser khác
- Giảm `modelComplexity` xuống 0
- Kiểm tra CPU usage

### Hand không được nhận diện
- Đảm bảo đủ ánh sáng
- Giữ bàn tay trong khung camera
- Tránh background phức tạp

## 🚀 Mở rộng

### Thêm cử chỉ mới

```javascript
function detectPeaceSign(landmarks) {
    // Index và Middle finger thẳng, các ngón khác gập
    const indexUp = landmarks[8].y < landmarks[6].y;
    const middleUp = landmarks[12].y < landmarks[10].y;
    const ringDown = landmarks[16].y > landmarks[14].y;
    const pinkyDown = landmarks[20].y > landmarks[18].y;
    
    return indexUp && middleUp && ringDown && pinkyDown;
}
```

### Thêm game mode mới

- **Survival Mode**: Không giới hạn thời gian
- **Time Attack**: 60 giây ghi điểm tối đa
- **Boss Fight**: Chướng ngại vật lớn với HP

## 📝 License

MIT License - Tự do sử dụng và chỉnh sửa

## 👨‍💻 Tác giả

Được tạo bởi Kiro AI Assistant

---

**Chúc bạn chơi vui! 🎉**
