// /api/gemini.js 파일의 전체 내용입니다.

// 1. 필요한 주방 도구(Google AI 라이브러리)를 가져옵니다.
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 2. Vercel 환경에서 '주방'이 작동하는 공식적인 방법입니다.
module.exports = async (req, res) => {
  // POST 방식의 주문서가 아니면 돌려보냅니다 (보안).
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 메서드만 허용됩니다.' });
  }

  try {
    // 3. Vercel의 '비밀 금고'에서 API 키를 꺼냅니다.
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 4. 손님(index.html)이 보낸 주문서(payload) 내용을 확인합니다.
    const { type, context, prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let aiPrompt = '';
    // 주문서 유형에 따라 AI에게 다른 지시를 내립니다.
    if (type === 'summarize') {
        aiPrompt = `다음 Udemy 강의 정보를 분석해서 3개의 '핵심 요약'과 2개의 '추천 대상'으로 정리해줘. 반드시 한국어와 JSON 형식({"summary": ["요약1", "요약2"], "recommendedFor": ["대상1", "대상2"]})을 지켜줘.\n\n강의 정보: ${JSON.stringify(context)}`;
    } else if (type === 'recommend') {
        aiPrompt = `다음 사용자의 요청에 가장 적합한 Udemy 강의를 추천해줘: "${prompt}"`;
    } else {
        throw new Error('알 수 없는 요청 타입입니다.');
    }

    // 5. Google AI 요리사에게 요리를 지시합니다.
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text();

    // 6. 완성된 요리(AI의 답변)를 손님에게 전달합니다.
    res.status(200).json(JSON.parse(text));

  } catch (error) {
    console.error('AI API 처리 중 오류 발생:', error);
    res.status(500).json({ error: 'AI 응답을 처리하는 데 실패했습니다.' });
  }
};
