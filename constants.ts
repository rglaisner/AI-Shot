
import { HeadshotStyle, BackgroundOption } from './types';

export const HEADSHOT_STYLES: HeadshotStyle[] = [
  {
    id: 'corporate-grey',
    name: 'Corporate Grey',
    description: 'Classic studio look with a professional grey backdrop.',
    prompt: 'Transform the person into a professional corporate headshot. They should be wearing high-end professional business attire. The background is a clean, solid studio grey backdrop. High-end photography, 85mm lens, sharp focus on face, soft lighting.',
    previewUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech Office',
    description: 'A bright, contemporary workspace with natural depth.',
    prompt: 'Transform the person into a high-quality professional headshot. They are wearing trendy business-casual attire. The background is a bright, modern glass-walled tech office with plants and blurred desks. Soft natural lighting, professional depth of field.',
    previewUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'outdoor-natural',
    name: 'Outdoor Natural',
    description: 'Warm, natural light with a lush outdoor setting.',
    prompt: 'Transform the person into a professional lifestyle headshot. They are wearing smart yet classy casual clothing. The background is a beautiful, sun-drenched park or garden with soft green bokeh. Natural golden hour lighting.',
    previewUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'executive-boardroom',
    name: 'Executive Boardroom',
    description: 'Prestigious setting for senior leadership profiles.',
    prompt: 'Transform the person into an executive headshot. They are wearing a sharp, dark formal suit. The background is a luxurious wood-paneled boardroom with a hint of a large city skyline through windows. Sophisticated lighting.',
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'minimalist-white',
    name: 'Minimalist White',
    description: 'Clean, airy, and versatile for any professional use.',
    prompt: 'Transform the person into a modern minimalist headshot. They are wearing clean, bright and somewhat minimalist attire. The background is a pure, soft white minimalist studio setting. High key lighting, very clean and professional.',
    previewUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'urban-professional',
    name: 'Urban Professional',
    description: 'Modern city backdrop with a dynamic, professional feel.',
    prompt: 'Transform the person into a professional urban headshot. They are wearing a stylish blazer or trendy or smart casual jacket. The background is a blurred city street with modern architecture and soft morning light. High-end street photography style.',
    previewUrl: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'Vibrant and artistic setting for creative industries.',
    prompt: 'Transform the person into a creative professional headshot. They are wearing stylish, modern and hype clothing. The background is a colorful, artistic studio with subtle paint textures and soft, warm lighting. Artistic depth of field.',
    previewUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'academic-library',
    name: 'Academic Library',
    description: 'Sophisticated and scholarly look with a library backdrop.',
    prompt: 'Transform the person into a professional academic headshot. They are wearing a smart sweater or professional casual yet conservative attire. The background is a classic library with blurred bookshelves and warm, focused lighting. Intelligent and sophisticated atmosphere.',
    previewUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'austin-real-estate',
    name: 'Austin Real Estate Mogul',
    description: 'Confident, high-end look with a modern Austin skyline or luxury property backdrop.',
    prompt: 'Transform the person into a high-end Austin real estate mogul. They are wearing a sharp, stylish navy or charcoal suit with a crisp white shirt, no tie for a modern professional look. The background is a luxury modern penthouse balcony with the iconic Austin skyline (Frost Bank Tower, Independent) blurred in the distance during golden hour. High-end architectural photography style, warm lighting, confident and approachable expression.',
    previewUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'austin-ai-genius',
    name: 'Austin AI Genius',
    description: 'A sophisticated, high-tech look with a luxurious club vibe.',
    prompt: 'Transform the person into a brilliant AI genius in Austin. They are wearing a sharp, modern professional outfit, possibly a high-end dark sport blazer over a clean, minimalist shirt. The setting is a sophisticated, dimly lit gentleman\'s club with rich wood paneling, leather seating, and a hint of high-tech displays or a laptop in the background. The lighting is dramatic and warm, with a focus on the face, conveying intelligence and confidence. High-end photography, cinematic depth of field.',
    previewUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'cyberpunk-ceo',
    name: 'Cyberpunk CEO',
    description: 'A futuristic, neon-lit corporate look from the year 2077.',
    prompt: 'Transform the person into a high-powered CEO from a cyberpunk future. They are wearing a sleek, iridescent bio-suit with subtle glowing fiber-optic accents. The background is a rain-slicked balcony overlooking a sprawling neon-drenched megacity at night. Cool blue and hot pink lighting, cinematic sci-fi atmosphere, high-tech aesthetic.',
    previewUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'victorian-explorer',
    name: 'Victorian Explorer',
    description: 'A 19th-century sepia-toned adventurer look.',
    prompt: 'Transform the person into a 19th-century Victorian explorer. They are wearing a classic khaki safari jacket, a cravat, and a pith helmet. The image is in a rich sepia tone with slight film grain and vignette. The background is a study filled with old maps, globes, and leather-bound books. Dignified and adventurous pose.',
    previewUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'underwater-executive',
    name: 'Underwater Executive',
    description: 'A professional headshot, but everything is underwater.',
    prompt: 'Transform the person into a professional executive, but the entire scene is underwater. They are wearing a high-quality damp business suit that flows slightly in the current. Small bubbles rise around them, and colorful tropical fish swim in the blurred background. Sunlight filters down through the water surface above. Crystal clear water, surreal and humorous professional look.',
    previewUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400'
  }
];

export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'neutral-grey',
    name: 'Neutral Studio Grey',
    description: 'A solid, clean, light grey backdrop that minimizes distraction and isolates features.',
    promptSnippet: 'The background is a solid, clean, non-textured neutral studio light grey portrait backdrop. Professional soft diffused key light, crisp facial highlights, gentle shadow roll-off, studio portrait photography standard.',
    previewUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=400',
    category: 'solid'
  },
  {
    id: 'warm-ivory',
    name: 'Warm Studio Ivory',
    description: 'Soft warm rich ivory cream color to add a flattering, highly professional glow.',
    promptSnippet: 'The background is a solid, warm studio ivory cream backdrop with subtle warm lighting vignetting. Flattering golden skin glow, high-end commercial fashion style, clean and inviting.',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    category: 'solid'
  },
  {
    id: 'deep-navy',
    name: 'Deep Tech Navy',
    description: 'Bold, rich dark navy studio backing providing striking contrast for formal business settings.',
    promptSnippet: 'The background is a rich dark navy blue studio portrait backdrop with gentle highlight in the center. Sophisticated corporate contrast, clean executive luxury, studio lit.',
    previewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
    category: 'solid'
  },
  {
    id: 'slate-concrete',
    name: 'Slate Concrete',
    description: 'Minimalist industrial setting with subtle grey textures reflecting modern creative trends.',
    promptSnippet: 'The background is a beautiful, out-of-focus textured slate concrete wall with soft daylight streaming from the side. Elegant minimalist architecture feel, natural shadows, modern creative studio setting.',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400',
    category: 'textured'
  },
  {
    id: 'loft-brick',
    name: 'Modern Loft Brick',
    description: 'A sleek, warmly lit rustic brick wall backdrop indicating a creative, chic workspace.',
    promptSnippet: 'The background is a softly blurred rustic warm red-brick loft wall with overhead ambient pendant light reflection. Warm artistic loft environment, creative tech industry vibe, shallow depth of field.',
    previewUrl: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&q=80&w=400',
    category: 'textured'
  },
  {
    id: 'tech-lobby',
    name: 'Bright Tech Lobby',
    description: 'Bright, glass-paneled technology headquarters lounge with luxurious natural daylight.',
    promptSnippet: 'The background is a bright, sunlit modern corporate headquarters atrium lobby, with highly blurred glass escalators, giant lush plants, and sleek steel beams. High-end modern company office depth, clean daylighting.',
    previewUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400',
    category: 'scenic'
  },
  {
    id: 'botanical-garden',
    name: 'Botanical Garden',
    description: 'Sun-dappled green leaves and soft morning bokeh for a warm, healthy lifestyle portrait.',
    promptSnippet: 'The background is a gorgeous, out-of-focus sun-drenched botanical garden. Warm morning rays filtering through green foliage, beautiful round lens bokeh, friendly natural dapple of outdoor elements.',
    previewUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=400',
    category: 'scenic'
  },
  {
    id: 'skyline-highrise',
    name: 'Skyline High-rise',
    description: 'Expansive penthouse windows overlooking a premium downtown business skyscraper layout.',
    promptSnippet: 'The background is an ultra-modern corporate penthouse with blurred floor-to-ceiling glass windows overlooking a dynamic high-rise downtown skyline during sunrise. Golden hour reflections, majestic executive feel.',
    previewUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400',
    category: 'scenic'
  },
  {
    id: 'elite-study',
    name: 'Elite Wood Study',
    description: 'Distinguished mahogany bookshelves and warm ambient study lamp light.',
    promptSnippet: 'The background is a highly prestigious, dimly lit partner office or law library study. Elegant blurred dark mahogany bookshelves filled with gold-leaf leather books, soft warm library lamp glow. Intellectual, trustworthy, and classy.',
    previewUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400',
    category: 'scenic'
  },
  {
    id: 'artistic-bokeh',
    name: 'Abstract Golden Bokeh',
    description: 'Warm gold and bronze ambient lights sparkling softly around the subject.',
    promptSnippet: 'The background is an abstract luxury copper and gold ambient light bokeh. Elegant festive champagne sparks, highly stylized professional portraits, sophisticated warmth.',
    previewUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=400',
    category: 'creative'
  }
];
