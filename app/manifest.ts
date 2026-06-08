import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oshi-Choki | 推し貯金アプリ",
    short_name: "推しチョキ",
    description: "推しの行動をトリガーに、一緒に夢を叶える推し貯金アプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF6B9D",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
