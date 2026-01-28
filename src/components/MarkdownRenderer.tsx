import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Typography } from "antd";

const { Paragraph } = Typography;

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Tùy chỉnh hiển thị các thẻ nếu cần
          h1: ({ node, ...props }) => {
            const { children, ...rest } = props;
            return (
              <h2 style={{ color: "#cf1322" }} {...rest}>
                {children}
              </h2>
            );
          },
          h2: ({ node, ...props }) => {
            const { children, ...rest } = props;
            return (
              <h3 style={{ color: "#d4380d" }} {...rest}>
                {children}
              </h3>
            );
          },
          p: ({ node, ...props }) => (
            <Paragraph style={{ fontSize: "16px" }} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
