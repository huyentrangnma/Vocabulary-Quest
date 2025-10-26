// File: /api/handle-game.js
// "Bộ não" trung tâm, xử lý an toàn TẤT CẢ các yêu cầu AI

// Hàm bảo mật để gọi Gemini
async function callGemini(apiKey, model, payload) {
    const GEMINI_API_URL = `https://generativanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Lỗi Gemini API:", errorBody);
        throw new Error(`Lỗi Gemini API: ${response.status}`);
    }
    
    return response.json();
}

// Hàm xử lý chính của Vercel
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Lấy API Key BÍ MẬT từ Vercel
    const AI_API_KEY = process.env.MY_AI_KEY;
    if (!AI_API_KEY) {
        return response.status(500).json({ error: 'Chưa cài đặt API Key trên Vercel' });
    }

    try {
        // Lấy yêu cầu từ game (loại yêu cầu là gì, và nội dung là gì)
        const { type, payload } = request.body;
        let model;

        if (type === 'generate-quest') {
            model = "gemini-1.5-flash"; // Model tạo quiz
            const apiResponse = await callGemini(AI_API_KEY, model, payload);
            return response.status(200).json(apiResponse);

        } else if (type === 'generate-image') {
            model = "gemini-1.5-flash-image-preview"; // Model tạo ảnh
            const apiResponse = await callGemini(AI_API_KEY, model, payload);
            return response.status(200).json(apiResponse);

        } else if (type === 'generate-audio') {
            // Lấy model name từ payload mà frontend gửi lên
            model = payload.model; 
            const apiResponse = await callGemini(AI_API_KEY, model, payload);
            return response.status(200).json(apiResponse);

        } else if (type === 'check-grammar') {
            model = "gemini-1.5-flash"; // Model kiểm tra văn bản
            const apiResponse = await callGemini(AI_API_KEY, model, payload);
            return response.status(200).json(apiResponse);

        } else {
            return response.status(400).json({ error: 'Loại yêu cầu không hợp lệ' });
        }

    } catch (error) {
        console.error('Lỗi Backend:', error);
        return response.status(500).json({ error: error.message });
    }
}