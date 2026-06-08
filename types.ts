
export interface HeadshotStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  previewUrl: string;
}

export interface BackgroundOption {
  id: string;
  name: string;
  description: string;
  promptSnippet: string;
  previewUrl: string;
  category: 'solid' | 'scenic' | 'textured' | 'creative';
}

export interface GeneratedImage {
  id: string;
  url: string;
  timestamp: number;
  promptUsed: string;
  type: 'headshot' | 'edit';
}

export interface FaceDetectionResult {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  score: number;
}
