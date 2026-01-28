import React, { useState } from "react";
import {
  Layout,
  Card,
  Spin,
  Alert,
  Row,
  Col,
  Typography,
  Space,
  ConfigProvider,
  Tag,
  Select,
  Empty,
} from "antd";
import {
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  ReadOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { fetchAIResponse } from "./services/aiService";
import MarkdownRenderer from "./components/MarkdownRenderer";
import "./App.css";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option, OptGroup } = Select;

const getCurrentDate = () => new Date().toLocaleDateString("vi-VN");
// Mở rộng danh sách chủ đề và Prompt chi tiết
// Cập nhật bộ Prompt chuyên sâu về Nipah tại Ấn Độ
// Bộ Prompt tập trung vào tính "Cập nhật mới nhất" (Real-time focus)
const TOPIC_PROMPTS: Record<string, string> = {
  // --- Nhóm: Thông tin chung ---
  overview: `
    Thời điểm hiện tại là: ${getCurrentDate()}.
    Đóng vai trò chuyên gia ICMR (Ấn Độ). Hãy cung cấp báo cáo CẬP NHẬT MỚI NHẤT về tình hình dịch Nipah.
    Yêu cầu quan trọng:
    1. Tập trung vào số liệu và tình hình của năm 2024, 2025 và hiện tại.
    2. Có ca nhiễm mới nào được ghi nhận trong 3 tháng qua tại Kerala (Kozhikode, Malappuram) không?
    3. Tình trạng cảnh báo hiện tại (Màu Vàng/Cam/Đỏ) từ chính quyền bang Kerala.
    Trình bày: Markdown, nhấn mạnh vào tính thời sự.
  `,
  transmission: `
    Dựa trên các nghiên cứu dịch tễ MỚI NHẤT. Phân tích xu hướng lây truyền Nipah tại Ấn Độ.
    Nội dung:
    1. Có phát hiện mới nào về vật chủ trung gian ngoài dơi quả không?
    2. Cập nhật các cảnh báo mùa vụ (thường bùng phát vào tháng mấy trong năm nay?).
    3. Đánh giá rủi ro lây truyền từ người sang người trong đợt dịch gần nhất.
    Trình bày: Markdown.
  `,
  history: `
    Thời điểm: ${getCurrentDate()}.
    Lập dòng thời gian (Timeline) các đợt bùng phát, CHÚ TRỌNG VÀO CÁC ĐỢT GẦN ĐÂY NHẤT.
    Nội dung:
    - Bắt đầu từ 2018 nhưng lướt nhanh.
    - Tập trung chi tiết vào đợt bùng phát 2021, 2023 và các ca nghi nhiễm 2024-2025 (nếu có).
    - So sánh tỷ lệ tử vong của đợt gần nhất so với các đợt trước.
    Trình bày: Bảng Markdown.
  `,

  // --- Nhóm: Lâm sàng & Điều trị ---
  symptoms: `
    Theo hướng dẫn chẩn đoán MỚI NHẤT từ Bộ Y tế Ấn Độ.
    Mô tả triệu chứng lâm sàng, lưu ý các biến thể triệu chứng trong các ca bệnh gần đây.
    Nội dung:
    - Triệu chứng hô hấp có phổ biến hơn trong các ca mới nhất không?
    - Các dấu hiệu thần kinh sớm cần cảnh giác ngay lập tức.
    Trình bày: Markdown checklist.
  `,
  diagnosis: `
    Cập nhật quy trình xét nghiệm chuẩn (Standard Operating Procedure) HIỆN HÀNH.
    Nội dung:
    1. Năng lực xét nghiệm hiện tại của các phòng lab địa phương (Mobile Labs) tại Kerala hay vẫn phải gửi về NIV Pune?
    2. Thời gian trả kết quả trung bình hiện nay là bao lâu? (đã được rút ngắn chưa?).
    3. Các phương pháp test nhanh (Point-of-care) đang được thử nghiệm.
    Trình bày: Markdown.
  `,
  treatment: `
    CẬP NHẬT QUAN TRỌNG về liệu pháp điều trị và Vắc-xin tính đến ${getCurrentDate()}.
    Nội dung:
    1. Tình trạng sẵn có của Kháng thể đơn dòng m102.4 (nhập từ Úc) tại Ấn Độ hiện nay.
    2. Tiến độ thử nghiệm vắc-xin Nipah trên người (Phase 1) của Oxford hoặc Moderna.
    3. Phác đồ hỗ trợ sự sống mới nhất đang áp dụng tại các bệnh viện Kerala.
    Trình bày: Markdown, thông tin về thuốc phải cực kỳ chính xác.
  `,

  // --- Nhóm: Cộng đồng & Dự phòng ---
  prevention: `
    Đưa ra khuyến cáo phòng ngừa dựa trên TÌNH HÌNH THỰC TẾ hiện nay tại Ấn Độ.
    Nội dung:
    1. Các lệnh cấm hoặc hạn chế hiện hành của chính quyền địa phương (ví dụ: cấm bán trái cây, cấm tụ tập).
    2. Khuyến cáo mùa vụ: Thời điểm này có phải mùa sinh sản của dơi hay mùa thu hoạch chà là không?
    3. Quy định đeo khẩu trang tại các cơ sở y tế vùng dịch.
    Trình bày: Markdown.
  `,
  travel: `
    Cảnh báo du lịch (Travel Advisory) CẬP NHẬT NGAY LÚC NÀY (${getCurrentDate()}).
    Nội dung:
    1. Hiện tại có "Vùng phong tỏa" (Containment Zones) nào đang kích hoạt tại Kerala không?
    2. Du khách đến Ấn Độ có bị kiểm dịch y tế tại sân bay liên quan đến Nipah không?
    3. Mức độ an toàn cho du khách tại Kozhikode và Wayanad.
    Trình bày: Markdown, giọng văn khách quan.
  `,
  faqs: `
    Giải đáp các thắc mắc và tin đồn ĐANG LAN TRUYỀN gần đây.
    Nội dung:
    - Xác thực tin đồn về đợt bùng phát mới (nếu có).
    - Làm rõ sự khác biệt giữa triệu chứng Nipah hiện tại và các bệnh cúm mùa đang lưu hành.
    Trình bày: Hỏi - Đáp ngắn gọn.
  `,
};

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [generalInfo, setGeneralInfo] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleTopicChange = async (value: string) => {
    setSelectedTopic(value);
    setLoading(true);
    setGeneralInfo("");

    try {
      const prompt = TOPIC_PROMPTS[value];
      const data = await fetchAIResponse(prompt);
      setGeneralInfo(data);
    } catch (error) {
      setGeneralInfo("Hệ thống đang bận. Vui lòng thử lại sau giây lát.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Montserrat', sans-serif",
          colorPrimary: "#006d75",
          borderRadius: 8,
          colorTextHeading: "#003a3f",
        },
        components: {
          Button: { fontWeight: 600, controlHeight: 40 },
          Card: { headerBg: "#fff" },
          Select: { controlHeight: 42 }, // Tăng nhẹ chiều cao cho dễ thao tác
        },
      }}
    >
      <Layout className="layout" style={{ minHeight: "100vh" }}>
        <Header
          className="site-header"
          style={{
            padding: "0 50px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#e6fffb",
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
                color: "#006d75",
              }}
            >
              <MedicineBoxOutlined style={{ fontSize: "28px" }} />
            </div>
            <div>
              <Title
                level={4}
                style={{ margin: 0, color: "#006d75", lineHeight: 1 }}
              >
                NIPAH PORTAL
              </Title>
            </div>
          </div>
          <Space>
            <Tag color="blue">Dữ liệu AI</Tag>
            <Tag color="red">Live Data</Tag>
          </Space>
        </Header>

        <Content style={{ padding: "30px 50px" }}>
          <div className="site-layout-content">
            <Alert
              message={<Text strong>MIỄN TRỪ TRÁCH NHIỆM Y KHOA</Text>}
              description="Dữ liệu được tổng hợp tự động bởi AI (LLM). Thông tin chỉ mang tính chất tham khảo phục vụ nghiên cứu và tra cứu nhanh."
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              style={{
                marginBottom: "30px",
                border: "1px solid #91d5ff",
                background: "#e6f7ff",
                borderRadius: "8px",
              }}
            />

            <Row gutter={[32, 32]}>
              <Col span={24}>
                <Card
                  className="medical-card"
                  title={
                    <Space>
                      <ReadOutlined />
                      BÁO CÁO DỊCH TỄ HỌC CHUYÊN SÂU
                    </Space>
                  }
                  extra={
                    // Sử dụng OptGroup để phân loại danh sách
                    <Select
                      placeholder="-- Chọn danh mục báo cáo --"
                      style={{ width: 300 }}
                      onChange={handleTopicChange}
                      suffixIcon={<SelectOutlined />}
                      value={selectedTopic}
                      size="large"
                      listHeight={320} // Tăng chiều cao danh sách xổ xuống
                    >
                      <OptGroup label="Thông tin cơ bản">
                        <Option value="overview">
                          Tổng quan tình hình dịch
                        </Option>
                        <Option value="history">
                          Lịch sử các đợt bùng phát
                        </Option>
                        <Option value="transmission">Cơ chế lây truyền</Option>
                      </OptGroup>

                      <OptGroup label="Lâm sàng & Điều trị">
                        <Option value="symptoms">
                          Triệu chứng & Diễn biến
                        </Option>
                        <Option value="diagnosis">
                          Chẩn đoán & Xét nghiệm
                        </Option>
                        <Option value="treatment">Phác đồ điều trị</Option>
                      </OptGroup>

                      <OptGroup label="Cộng đồng & Dự phòng">
                        <Option value="prevention">
                          Khuyến cáo phòng ngừa
                        </Option>
                        <Option value="travel">
                          An toàn du lịch (Travel Advisory)
                        </Option>
                        <Option value="faqs">
                          Hỏi đáp thường gặp & Tin đồn
                        </Option>
                      </OptGroup>
                    </Select>
                  }
                  style={{ height: "100%", minHeight: 600 }}
                >
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "100px 0" }}>
                      <Spin
                        size="large"
                        tip="Hệ thống đang phân tích dữ liệu..."
                      />
                    </div>
                  ) : generalInfo ? (
                    <MarkdownRenderer content={generalInfo} />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Space
                          direction="vertical"
                          align="center"
                          style={{ marginTop: 20 }}
                        >
                          <Text
                            strong
                            style={{ fontSize: 16, color: "#006d75" }}
                          >
                            CHƯA CÓ DỮ LIỆU ĐƯỢC CHỌN
                          </Text>
                          <Text type="secondary">
                            Vui lòng chọn một chủ đề từ danh sách phía trên góc
                            phải.
                          </Text>
                          <Text type="secondary">
                            Hỗ trợ tra cứu từ Tổng quan, Lâm sàng đến Khuyến cáo
                            du lịch.
                          </Text>
                        </Space>
                      }
                      style={{ marginTop: 100, marginBottom: 100 }}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        </Content>

        <Footer
          style={{
            textAlign: "center",
            background: "#001529",
            color: "rgba(255,255,255,0.65)",
            padding: "40px 0",
            fontFamily: "Montserrat",
          }}
        >
          <Space direction="vertical">
            <Text strong style={{ color: "#fff", fontSize: "16px" }}>
              NIPAH VIRUS INDIA PORTAL
            </Text>
            <div style={{ marginTop: "10px", fontSize: "12px" }}>
              ©2025 Developed with Care & Technology
            </div>
          </Space>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
