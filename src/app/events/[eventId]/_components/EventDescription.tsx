import { Box, Typography } from "@mui/material";

interface EventDescriptionProps {
  description: string;
}

export default function EventDescription({
  description,
}: EventDescriptionProps) {
  // Function to convert plain text to paragraphs with links
  const formatDescription = (text: string) => {
    // Split by new lines
    const paragraphs = text.split("\n").filter((p) => p.trim() !== "");

    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    return paragraphs.map((paragraph, index) => {
      // Replace URLs with anchor tags
      const formattedText = paragraph.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#ffcc00] hover:underline">${url}</a>`;
      });

      return (
        <p
          key={index}
          className="mb-4 text-gray-300"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h6"
        component="h2"
        sx={{
          color: "white",
          fontWeight: "bold",
          mb: 2,
        }}
      >
        About this event
      </Typography>

      <div className="prose prose-invert max-w-none">
        {formatDescription(description)}
      </div>
    </Box>
  );
}
