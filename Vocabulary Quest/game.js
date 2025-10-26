// Lấy các phần tử HTML
const generateBtn = document.getElementById('generate-btn');
const topicInput = document.getElementById('topic-input');
const questDisplay = document.getElementById('quest-display');
const loading = document.getElementById('loading');

// Thêm sự kiện khi nhấn nút
generateBtn.addEventListener('click', generateQuest);

async function generateQuest() {
    const topic = topicInput.value;
    if (!topic) {
        alert("Bạn ơi, hãy nhập một chủ đề đã!");
        return;
    }

    // Hiển thị loading và xóa quest cũ
    loading.style.display = 'flex';
    questDisplay.innerHTML = '';
    generateBtn.disabled = true; // Khóa nút lại

    try {
        // === ĐIỂM QUAN TRỌNG ===
        // Chúng ta gọi đến file 'api/handle-ai.js' trên máy chủ Vercel.
        // KHÔNG gọi thẳng đến OpenAI ở đây!
        const response = await fetch('/api/handle-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic }), // Gửi chủ đề lên cho backend
        });

        if (!response.ok) {
            throw new Error('Máy chủ AI gặp lỗi. Xin hãy thử lại.');
        }

        const data = await response.json();

        // Hiển thị kết quả AI trả về (dưới dạng HTML)
        questDisplay.innerHTML = data.quest_html;

    } catch (error) {
        console.error(error);
        questDisplay.innerHTML = `<p style="color: red;">Rất tiếc! Không thể tạo quest: ${error.message}</p>`;
    } finally {
        // Dù thành công hay thất bại, cũng phải ẩn loading và mở lại nút
        loading.style.display = 'none';
        generateBtn.disabled = false;
    }
}