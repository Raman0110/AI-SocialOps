/**
 * Single icon set for the app: Lucide, 1.75px stroke, sized to the surrounding
 * text (1em) so icons behave like the Ant Design icons they replace.
 *
 * Names intentionally mirror the previous `@ant-design/icons` exports so call
 * sites only needed their import path changed.
 */
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CircleAlert,
  Clock,
  Code2,
  FlaskConical,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Info,
  Copy,
  ChevronsLeft,
  ChevronsRight,
  CircleDashed,
  CircleX,
  User,
  Loader,
  History,
  IdCard,
  LayoutDashboard,
  Link2,
  Lightbulb,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  MessagesSquare,
  MapPin,
  Network,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Bot,
  Settings,
  Trash2,
  Unplug,
  Users,
  LayoutGrid,
  DollarSign,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

function wrap(Icon: LucideIcon, name: string) {
  const Wrapped = (props: LucideProps) => (
    <Icon size="1em" strokeWidth={1.75} aria-hidden="true" focusable="false" {...props} />
  );
  Wrapped.displayName = name;
  return Wrapped;
}

export const ApiOutlined = wrap(Network, "ApiOutlined");
export const AppstoreOutlined = wrap(LayoutGrid, "AppstoreOutlined");
export const ArrowLeftOutlined = wrap(ArrowLeft, "ArrowLeftOutlined");
export const ArrowRightOutlined = wrap(ArrowRight, "ArrowRightOutlined");
export const AuditOutlined = wrap(History, "AuditOutlined");
export const BellOutlined = wrap(Bell, "BellOutlined");
export const BookOutlined = wrap(BookOpen, "BookOutlined");
export const BulbOutlined = wrap(Lightbulb, "BulbOutlined");
export const CheckCircleOutlined = wrap(CheckCircle2, "CheckCircleOutlined");
export const CheckOutlined = wrap(Check, "CheckOutlined");
export const ClockCircleOutlined = wrap(Clock, "ClockCircleOutlined");
export const CloseOutlined = wrap(X, "CloseOutlined");
export const CodeOutlined = wrap(Code2, "CodeOutlined");
export const CommentOutlined = wrap(MessagesSquare, "CommentOutlined");
export const DashboardOutlined = wrap(LayoutDashboard, "DashboardOutlined");
export const DeleteOutlined = wrap(Trash2, "DeleteOutlined");
export const DisconnectOutlined = wrap(Unplug, "DisconnectOutlined");
export const DollarOutlined = wrap(DollarSign, "DollarOutlined");
export const DownOutlined = wrap(ChevronDown, "DownOutlined");
export const EnvironmentOutlined = wrap(MapPin, "EnvironmentOutlined");
export const ExclamationCircleOutlined = wrap(CircleAlert, "ExclamationCircleOutlined");
export const ExperimentOutlined = wrap(FlaskConical, "ExperimentOutlined");
export const IdcardOutlined = wrap(IdCard, "IdcardOutlined");
export const LeftOutlined = wrap(ChevronLeft, "LeftOutlined");
export const LinkOutlined = wrap(Link2, "LinkOutlined");
export const LockOutlined = wrap(Lock, "LockOutlined");
export const LogoutOutlined = wrap(LogOut, "LogoutOutlined");
export const MailOutlined = wrap(Mail, "MailOutlined");
export const MenuOutlined = wrap(Menu, "MenuOutlined");
export const MessageOutlined = wrap(MessageSquare, "MessageOutlined");
export const PhoneOutlined = wrap(Phone, "PhoneOutlined");
export const PlayCircleOutlined = wrap(Play, "PlayCircleOutlined");
export const PlusOutlined = wrap(Plus, "PlusOutlined");
export const ReloadOutlined = wrap(RefreshCw, "ReloadOutlined");
export const RobotOutlined = wrap(Bot, "RobotOutlined");
export const SettingOutlined = wrap(Settings, "SettingOutlined");
export const TeamOutlined = wrap(Users, "TeamOutlined");
export const ThunderboltOutlined = wrap(Zap, "ThunderboltOutlined");


/** Extra glyphs used by shared primitives (Badge, CopyableId, Sidebar). */
export const ShieldAlertIcon = wrap(ShieldAlert, "ShieldAlertIcon");
export const ShieldCheckIcon = wrap(ShieldCheck, "ShieldCheckIcon");
export const InfoIcon = wrap(Info, "InfoIcon");
export const CopyIcon = wrap(Copy, "CopyIcon");
export const CollapseIcon = wrap(ChevronsLeft, "CollapseIcon");
export const ExpandIcon = wrap(ChevronsRight, "ExpandIcon");
export const DashedCircleIcon = wrap(CircleDashed, "DashedCircleIcon");
export const XCircleIcon = wrap(CircleX, "XCircleIcon");
export const UserIcon = wrap(User, "UserIcon");
export const InProgressIcon = wrap(Loader, "InProgressIcon");
