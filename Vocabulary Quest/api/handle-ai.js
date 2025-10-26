// File: /api/handle-ai.js
// Đây là code chạy trên Node.js (máy chủ Vercel)

export default async function handler(request, response) {
    // Chỉ cho phép phương thức POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 1. Lấy chủ đề từ request của game.js
        const { topic } = request.body;
        if (!topic) {
            return response.status(400).json({ error: 'Missing topic' });
        }

        // 2. Lấy API Key BÍ MẬT từ Environment Variables của Vercel
        const AI_API_KEY = process.env.MY_AI_KEY;

        if (!AI_API_KEY) {
            // Lỗi này chỉ bạn thấy, không phải học sinh
            return response.status(500).json({ error: 'API Key is not configured' });
        }

        // 3. Chuẩn bị lời "dặn" (prompt) cho AI
        const systemPrompt = `Bạn là một người hướng dẫn game vui nhộn, tạo ra "Vocabulary Quest" (Săn tìm từ vựng) cho học sinh tiểu học Việt Nam. 
        Dựa trên chủ đề người dùng cung cấp, hãy tạo 3 thử thách nhỏ. 
        Mỗi thử thách phải vui, đơn giản (ví dụ: điền vào chỗ trống, câu hỏi trắc nghiệm, hoặc tìm từ).
        TRẢ LỜI TRỰC TIẾP BẰNG ĐỊNH DẠNG HTML. KHÔNG dùng markdown.
        Ví dụ: "<h3>Thử thách 1: Giải đố</h3><p>Tôi là con gì kêu 'meo meo'?...</p>"`;

        // 4. Gọi đến API của OpenAI (hoặc AI khác)
        // Đây là ví dụ cho OpenAI API
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AI_API_KEY}` // Dùng Key bí mật
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Chủ đề: ${topic}` }
                ],
            }),
        });

        if (!aiResponse.ok) {
            throw new Error('AI API request failed');
        }

        const aiData = await aiResponse.json();
        const aiMessageHtml = aiData.choices[0].message.content;

        // 5. Trả kết quả (dưới dạng HTML) về cho game.js
        response.status(200).json({ quest_html: aiMessageHtml });

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'An internal server error occurred.' });
    }
}