import axios from "axios";

const API_URL = "https://groqprompt.netlify.app/api/ai";

export const fetchAIResponse = async (prompt: string): Promise<string> => {
  try {
    // API yêu cầu method POST và body { prompt: "..." }
    const response = await axios.post(API_URL, {
      prompt: prompt,
    });

    // Giả định output trả về dạng { result: "..." } như bạn mô tả
    return response.data.result;
  } catch (error) {
    console.error("Lỗi khi gọi API AI:", error);
    return "Hiện tại không thể lấy dữ liệu. Vui lòng thử lại sau.";
  }
};
