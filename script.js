// Biến toàn cục để quản lý instance của TouchSensitivityManager
let touchManager = null;

// Khởi tạo hệ thống quản lý vuốt chạm khi trang đã tải xong
document.addEventListener("DOMContentLoaded", () => {
    touchManager = new TouchSensitivityManager('Screen Main', {
        level: 'nhe', // Mức mặc định tương ứng với slider value = 1 (Nhẹ)
        onSwipe: (data) => {
            console.log(`Đã vuốt hướng: ${data.direction} | Khoảng cách ảo: ${data.distanceX.toFixed(0)}px`);
            // Bạn có thể xử lý điều khiển robot bằng data.direction ở đây
        }
    });
});

// Hàm bật/tắt chế độ Smooth và ẩn/hiện thanh Slider
function toggleSmooth() {
    const btn = document.getElementById('smoothBtn');
    const sliderWrapper = document.getElementById('sliderWrapper'); // Đã sửa: Định nghĩa sliderWrapper chuẩn xác

    // Kiểm tra xem nút đang ở trạng thái ON hay OFF
    if (btn.classList.contains('active')) {
        // Nếu đang ON -> Chuyển thành OFF
        btn.classList.remove('active');
        btn.innerText = "Smooth: OFF";
        
        // Ẩn thanh slider đi
        sliderWrapper.classList.remove('show');
    } else {
        // Nếu đang OFF -> Chuyển thành ON
        btn.classList.add('active');
        btn.innerText = "Smooth: ON";
        
        // Hiện thanh slider lên
        sliderWrapper.classList.add('show');
        
        // Kích hoạt xử lý logic ngay khi vừa bật
        triggerPixelateProcessing();
    }
}

// Hàm cập nhật trạng thái text highlight khi kéo thanh Slider
function updateLevel() {
    const value = document.getElementById('levelSlider').value;
    
    // Reset toàn bộ màu của các nhãn chữ
    document.getElementById('lbl1').classList.remove('active-level');
    document.getElementById('lbl2').classList.remove('active-level');
    document.getElementById('lbl3').classList.remove('active-level');

    // Thêm màu highlight cho cấp độ đang được chọn
    document.getElementById('lbl' + value).classList.add('active-level');

    // Đồng bộ độ nhạy vuốt chạm tương ứng với Slider
    if (touchManager) {
        if (value === "1") touchManager.setSensitivity('nhe');
        else if (value === "2") touchManager.setSensitivity('trung_binh');
        else if (value === "3") touchManager.setSensitivity('manh');
    }

    // Gọi hàm xử lý ảnh tương ứng với nấc slider hiện tại (nếu nút Smooth đang ON)
    const btn = document.getElementById('smoothBtn');
    if (btn.classList.contains('active')) {
        triggerPixelateProcessing();
    }
}

// Hàm xử lý logic phụ trợ (được gọi khi slider thay đổi hoặc khi bật ON)
function triggerPixelateProcessing() {
    const currentLevel = document.getElementById('levelSlider').value;
    
    // In ra console để bạn dễ dàng debug hoặc kết nối với phần cứng Robot/Canvas sau này
    console.log("Robot Processing Level changed to: " + currentLevel);
}

// Lớp điều khiển Touch Sensitivity 
class TouchSensitivityManager {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        
        // Cấu hình các mức độ nhạy theo yêu cầu của bạn
        this.sensitivityLevels = {
            nhe: 100,
            trung_binh: 500,
            manh: 1100
        };

        // Mức độ mặc định nếu không truyền vào là 'trung_binh'
        this.currentLevel = options.level || 'trung_binh';
        this.onSwipe = options.onSwipe || null;

        // Biến lưu trữ tọa độ
        this.startX = 0;
        this.startY = 0;

        if (this.element) {
            this.initEvents();
        } else {
            console.error(`Không tìm thấy phần tử với ID: ${elementId}`);
        }
    }

    // Lấy hệ số khuếch đại dựa trên mức độ nhạy
    getMultiplier() {
        const value = this.sensitivityLevels[this.currentLevel] || 1100000;
        return value / 1000;
    }

    initEvents() {
        // Bắt đầu chạm
        this.element.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        }, { passive: true });

        // Kết thúc chạm (Nhấc ngón tay)
        this.element.addEventListener('touchend', (e) => {
            if (!e.changedTouches.length) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            // Tính khoảng cách thực tế (pixel)
            const deltaX = endX - this.startX;
            const deltaY = endY - this.startY;

            // Áp dụng độ nhạy để tính khoảng cách ảo sau khi tăng cường
            const multiplier = this.getMultiplier();
            const amplifiedX = deltaX * multiplier;
            const amplifiedY = deltaY * multiplier;

            // Ngưỡng tối thiểu để kích hoạt hành động (tránh chạm nhầm khi click)
            const THRESHOLD = 30; 

            if (Math.abs(amplifiedX) > THRESHOLD || Math.abs(amplifiedY) > THRESHOLD) {
                this.executeCallback(amplifiedX, amplifiedY, deltaX, deltaY);
            }
        }, { passive: true });
    }

    executeCallback(ampX, ampY, realX, realY) {
        if (typeof this.onSwipe === 'function') {
            // Xác định hướng vuốt chính (Ngang hay Dọc)
            let direction = '';
            if (Math.abs(ampX) > Math.abs(ampY)) {
                direction = ampX > 0 ? 'RIGHT' : 'LEFT';
            } else {
                direction = ampY > 0 ? 'DOWN' : 'UP';
            }

            // Trả về dữ liệu cho hàm callback xử lý tiếp
            this.onSwipe({
                direction: direction,
                distanceX: ampX,
                distanceY: ampY,
                realDistanceX: realX,
                realDistanceY: realY
            });
        }
    }

    // Hàm hỗ trợ đổi mức độ nhạy linh hoạt khi đang chạy (runtime)
    setSensitivity(newLevel) {
        if (this.sensitivityLevels[newLevel]) {
            this.currentLevel = newLevel;
            console.log(`Đã đổi độ nhạy sang mức: ${newLevel.toUpperCase()}`);
        }
    }
}
