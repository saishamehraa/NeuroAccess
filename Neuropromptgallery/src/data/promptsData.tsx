import React from 'react';
import { Wand2 } from '../components/SimpleIcons';

// Type definitions for SVG icon components
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// Simple SVG Icon Components
const BrainIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const CodeIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="16,18 22,12 16,6"/>
    <polyline points="8,6 2,12 8,18"/>
  </svg>
);

const PaletteIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="13.5" cy="6.5" r=".5"/>
    <circle cx="17.5" cy="10.5" r=".5"/>
    <circle cx="8.5" cy="7.5" r=".5"/>
    <circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
  </svg>
);

const BriefcaseIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const HeartIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7 7-7z"/>
  </svg>
);

const BookOpenIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M2 3h6a4 4 0 0 1 0 8h6a4 4 0 0 1 0 8H2v-8z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-8a4 4 0 0 0-4-4z"/>
  </svg>
);

const MessageCircleIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const LightbulbIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9 21h6"/>
    <path d="M12 17h.01"/>
    <path d="M12 3a5 5 0 0 1 3.5 8.5c-.7.7-1.5 1.4-1.5 2.5h-4c0-1.1-.8-1.8-1.5-2.5A5 5 0 0 1 12 3z"/>
  </svg>
);

const TargetIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const UsersIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const GlobeIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const Gamepad2Icon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="6" y1="11" x2="10" y2="11"/>
    <line x1="8" y1="9" x2="8" y2="13"/>
    <line x1="15" y1="12" x2="15.01" y2="12"/>
    <line x1="18" y1="10" x2="18.01" y2="10"/>
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
  </svg>
);

const CoffeeIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    <line x1="6" y1="2" x2="6" y2="4"/>
    <line x1="10" y1="2" x2="10" y2="4"/>
    <line x1="14" y1="2" x2="14" y2="4"/>
  </svg>
);

const GraduationCapIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const SearchIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const PenToolIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>
);

const ShoppingCartIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);

const MailIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const CalendarIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const DatabaseIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3v-6c0-1.1.9-2 2-2h3z"/>
  </svg>
);

const AwardIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
  </svg>
);

const ClockIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const TrendingUpIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
    <polyline points="16,7 22,7 22,13"/>
  </svg>
);

const HeadphonesIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h3z"/>
  </svg>
);

const DollarSignIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const UtensilsIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/>
  </svg>
);

const PlaneIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-.5.5c-.4.4-.5 1.1 0 1.5L7 20.5l3.5-2.5 2.5 2 2 3.5c.4.4 1.1.3 1.5 0l.5-.5V20l-3-2 3-2 4.3 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1L17.8 19.2z"/>
  </svg>
);

const HomeIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const ShieldIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const SmartphoneIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

// Type definitions
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type CategoryId =
  | 'all'
  | 'writing'
  | 'business'
  | 'coding'
  | 'creative'
  | 'custom' // Added custom category
  | 'education'
  | 'productivity'
  | 'health'
  | 'communication'
  | 'analysis'
  | 'entertainment'
  | 'lifestyle';

export interface Prompt {
  id: number | string;
  text: string;
  fullPrompt: string;
  category: CategoryId;
  tags: string[];
  icon: IconComponent;
  color: string;
  difficulty: DifficultyLevel;
  useCase: string;
  example?: string;
  saved?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: IconComponent;
  color: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'All Prompts', icon: GlobeIcon, color: 'from-gray-500 to-gray-600' },
  { id: 'writing', name: 'Writing & Content', icon: PenToolIcon, color: 'from-blue-500 to-blue-600' },
  { id: 'business', name: 'Business & Marketing', icon: BriefcaseIcon, color: 'from-green-500 to-green-600' },
  { id: 'coding', name: 'Programming & Tech', icon: CodeIcon, color: 'from-purple-500 to-purple-600' },
  { id: 'creative', name: 'Creative & Design', icon: PaletteIcon, color: 'from-pink-500 to-pink-600' },
  { id: 'custom', name: 'My Prompts', icon: Wand2, color: 'from-cyan-500 to-blue-500' }, // Added custom category
  { id: 'education', name: 'Education & Learning', icon: GraduationCapIcon, color: 'from-indigo-500 to-indigo-600' },
  { id: 'productivity', name: 'Productivity', icon: TargetIcon, color: 'from-orange-500 to-orange-600' },
  { id: 'health', name: 'Health & Wellness', icon: HeartIcon, color: 'from-red-500 to-red-600' },
  { id: 'communication', name: 'Communication', icon: MessageCircleIcon, color: 'from-teal-500 to-teal-600' },
  { id: 'analysis', name: 'Analysis & Research', icon: SearchIcon, color: 'from-yellow-500 to-yellow-600' },
  { id: 'entertainment', name: 'Entertainment', icon: Gamepad2Icon, color: 'from-violet-500 to-violet-600' },
  { id: 'lifestyle', name: 'Lifestyle', icon: CoffeeIcon, color: 'from-amber-500 to-amber-600' }
];

export const prompts: Prompt[] = [
  // Writing & Content
  {
    id: 1,
    text: "Create engaging blog post",
    fullPrompt: "I want you to act as a content writer. Create an engaging blog post about [TOPIC]. The post should be approximately [WORD COUNT] words, include a compelling headline, introduction that hooks the reader, well-structured body paragraphs with subheadings, and a conclusion that encourages action. Include relevant examples and make it SEO-friendly.",
    category: "writing",
    tags: ["blog", "content", "SEO", "marketing"],
    icon: PenToolIcon,
    color: "from-blue-500 to-blue-600",
    difficulty: "beginner",
    useCase: "Content creation for websites and blogs",
    example: "Topic: 'Remote Work Productivity'"
  },
  {
    id: 2,
    text: "Write compelling product descriptions",
    fullPrompt: "Act as an e-commerce copywriter. Write a compelling product description for [PRODUCT NAME]. Focus on benefits over features, use sensory language, address potential objections, include a clear call-to-action, and optimize for conversions. Keep it concise but persuasive, highlighting what makes this product unique.",
    category: "writing",
    tags: ["ecommerce", "sales", "copywriting", "marketing"],
    icon: ShoppingCartIcon,
    color: "from-green-500 to-green-600",
    difficulty: "intermediate",
    useCase: "E-commerce product listings and sales pages"
  },
  {
    id: 3,
    text: "Email marketing campaigns",
    fullPrompt: "Create an email marketing campaign for [PRODUCT/SERVICE]. Include a subject line with high open rates, personalized greeting, compelling body copy that tells a story, clear value proposition, social proof elements, and a strong call-to-action. Make it mobile-friendly and include A/B testing suggestions.",
    category: "writing",
    tags: ["email", "marketing", "campaigns", "sales"],
    icon: MailIcon,
    color: "from-purple-500 to-purple-600",
    difficulty: "intermediate",
    useCase: "Email marketing and customer engagement"
  },

  // Business & Marketing
  {
    id: 4,
    text: "Business strategy analysis",
    fullPrompt: "Act as a business consultant. Analyze the business strategy for [COMPANY/INDUSTRY]. Provide insights on market positioning, competitive advantages, potential threats, growth opportunities, and actionable recommendations. Use frameworks like SWOT analysis, Porter's Five Forces, or Blue Ocean Strategy as appropriate.",
    category: "business",
    tags: ["strategy", "analysis", "consulting", "growth"],
    icon: BriefcaseIcon,
    color: "from-green-500 to-green-600",
    difficulty: "advanced",
    useCase: "Strategic planning and business development"
  },
  {
    id: 5,
    text: "Social media content calendar",
    fullPrompt: "Create a 30-day social media content calendar for [BRAND/BUSINESS]. Include post types (educational, promotional, behind-the-scenes, user-generated content), optimal posting times, hashtag strategies, engagement tactics, and content themes for each platform (Instagram, Twitter, LinkedIn, Facebook). Ensure brand consistency and audience engagement.",
    category: "business",
    tags: ["social media", "marketing", "content", "planning"],
    icon: CalendarIcon,
    color: "from-pink-500 to-pink-600",
    difficulty: "intermediate",
    useCase: "Social media marketing and brand management"
  },

  // Programming & Tech
  {
    id: 6,
    text: "Code review and optimization",
    fullPrompt: "Act as a senior software engineer. Review this code and provide detailed feedback on [CODE SNIPPET]. Focus on code quality, performance optimization, security vulnerabilities, best practices, readability, and maintainability. Suggest specific improvements with examples and explain the reasoning behind each recommendation.",
    category: "coding",
    tags: ["code review", "optimization", "best practices", "security"],
    icon: CodeIcon,
    color: "from-purple-500 to-purple-600",
    difficulty: "advanced",
    useCase: "Software development and code improvement"
  },
  {
    id: 7,
    text: "API documentation generator",
    fullPrompt: "Create comprehensive API documentation for [API NAME]. Include endpoint descriptions, request/response examples, authentication methods, error codes, rate limiting information, SDK examples in multiple languages, and integration guides. Make it developer-friendly with clear examples and troubleshooting tips.",
    category: "coding",
    tags: ["API", "documentation", "development", "integration"],
    icon: DatabaseIcon,
    color: "from-indigo-500 to-indigo-600",
    difficulty: "intermediate",
    useCase: "API development and technical documentation"
  },

  // Creative & Design
  {
    id: 8,
    text: "Creative campaign concepts",
    fullPrompt: "Act as a creative director. Develop 3 unique creative campaign concepts for [BRAND/PRODUCT]. Each concept should include a big idea, visual direction, key messaging, target audience insights, media channels, and expected outcomes. Think outside the box and create memorable, shareable ideas that align with brand values.",
    category: "creative",
    tags: ["campaigns", "branding", "creative", "advertising"],
    icon: PaletteIcon,
    color: "from-pink-500 to-pink-600",
    difficulty: "advanced",
    useCase: "Advertising and creative campaign development"
  },
  {
    id: 9,
    text: "Brand identity development",
    fullPrompt: "Create a comprehensive brand identity for [COMPANY NAME] in [INDUSTRY]. Include brand personality, core values, unique value proposition, target audience personas, brand voice and tone, visual style guidelines, logo concepts, color palette, typography recommendations, and brand application examples.",
    category: "creative",
    tags: ["branding", "identity", "design", "strategy"],
    icon: AwardIcon,
    color: "from-rose-500 to-rose-600",
    difficulty: "advanced",
    useCase: "Brand development and corporate identity"
  },

  // Education & Learning
  {
    id: 10,
    text: "Personalized learning plan",
    fullPrompt: "Create a personalized learning plan for mastering [SKILL/SUBJECT]. Include learning objectives, prerequisite knowledge, structured modules with timelines, recommended resources (books, courses, tutorials), practice exercises, milestones, assessment methods, and tips for staying motivated. Adapt to [LEARNING STYLE] and [TIME AVAILABILITY].",
    category: "education",
    tags: ["learning", "education", "skills", "development"],
    icon: GraduationCapIcon,
    color: "from-indigo-500 to-indigo-600",
    difficulty: "intermediate",
    useCase: "Personal development and skill acquisition"
  },
  {
    id: 11,
    text: "Explain complex concepts simply",
    fullPrompt: "Act as an expert teacher. Explain [COMPLEX CONCEPT] in simple terms that a [TARGET AUDIENCE] can understand. Use analogies, real-world examples, visual descriptions, and step-by-step breakdowns. Avoid jargon, make it engaging, and include memory aids or mnemonics to help retention.",
    category: "education",
    tags: ["explanation", "teaching", "simplification", "communication"],
    icon: LightbulbIcon,
    color: "from-yellow-500 to-yellow-600",
    difficulty: "beginner",
    useCase: "Education and knowledge transfer"
  },

  // Productivity
  {
    id: 12,
    text: "Project management optimization",
    fullPrompt: "Optimize the project management approach for [PROJECT TYPE]. Analyze current workflows, identify bottlenecks, suggest process improvements, recommend tools and methodologies (Agile, Scrum, Kanban), create timeline templates, and provide strategies for team collaboration, risk management, and quality assurance.",
    category: "productivity",
    tags: ["project management", "optimization", "workflow", "efficiency"],
    icon: TargetIcon,
    color: "from-orange-500 to-orange-600",
    difficulty: "advanced",
    useCase: "Project management and team productivity"
  },
  {
    id: 13,
    text: "Time management system",
    fullPrompt: "Design a personalized time management system for [ROLE/PROFESSION]. Include daily/weekly planning templates, priority matrix, time-blocking strategies, distraction management techniques, energy optimization tips, and tools for tracking progress. Address specific challenges like [SPECIFIC CHALLENGE] and optimize for [GOALS].",
    category: "productivity",
    tags: ["time management", "planning", "productivity", "organization"],
    icon: ClockIcon,
    color: "from-blue-500 to-blue-600",
    difficulty: "intermediate",
    useCase: "Personal productivity and time optimization"
  },

  // Health & Wellness
  {
    id: 14,
    text: "Personalized fitness plan",
    fullPrompt: "Create a personalized fitness plan for [FITNESS GOAL] considering [CURRENT FITNESS LEVEL], [AVAILABLE TIME], and [EQUIPMENT/GYM ACCESS]. Include workout schedules, exercise descriptions with proper form, progression plans, nutrition guidelines, recovery strategies, and motivation techniques. Address any [PHYSICAL LIMITATIONS] safely.",
    category: "health",
    tags: ["fitness", "health", "exercise", "wellness"],
    icon: HeartIcon,
    color: "from-red-500 to-red-600",
    difficulty: "intermediate",
    useCase: "Personal fitness and health improvement"
  },
  {
    id: 15,
    text: "Mental wellness strategies",
    fullPrompt: "Develop comprehensive mental wellness strategies for managing [SPECIFIC CONCERN] in [CONTEXT]. Include evidence-based techniques like mindfulness, cognitive behavioral strategies, stress management, healthy habits, support system building, and professional resource recommendations. Create actionable daily practices and emergency coping strategies.",
    category: "health",
    tags: ["mental health", "wellness", "stress", "mindfulness"],
    icon: BrainIcon,
    color: "from-purple-500 to-purple-600",
    difficulty: "intermediate",
    useCase: "Mental health and stress management"
  },

  // Communication
  {
    id: 16,
    text: "Presentation skills improvement",
    fullPrompt: "Improve presentation skills for [PRESENTATION TYPE] to [AUDIENCE]. Cover content structure, storytelling techniques, visual design principles, delivery tips, body language, voice projection, handling Q&A, managing nerves, and technology setup. Include practice exercises and feedback methods for continuous improvement.",
    category: "communication",
    tags: ["presentation", "public speaking", "communication", "skills"],
    icon: MessageCircleIcon,
    color: "from-teal-500 to-teal-600",
    difficulty: "intermediate",
    useCase: "Professional communication and presentation skills"
  },
  {
    id: 17,
    text: "Difficult conversation guide",
    fullPrompt: "Provide a guide for navigating difficult conversations about [TOPIC] with [RELATIONSHIP/CONTEXT]. Include preparation strategies, opening lines, active listening techniques, de-escalation methods, finding common ground, setting boundaries, and follow-up actions. Address emotional intelligence and conflict resolution principles.",
    category: "communication",
    tags: ["conflict resolution", "communication", "relationships", "emotional intelligence"],
    icon: UsersIcon,
    color: "from-green-500 to-green-600",
    difficulty: "advanced",
    useCase: "Interpersonal communication and conflict resolution"
  },

  // Analysis & Research
  {
    id: 18,
    text: "Market research analysis",
    fullPrompt: "Conduct comprehensive market research analysis for [PRODUCT/SERVICE] in [MARKET/INDUSTRY]. Include market size, target demographics, competitor analysis, pricing strategies, customer pain points, buying behaviors, trends, opportunities, and threats. Provide actionable insights and strategic recommendations with supporting data.",
    category: "analysis",
    tags: ["market research", "analysis", "competition", "strategy"],
    icon: SearchIcon,
    color: "from-yellow-500 to-yellow-600",
    difficulty: "advanced",
    useCase: "Business intelligence and market analysis"
  },
  {
    id: 19,
    text: "Data interpretation guide",
    fullPrompt: "Interpret and analyze this dataset [DESCRIBE DATA]. Identify patterns, trends, correlations, and anomalies. Provide statistical insights, create meaningful visualizations suggestions, and translate findings into actionable business recommendations. Address data quality, limitations, and next steps for further analysis.",
    category: "analysis",
    tags: ["data analysis", "statistics", "insights", "visualization"],
    icon: TrendingUpIcon,
    color: "from-blue-500 to-blue-600",
    difficulty: "advanced",
    useCase: "Data science and business analytics"
  },

  // Entertainment
  {
    id: 20,
    text: "Creative storytelling",
    fullPrompt: "Create an engaging story about [THEME/CONCEPT] for [TARGET AUDIENCE]. Include compelling characters with clear motivations, an interesting plot with conflict and resolution, vivid settings, authentic dialogue, and meaningful themes. Consider pacing, tension, and emotional arc to keep readers engaged throughout.",
    category: "entertainment",
    tags: ["storytelling", "creative writing", "entertainment", "narrative"],
    icon: BookOpenIcon,
    color: "from-violet-500 to-violet-600",
    difficulty: "intermediate",
    useCase: "Creative writing and entertainment content"
  },

  // Additional prompts to reach 30+ examples
  {
    id: 21,
    text: "SEO content optimization",
    fullPrompt: "Optimize content for SEO targeting the keyword '[KEYWORD]'. Include keyword research, on-page optimization, meta descriptions, header structure, internal linking strategies, content length recommendations, and user intent analysis. Ensure content quality while maximizing search visibility.",
    category: "writing",
    tags: ["SEO", "content", "optimization", "keywords"],
    icon: SearchIcon,
    color: "from-blue-500 to-blue-600",
    difficulty: "intermediate",
    useCase: "Search engine optimization and content marketing"
  },
  {
    id: 22,
    text: "Customer service scripts",
    fullPrompt: "Create customer service scripts for handling [SITUATION TYPE]. Include greeting protocols, problem identification questions, solution frameworks, de-escalation techniques, and follow-up procedures. Address empathy, professionalism, and customer satisfaction while maintaining brand voice.",
    category: "communication",
    tags: ["customer service", "scripts", "communication", "support"],
    icon: HeadphonesIcon,
    color: "from-teal-500 to-teal-600",
    difficulty: "beginner",
    useCase: "Customer support and service excellence"
  },
  {
    id: 23,
    text: "Financial planning advice",
    fullPrompt: "Provide financial planning guidance for [FINANCIAL GOAL] with [CURRENT SITUATION]. Include budgeting strategies, investment options, risk assessment, timeline planning, emergency fund recommendations, and tax considerations. Offer actionable steps and monitoring methods for financial success.",
    category: "business",
    tags: ["finance", "planning", "investment", "budgeting"],
    icon: DollarSignIcon,
    color: "from-green-500 to-green-600",
    difficulty: "intermediate",
    useCase: "Personal finance and wealth management"
  },
  {
    id: 24,
    text: "Recipe development",
    fullPrompt: "Create a detailed recipe for [DISH TYPE] that serves [NUMBER] people. Include ingredient list with measurements, step-by-step instructions, cooking techniques, timing, temperature guidelines, substitution options, nutritional information, and presentation tips. Consider dietary restrictions: [RESTRICTIONS].",
    category: "lifestyle",
    tags: ["cooking", "recipes", "food", "nutrition"],
    icon: UtensilsIcon,
    color: "from-orange-500 to-orange-600",
    difficulty: "beginner",
    useCase: "Culinary arts and meal planning"
  },
  {
    id: 25,
    text: "Travel itinerary planning",
    fullPrompt: "Plan a detailed [DURATION] travel itinerary for [DESTINATION] with budget [BUDGET RANGE]. Include transportation, accommodation recommendations, must-see attractions, local experiences, dining suggestions, packing lists, and day-by-day schedules. Consider [TRAVEL STYLE] and [INTERESTS].",
    category: "lifestyle",
    tags: ["travel", "planning", "itinerary", "vacation"],
    icon: PlaneIcon,
    color: "from-blue-500 to-blue-600",
    difficulty: "intermediate",
    useCase: "Travel planning and vacation organization"
  },
  {
    id: 26,
    text: "Interview preparation guide",
    fullPrompt: "Prepare for a [JOB TITLE] interview at [COMPANY TYPE]. Include common interview questions with sample answers, company research strategies, questions to ask the interviewer, what to wear, what to bring, body language tips, and follow-up best practices. Address specific challenges for [EXPERIENCE LEVEL].",
    category: "business",
    tags: ["interview", "career", "job search", "preparation"],
    icon: UsersIcon,
    color: "from-purple-500 to-purple-600",
    difficulty: "intermediate",
    useCase: "Career development and job searching"
  },
  {
    id: 27,
    text: "Home organization system",
    fullPrompt: "Design a home organization system for [SPACE TYPE]. Include decluttering strategies, storage solutions, labeling systems, maintenance routines, and space optimization techniques. Consider [FAMILY SIZE], [LIFESTYLE], and [BUDGET]. Provide step-by-step implementation plan.",
    category: "lifestyle",
    tags: ["organization", "home", "decluttering", "storage"],
    icon: HomeIcon,
    color: "from-teal-500 to-teal-600",
    difficulty: "beginner",
    useCase: "Home organization and lifestyle improvement"
  },
  {
    id: 28,
    text: "Crisis communication plan",
    fullPrompt: "Develop a crisis communication plan for [ORGANIZATION TYPE] addressing [CRISIS TYPE]. Include stakeholder identification, messaging frameworks, communication channels, response timelines, spokesperson guidelines, and recovery strategies. Address transparency, accountability, and reputation management.",
    category: "communication",
    tags: ["crisis", "communication", "PR", "management"],
    icon: ShieldIcon,
    color: "from-red-500 to-red-600",
    difficulty: "advanced",
    useCase: "Public relations and crisis management"
  },
  {
    id: 29,
    text: "Creative workshop design",
    fullPrompt: "Design a creative workshop on [TOPIC] for [AUDIENCE]. Include learning objectives, engaging activities, materials needed, time allocation, group dynamics, ice breakers, and takeaways. Ensure participants leave with practical skills and inspiration. Address different learning styles and engagement levels.",
    category: "education",
    tags: ["workshop", "training", "creativity", "facilitation"],
    icon: LightbulbIcon,
    color: "from-yellow-500 to-yellow-600",
    difficulty: "intermediate",
    useCase: "Training and workshop facilitation"
  },
  {
    id: 30,
    text: "Digital detox plan",
    fullPrompt: "Create a personalized digital detox plan for [TIMEFRAME]. Include current usage assessment, gradual reduction strategies, alternative activities, mindfulness practices, productivity tools, and relapse prevention. Address specific challenges like [WORK REQUIREMENTS] while promoting mental wellness.",
    category: "health",
    tags: ["digital detox", "wellness", "mindfulness", "balance"],
    icon: SmartphoneIcon,
    color: "from-green-500 to-green-600",
    difficulty: "intermediate",
    useCase: "Digital wellness and life balance"
  }
];

// Additional prompts to complete the dataset
const additionalPrompts: Prompt[] = [
  {
    id: 31,
    text: "Game development concept",
    fullPrompt: "Design a game concept for [GENRE] targeting [PLATFORM]. Include core gameplay mechanics, story outline, character designs, level progression, monetization strategy, target audience analysis, technical requirements, and marketing approach. Consider current gaming trends and player preferences.",
    category: "entertainment",
    tags: ["game design", "development", "entertainment", "interactive"],
    icon: Gamepad2Icon,
    color: "from-violet-500 to-violet-600",
    difficulty: "advanced",
    useCase: "Game design and interactive entertainment"
  },
  {
    id: 32,
    text: "Nutrition meal planning",
    fullPrompt: "Create a comprehensive meal plan for [DIETARY GOAL] over [TIMEFRAME]. Include macro/micronutrient breakdowns, shopping lists, meal prep instructions, portion sizes, timing recommendations, and recipe alternatives. Address dietary restrictions: [RESTRICTIONS] and lifestyle factors: [LIFESTYLE].",
    category: "health",
    tags: ["nutrition", "meal planning", "health", "diet"],
    icon: UtensilsIcon,
    color: "from-green-500 to-green-600",
    difficulty: "intermediate",
    useCase: "Nutritional planning and healthy eating"
  },
  {
    id: 33,
    text: "Mobile app UI/UX design",
    fullPrompt: "Design the user interface and experience for a [APP TYPE] mobile app. Include user journey mapping, wireframes, design system, accessibility considerations, interaction patterns, onboarding flow, and usability testing recommendations. Focus on [TARGET USER] needs and platform guidelines.",
    category: "creative",
    tags: ["UI/UX", "mobile", "design", "user experience"],
    icon: SmartphoneIcon,
    color: "from-blue-500 to-blue-600",
    difficulty: "advanced",
    useCase: "Mobile application design and user experience"
  },
  {
    id: 34,
    text: "Investment portfolio analysis",
    fullPrompt: "Analyze an investment portfolio for [INVESTOR TYPE] with [RISK TOLERANCE]. Include asset allocation review, diversification assessment, performance analysis, rebalancing recommendations, tax optimization strategies, and risk management. Consider [TIME HORIZON] and [FINANCIAL GOALS].",
    category: "business",
    tags: ["investment", "portfolio", "finance", "analysis"],
    icon: TrendingUpIcon,
    color: "from-green-500 to-green-600",
    difficulty: "advanced",
    useCase: "Investment analysis and financial planning"
  },
  {
    id: 35,
    text: "Language learning curriculum",
    fullPrompt: "Develop a language learning curriculum for [LANGUAGE] from [CURRENT LEVEL] to [TARGET LEVEL]. Include learning objectives, lesson plans, practice exercises, cultural context, assessment methods, resource recommendations, and progress tracking. Adapt to [LEARNING STYLE] and [TIME AVAILABILITY].",
    category: "education",
    tags: ["language learning", "curriculum", "education", "skills"],
    icon: GlobeIcon,
    color: "from-indigo-500 to-indigo-600",
    difficulty: "intermediate",
    useCase: "Language education and skill development"
  }
];

// Extended dataset to reach 2000+ prompts - this would be populated from the GitHub repositories
export const extendedPrompts: Prompt[] = [
  ...prompts,
  ...additionalPrompts
];

// Popular/Featured prompts for homepage
export const featuredPrompts: Prompt[] = [
  prompts[0], // Create engaging blog post
  prompts[5], // Code review and optimization
  prompts[7], // Creative campaign concepts
  prompts[9], // Personalized learning plan
  prompts[11] // Project management optimization
];

// Utility functions for filtering and searching
export const getPromptsByTags = (tags: string[]): Prompt[] => {
  return extendedPrompts.filter(prompt =>
    tags.some(tag => prompt.tags.includes(tag.toLowerCase()))
  );
};

export const getRandomPrompts = (count: number): Prompt[] => {
  const shuffled = [...extendedPrompts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getPromptsByUseCase = (useCase: string): Prompt[] => {
  const lowerUseCase = useCase.toLowerCase();
  return extendedPrompts.filter(prompt =>
    prompt.useCase.toLowerCase().includes(lowerUseCase)
  );
};

// IMPORTANT: These functions now correctly filter the 'extendedPrompts' array
export const getPromptsByCategory = (categoryId: CategoryId): Prompt[] => {
  if (categoryId === 'all') return extendedPrompts;
  return extendedPrompts.filter(prompt => prompt.category === categoryId);
};

export const getPromptsByDifficulty = (difficulty: DifficultyLevel): Prompt[] => {
  return extendedPrompts.filter(prompt => prompt.difficulty === difficulty);
};

export const searchPrompts = (query: string): Prompt[] => {
  const lowerQuery = query.toLowerCase();
  return extendedPrompts.filter(prompt =>
    prompt.text.toLowerCase().includes(lowerQuery) ||
    prompt.fullPrompt.toLowerCase().includes(lowerQuery) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    prompt.useCase.toLowerCase().includes(lowerQuery)
  );
};

export const getPromptById = (id: number): Prompt | undefined => {
  return extendedPrompts.find(prompt => prompt.id === id);
};

export const getCategoryById = (id: CategoryId): Category | undefined => {
  return categories.find(category => category.id === id);
};

// Statistics about the prompt library - now correctly reflects 'extendedPrompts'
export const getLibraryStats = () => ({
  totalPrompts: extendedPrompts.length,
  categoriesCount: categories.length - 1, // Exclude 'all' category
  difficultyCounts: {
    beginner: getPromptsByDifficulty('beginner').length,
    intermediate: getPromptsByDifficulty('intermediate').length,
    advanced: getPromptsByDifficulty('advanced').length
  },
  categoryDistribution: categories
    .filter(cat => cat.id !== 'all')
    .map(cat => ({
      category: cat.name,
      count: getPromptsByCategory(cat.id).length
    }))
});
