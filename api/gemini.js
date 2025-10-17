// /api/gemini.js 파일의 전체 내용입니다.

const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 메서드만 허용됩니다.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { type, context, prompt, courses } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let aiPrompt = '';
    if (type === 'summarize') {
        aiPrompt = `다음 Udemy 강의 정보를 분석해서 3개의 '핵심 요약'과 2개의 '추천 대상'으로 정리해줘. 반드시 한국어와 JSON 형식({"summary": ["요약1", "요약2"], "recommendedFor": ["대상1", "대상2"]})을 지켜줘.\n\n강의 정보: ${JSON.stringify(context)}`;
    } else if (type === 'recommend') {
        aiPrompt = `다음은 전체 강의 목록(id, title)입니다: ${JSON.stringify(courses)}\n\n위 목록 중에서, 다음 사용자의 요청에 가장 적합한 강의를 최대 10개까지 골라줘. 반드시 JSON 형식의 강의 ID 배열로만 응답해줘. 다른 설명은 절대 추가하지 마. 예시: ["123456", "789012"]\n\n사용자 요청: "${prompt}"`;
    } else if (type === 'extended_search') {
        // AI에게 관련 검색 키워드를 생성해달라고 요청합니다.
        aiPrompt = `사용자가 검색한 "'${prompt}'" 라는 문장의 핵심 의도를 파악해서, 관련성이 높은 검색 키워드를 최대 5개까지 생성해줘. 반드시 JSON 형식의 키워드 배열로만 응답해야 해. 다른 부가 설명은 절대 넣지 마. 예시: ["키워드1", "키워드2"]`;
    } else {
        throw new Error('알 수 없는 요청 타입입니다.');
    }

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/^```json\s*/, '').replace(/```$/, '');

    res.status(200).json(JSON.parse(cleanedText));

  } catch (error) {
    console.error('AI API 처리 중 오류 발생:', error);
    res.status(500).json({ error: 'AI 응답을 처리하는 데 실패했습니다.' });
  }
};
