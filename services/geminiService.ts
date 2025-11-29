
import { GoogleGenAI } from "@google/genai";
import { EquipmentItem } from "../types";

const parseGeminiResponse = (text: string): string => {
  return text.trim();
};

export const analyzeEquipmentList = async (items: EquipmentItem[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "找不到 API 金鑰，請檢查環境變數設定。";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare data summary for the prompt
    const dataSummary = JSON.stringify(items.map(item => ({
      id: item.projectNumber,
      name: item.name,
      quantity: `${item.approvedQuantity} ${item.unit}`,
      cost: item.estimatedCost,
      status: `Dean: ${item.deanApproval}, Committee: ${item.committeeApproval}, Procurement: ${item.procurementProcess}`
    })));

    const prompt = `
      你是一位醫院的專業採購分析師。
      請分析以下的設備清單資料：
      ${dataSummary}

      請使用「繁體中文 (台灣)」提供一份簡潔的高階主管摘要。
      1. 識別總預估支出。
      2. 指出任何瓶頸（卡在審核中或停滯過久的項目），請引用計畫編號。
      3. 標註需要特別關注的高單價項目（超過 300 萬）或大量採購項目。
      4. 為院長提供簡短的建議。
      
      請使用清晰的條列式格式輸出。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return parseGeminiResponse(response.text || "無法產生分析報告。");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "分析資料失敗，請稍後再試。";
  }
};
