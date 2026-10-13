// Main Layout with Role-Aware Navigation - Professional Dashboard Style
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  UserPlus,
  Award,
  FileText,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
  BookMarked,
  UserCog,
} from 'lucide-react';
import { clsx } from 'clsx';

// Design tokens for professional look
const SIDEBAR_WIDTH = 'w-64';
const SIDEBAR_WIDTH_COLLAPSED = 'w-16';

// Professional Maroon Theme Colors
const MAROON_THEME = {
  // Sidebar background - deep, rich maroon that's easy on eyes
  sidebarBg: 'bg-gradient-to-b from-maroon-900 via-maroon-950 to-maroon-900',
  sidebarBgLight: 'bg-maroon-900/95',
  // Header area
  headerBg: 'bg-maroon-950/95',
  headerBorder: 'border-maroon-800/50',
  // Navigation items
  navItemActive: 'bg-maroon-800/50 text-maroon-100 shadow-[0_0_0_1px_rgba(127,29,29,0.3)]',
  navItemInactive: 'text-maroon-200/80 hover:text-maroon-50 hover:bg-maroon-800/30',
  navItemIconActive: 'text-maroon-200',
  navItemIconInactive: 'text-maroon-300/70',
  // Borders and dividers
  divider: 'border-maroon-800/50',
  // User section
  userSectionBg: 'bg-maroon-950/80',
  userSectionBorder: 'border-maroon-800/50',
  // Text colors
  textPrimary: 'text-maroon-50',
  textSecondary: 'text-maroon-200/70',
  textMuted: 'text-maroon-300/50',
  // Accent colors for badges/role
  accentBg: 'bg-maroon-800/50',
  accentText: 'text-maroon-100',
  accentBorder: 'border-maroon-700/50',
  // Logo gradient
  logoGradient: 'from-maroon-400 via-maroon-300 to-maroon-400',
  logoGradientHover: 'from-maroon-300 via-maroon-200 to-maroon-300',
  // Shadows
  shadowSoft: 'shadow-[0_4px_14px_rgba(0,0,0,0.25)]',
  shadowGlow: 'shadow-[0_0_20px_rgba(127,29,29,0.15)]',
  // Tooltip
  tooltipBg: 'bg-slate-900',
  // Scrollbar - hidden but scrollable
  scrollbarThumb: 'bg-transparent',
  scrollbarTrack: 'bg-transparent',
};

// Breadcrumb item type
interface BreadcrumbItem {
  label: string;
  path?: string;
}

// Generate breadcrumbs based on current path
const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', path: '/dashboard' }];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    // Format the label: replace hyphens with spaces and capitalize
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    breadcrumbs.push({ label, path: currentPath });
  }

  return breadcrumbs;
};

// Breadcrumb Component - Professional Design
const Breadcrumbs: React.FC<{ pathname: string }> = ({ pathname }) => {
  const breadcrumbs = useMemo(() => generateBreadcrumbs(pathname), [pathname]);

  // Don't show breadcrumbs on dashboard pages (including role-specific ones)
  const isDashboardPage = pathname === '/dashboard' || 
    pathname === '/admin/dashboard' || 
    pathname === '/registrar/dashboard' || 
    pathname === '/instructor/dashboard' || 
    pathname === '/student/dashboard';
  
  if (isDashboardPage || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
      <div className="px-4 lg:px-6 py-2.5">
        <ol className="flex items-center space-x-1.5 text-sm" role="list">
          {breadcrumbs.map((item, index) => (
            <li key={item.path || item.label} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
              )}
              {item.path && index < breadcrumbs.length - 1 ? (
                <NavLink
                  to={item.path}
                  className="text-slate-500 hover:text-slate-700 font-medium transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  {item.label}
                </NavLink>
              ) : (
                <span className="text-slate-900 font-medium px-2 py-1" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  children?: NavItem[];
  badge?: string;
  badgeColor?: string;
}

// Professional Navigation Configuration
const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['ADMIN'],
  },
  {
    label: 'Dashboard',
    path: '/registrar/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['REGISTRAR'],
  },
  {
    label: 'Dashboard',
    path: '/instructor/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'Dashboard',
    path: '/student/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Students',
    path: '/students',
    icon: <Users className="w-5 h-5" />,
    roles: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR'],
  },
  {
    label: 'Programs',
    path: '/programs',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['ADMIN', 'REGISTRAR'],
  },
  {
    label: 'Courses',
    path: '/courses',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['ADMIN', 'REGISTRAR'],
  },
  {
    label: 'Academic Terms',
    path: '/academic-terms',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['ADMIN', 'REGISTRAR'],
  },
  {
    label: 'Course Offerings',
    path: '/course-offerings',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR'],
  },
  {
    label: 'Enrollments',
    path: '/enrollments',
    icon: <UserPlus className="w-5 h-5" />,
    roles: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    label: 'Grades',
    path: '/grades',
    icon: <Award className="w-5 h-5" />,
    roles: ['ADMIN', 'REGISTRAR', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    label: 'Academic Records',
    path: '/academic-records',
    icon: <FileText className="w-5 h-5" />,
    roles: ['ADMIN', 'REGISTRAR', 'STUDENT'],
  },
];

// Student-specific navigation
const studentNavigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'My Prospectus',
    path: '/prospectus',
    icon: <BookMarked className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'My Enrollments',
    path: '/enrollments',
    icon: <UserPlus className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'My Grades',
    path: '/grades',
    icon: <Award className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'My Academic Record',
    path: '/academic-records',
    icon: <FileText className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'My Profile',
    path: '/profile',
    icon: <UserCog className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['STUDENT'],
  },
];

// Instructor-specific navigation
const instructorNavigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'My Course Offerings',
    path: '/course-offerings',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'My Students',
    path: '/students',
    icon: <Users className="w-5 h-5" />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'Grades',
    path: '/grades',
    icon: <Award className="w-5 h-5" />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: <Settings className="w-5 h-5" />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['INSTRUCTOR'],
  },
];

export const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Persist sidebar collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const getNavigation = () => {
    if (!user) return [];
    switch (user.role) {
      case 'STUDENT':
        return studentNavigation;
      case 'INSTRUCTOR':
        return instructorNavigation;
      default:
        return navigation;
    }
  };

  const navItems = getNavigation().filter((item) => item.roles.includes(user?.role || ''));

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      // Match generic dashboard or any role-specific dashboard
      return location.pathname === '/dashboard' || 
        location.pathname === '/admin/dashboard' || 
        location.pathname === '/registrar/dashboard' || 
        location.pathname === '/instructor/dashboard' || 
        location.pathname === '/student/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle click outside sidebar (on main content) - collapse sidebar
  const handleMainContentClick = () => {
    if (!sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading SIMS...</p>
        </div>
      </div>
    );
  }

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;
  const mainContentMargin = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64';

  // Role-based color accents - using maroon theme with subtle role differentiation
  const roleColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    ADMIN: { bg: 'bg-blue-900/30', text: 'text-blue-200', border: 'border-blue-700/50', icon: 'text-blue-300' },
    REGISTRAR: { bg: 'bg-blue-900/30', text: 'text-blue-200', border: 'border-blue-700/50', icon: 'text-blue-300' },
    INSTRUCTOR: { bg: 'bg-emerald-900/30', text: 'text-emerald-200', border: 'border-emerald-700/50', icon: 'text-emerald-300' },
    STUDENT: { bg: 'bg-slate-800/30', text: 'text-slate-200', border: 'border-slate-700/50', icon: 'text-slate-300' },
  };

  const roleColor = roleColors[user?.role || 'STUDENT'] || roleColors.STUDENT;

  // Pre-compute conditional content to avoid JSX parsing issues
    const logoText = sidebarCollapsed ? null : (
      <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent transition-all duration-200">SIMS</span>
    );
    
    const roleBadge = sidebarCollapsed ? null : (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${roleColor.bg} ${roleColor.text} ${roleColor.border}`}>
          {user?.role}
        </span>
      </div>
    );

    return (
      <div className="min-h-screen lg:flex bg-slate-50">
      {/* Mobile sidebar overlay */}
      <div
        className={clsx('fixed inset-0 z-40 lg:hidden transition-opacity duration-200', sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar - Professional Maroon Theme */}
      <aside
        className={clsx(
          'fixed lg:fixed inset-y-0 left-0 z-50 flex-none flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 h-screen',
          sidebarWidth,
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          MAROON_THEME.sidebarBg,
          MAROON_THEME.shadowSoft,
          MAROON_THEME.shadowGlow,
          'scrollbar-thin scrollbar-thumb-maroon-700 scrollbar-track-maroon-900'
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-screen">
          {/* Logo/Header - Professional Maroon - Match Login Page */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-maroon-800/50 bg-maroon-950/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-maroon-500 via-maroon-600 to-maroon-700 flex items-center justify-center shadow-lg shadow-maroon-500/30 border border-maroon-400/30">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
              {logoText}
            </div>
            {roleBadge}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.path}
                item={item}
                isActive={isActive(item.path)}
                isExpanded={expandedItems.has(item.path)}
                onToggle={toggleExpand}
                onClick={() => setSidebarOpen(false)}
                sidebarCollapsed={sidebarCollapsed}
                onExpandSidebar={toggleSidebarCollapse}
              />
            ))}
          </nav>

          {/* Settings Button at Bottom - Navigate to Profile */}
          <div className="mt-auto p-4 border-t border-maroon-800/50 bg-maroon-950/80">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-center gap-3 px-3 py-2.5 text-sm font-medium text-maroon-200/80 hover:text-maroon-50 hover:bg-maroon-800/50 rounded-xl transition-all duration-200"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Profile Settings</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={clsx('flex-1 min-w-0 lg:pl-0', mainContentMargin)} onClick={handleMainContentClick}>
        {/* Top Bar - Mobile only */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200/50 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">SIMS</span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Breadcrumbs */}
        <Breadcrumbs pathname={location.pathname} />

        {/* Page Content */}
        <main className="p-4 lg:p-6 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Nav Item Component - Professional Maroon Theme
interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: (path: string) => void;
  onClick: () => void;
  sidebarCollapsed: boolean;
  onExpandSidebar: () => void;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({ 
  item, 
  isActive, 
  isExpanded, 
  onToggle, 
  onClick, 
  sidebarCollapsed,
  onExpandSidebar
}) => {
  const navigate = useNavigate();
  const hasChildren = item.children && item.children.length > 0;
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Extract icon from React.ReactNode
  const iconElement = item.icon as React.ReactElement;
  const IconComponent = iconElement?.type as React.ComponentType<{ className?: string }>;
  const iconProps = iconElement?.props || {};

  // Professional Maroon Theme Styles
  const baseStyles = 'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative';
  const activeStyles = 'bg-maroon-800/50 text-maroon-100 shadow-[0_0_0_1px_rgba(127,29,29,0.3)]';
  const inactiveStyles = 'text-maroon-200/80 hover:text-maroon-50 hover:bg-maroon-800/30';
  const collapsedStyles = sidebarCollapsed ? 'justify-center px-2' : '';

  const renderItem = (_content: React.ReactNode, className: string, onClickHandler?: () => void, ariaCurrent?: boolean | 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false') => (
    <div className="group relative">
      <button
        onClick={() => {
          // If sidebar is collapsed and item has no children, expand sidebar first
          if (sidebarCollapsed && !hasChildren) {
            onExpandSidebar();
          }
          // Navigate to the item's path
          navigate(item.path);
          onClickHandler?.();
        }}
        className={clsx(baseStyles, className, collapsedStyles)}
        aria-current={ariaCurrent}
        aria-expanded={hasChildren ? isExpanded : undefined}
        title={sidebarCollapsed && !hasChildren ? item.label : undefined}
      >
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-colors duration-200" style={{ color: isActive ? 'inherit' : 'inherit' }}>
          {IconComponent ? <IconComponent className={clsx('w-5 h-5', isActive ? 'text-maroon-200' : 'text-maroon-300/70')} {...iconProps} /> : item.icon}
        </span>
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
            <span className="text-left truncate font-medium" style={{ color: isActive ? 'inherit' : 'inherit' }}>
              {item.label}
            </span>
          </div>
        )}
        {hasChildren && !sidebarCollapsed && (
          <ChevronDown
            className={clsx('w-5 h-5 transition-transform duration-200 flex-shrink-0 text-maroon-300/70', isExpanded && 'rotate-180')}
          />
        )}
        {/* Tooltip for collapsed sidebar - must be inside button for group-hover to work */}
        {sidebarCollapsed && !hasChildren && (
          <div
            ref={tooltipRef}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap z-50 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 flex items-center gap-2"
            style={{ minWidth: '180px' }}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              {IconComponent ? <IconComponent className="w-5 h-5" {...iconProps} /> : item.icon}
            </span>
            <span>{item.label}</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-4 border-transparent border-r-slate-900" />
          </div>
        )}
      </button>
    </div>
  );

  if (hasChildren) {
    return (
      <div>
        {renderItem(
          null,
          isActive ? activeStyles : inactiveStyles,
          () => onToggle(item.path),
          isActive ? 'page' : undefined
        )}
        {!sidebarCollapsed && isExpanded && (
          <div className="ml-3 mt-1.5 space-y-0.5 pl-2 border-l border-maroon-800/50 animate-slide-down">
            {item.children!.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onClick}
                className={({ isActive: childActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 ml-2',
                    childActive 
                      ? 'bg-maroon-800/50 text-maroon-100 font-medium shadow-[0_0_0_1px_rgba(127,29,29,0.3)]' 
                      : 'text-maroon-200/80 hover:text-maroon-50 hover:bg-maroon-800/30'
                  )
                }
              >
                <span className="w-5 h-5 flex items-center justify-center text-maroon-300/70">
                  {child.icon}
                </span>
                <span className="flex-1 truncate font-medium">{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return renderItem(
    null,
    isActive ? activeStyles : inactiveStyles,
    onClick,
    isActive ? 'page' : undefined
  );
};