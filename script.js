// --- 1. HÀM XỬ LÝ ẢNH (TỪ CODE.TXT) ---
function optimizeIOSPixelate(img, level) {
    let pixelSize = 1;
    switch (level) {
        case 'nhe': pixelSize = 100; break;
        case 'trungbinh': pixelSize = 500; break;
        case 'manh': pixelSize = 1100; break;
        default: return img.src;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Lấy tỷ lệ Retina của iOS (thường là 2 hoặc 3 trên iPhone)
    const scaleFactor = window.devicePixelRatio || 1;
    
    // Kích thước chuẩn hiển thị dựa trên màn hình
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    
    canvas.width = w;
    canvas.height = h;
    
    // Vô hiệu hóa làm mượt - Giữ các ô pixel sắc cạnh
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    // Tính toán kích thước thu nhỏ (Càng chia cho số lớn, ảnh càng bóp nhỏ)
    const scaledW = Math.max(1, Math.round(w / pixelSize));
    const scaledH = Math.max(1, Math.round(h / pixelSize));

    // Bước 1: Vẽ thu nhỏ ảnh lại
    ctx.drawImage(img, 0, 0, scaledW, scaledH);
    
    // Bước 2: Phóng to ngược lại kích thước chuẩn ban đầu
    ctx.drawImage(canvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
    
    return canvas.toDataURL('image/jpeg', 0.85); // 0.85 chất lượng tốt nhất cho iOS để giảm dung lượng file
}

// --- 2. HÀM ĐIỀU KHIỂN GIAO DIỆN VÀ LOGIC ---
function toggleSmooth() {
    const btn = document.getElementById('smoothBtn');
    const wrapper = document.getElementById('sliderWrapper');
    
    // Toggle class để ẩn/hiện mượt mà
    btn.classList.toggle('active');
    wrapper.classList.toggle('show');

    // Cập nhật text hiển thị trên nút
    if (btn.classList.contains('active')) {
        btn.innerText = "Smooth: ON";
        // Chạy xử lý pixelate ngay khi bật với mức mặc định là 1 (Nhẹ)
        triggerPixelateProcessing();
    } else {
        btn.innerText = "Smooth: OFF";
        // Reset slider về nấc 1 khi tắt
        document.getElementById('levelSlider').value = 1;
        updateLevel();
    }
}

function updateLevel() {
    const value = document.getElementById('levelSlider').value;
    
    // Reset toàn bộ màu của các nhãn chữ
    document.getElementById('lbl1').classList.remove('active-level');
    document.getElementById('lbl2').classList.remove('active-level');
    document.getElementById('lbl3').classList.remove('active-level');

    // Thêm màu highlight cho cấp độ đang được chọn
    document.getElementById('lbl' + value).classList.add('active-level');

    // Gọi hàm xử lý ảnh tương ứng với nấc slider hiện tại (nếu nút Smooth đang ON)
    const btn = document.getElementById('smoothBtn');
    if (btn.classList.contains('active')) {
        triggerPixelateProcessing();
    }
}

// --- 3. HÀM KẾT NỐI GIỮA ĐIỀU KHIỂN VÀ XỬ LÝ ẢNH ---
function triggerPixelateProcessing() {
    const value = document.getElementById('levelSlider').value;
    
    // Chuyển đổi giá trị số (1, 2, 3) từ slider sang dạng chuỗi text ('nhe', 'trungbinh', 'manh')
    let levelString = 'nhe';
    if (value === '2') levelString = 'trungbinh';
    if (value === '3') levelString = 'manh';

    console.log("Đang kích hoạt xử lý ảnh mức độ: " + levelString);

    /* LƯU Ý KHI SỬ DỤNG TRONG THỰC TẾ:
       Để hàm chạy, bạn cần truyền một thẻ ảnh `<img>` thực tế vào đây. Ví dụ:
       
       const myImage = document.getElementById('robotCameraView'); 
       if(myImage) {
           const pixelatedDataUrl = optimizeIOSPixelate(myImage, levelString);
           // Gán kết quả base64 thu được vào lại nguồn ảnh hoặc thẻ hiển thị khác
           myImage.src = pixelatedDataUrl; 
       }
    */
}
