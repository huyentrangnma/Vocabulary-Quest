// File: /api/handle-game.js
// "Bộ não" trung tâm, xử lý an toàn TẤT CẢ các yêu cầu AI

// Hàm bảo mật để gọi Gemini
async function callGemini(apiKey, model, payload) {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // Thêm log để debug
    console.log(`Calling Gemini Model: ${model}`);
    
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Lỗi Gemini API (${model}):`, errorBody);
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
        console.error("Lỗi: Biến MY_AI_KEY chưa được cài đặt trên Vercel.");
        return response.status(500).json({ error: 'Chưa cài đặt API Key trên Vercel' });
    }

    try {
        // Lấy yêu cầu từ game
        const { type, payload } = request.body;
        
        if (!type || !payload) {
             return response.status(400).json({ error: 'Thiếu `type` hoặc `payload` trong request' });
        }
        
        console.log(`Nhận được yêu cầu loại: ${type}`);
        
        let model;

        if (type === 'generate-quest') {
            // SỬA: Dùng model hỗ trợ responseSchema
            model = "gemini-2.5-flash-preview-09-2025"; 
            const apiResponse = await callGemini(AI_API_KEY, model, payload);
            return response.status(200).json(apiResponse);

        } else if (type === 'generate-image') {
            model = "gemini-1.5-flash-image-preview"; // Model tạo ảnh
            const apiResponse = await callGemini(AI_API_KEY, model, payload);
            return response.status(200).json(apiResponse);

        } else if (type === 'generate-audio') {
            model = payload.model; // Lấy model name từ payload (ví dụ: "gemini-2.5-flash-preview-tts")
            if (!model) {
                 return response.status(400).json({ error: 'Thiếu `model` trong payload cho audio' });
            }
            const apiResponse = await callGemini(AI_API_KEY, model, payload);
            return response.status(200).json(apiResponse);

        } else if (type === 'check-grammar') {
            // SỬA: Dùng model hỗ trợ text generation
            model = "gemini-2.5-flash-preview-09-2025";
            const apiResponse = await callGemini(AI_API_KEY, model, payload);
            return response.status(200).json(apiResponse);

        } else {
            return response.status(400).json({ error: 'Loại yêu cầu không hợp lệ' });
        }

    } catch (error) {
        console.error('Lỗi Backend:', error.message);
        return response.status(500).json({ error: error.message });
    }
}

