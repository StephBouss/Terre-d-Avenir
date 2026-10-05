import type { CSSProperties } from 'react'
import {
  ArrowRight, ArrowUpRight, Award, Book, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, Circle, CircleCheck, Clock,
  Filter, Globe, GraduationCap, Grid3X3, Handshake, Heart, HeartPulse, Image as ImageIcon, Info, Leaf, Link2,
  Lock, Mail, MapPin, Menu, Newspaper, Phone, Play, Plus, Quote, Rows3, Send, Target, Trophy, Upload, UserPlus, Users,
  Video, Vote, X,
} from 'lucide-react'

const iconMap = {
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  award: Award,
  book: Book,
  bookmark: Bookmark,
  check: Check,
  'check-circle': CircleCheck,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  clock: Clock,
  filter: Filter,
  globe: Globe,
  'graduation-cap': GraduationCap,
  'grid-3x3': Grid3X3,
  handshake: Handshake,
  heart: Heart,
  'heart-pulse': HeartPulse,
  image: ImageIcon,
  info: Info,
  leaf: Leaf,
  'link-2': Link2,
  lock: Lock,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  newspaper: Newspaper,
  phone: Phone,
  play: Play,
  plus: Plus,
  quote: Quote,
  'rows-3': Rows3,
  send: Send,
  target: Target,
  trophy: Trophy,
  upload: Upload,
  'user-plus': UserPlus,
  users: Users,
  video: Video,
  vote: Vote,
  x: X,
} as const

export type IconName = keyof typeof iconMap

type Props = { i: IconName | string; size?: number; strokeWidth?: number; className?: string; style?: CSSProperties }

export default function Icon({ i, size = 20, strokeWidth = 2, className, style }: Props) {
  const LucideIcon = iconMap[i as IconName] ?? Circle
  return <LucideIcon size={size} strokeWidth={strokeWidth} aria-hidden="true" className={className} style={style} />
}
