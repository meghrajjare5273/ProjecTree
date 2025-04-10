"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, IconButton, Modal } from "@mui/material";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface EventGalleryProps {
  images: string[];
  title: string;
}

export default function EventGallery({ images, title }: EventGalleryProps) {
  const [openModal, setOpenModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images.length) return null;

  const handleOpenModal = (index: number) => {
    setCurrentImageIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box sx={{ mb: 4 }}>
      {images.length === 1 ? (
        <div
          className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden cursor-pointer"
          onClick={() => handleOpenModal(0)}
        >
          <Image
            src={images[0] || "/placeholder.svg"}
            alt={`${title} image`}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative ${
                index === 0
                  ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2"
                  : ""
              } h-[150px] md:h-[200px] rounded-lg overflow-hidden cursor-pointer`}
              onClick={() => handleOpenModal(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${title} image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "90%",
            height: "90%",
            maxWidth: "1200px",
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 10,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <X />
          </IconButton>

          <div className="relative w-full h-full">
            <Image
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={`${title} image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>

              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
