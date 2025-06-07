'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/Logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/FirebaseContext';
import { BookOpen, LayoutDashboard, UserCircle, FileUp, Edit3, BarChart3, Compass } from 'lucide-react';

const studentNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'My Courses', icon: BookOpen },
  { href: '/learning-path', label: 'My Learning Path', icon: Compass },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

const instructorNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/instructor/courses', label: 'Manage Courses', icon: Edit3 },
  { href: '/instructor/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();

  const navItems = userProfile?.role === 'instructor' ? instructorNavItems : studentNavItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <Logo className="h-10 w-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  className={cn(
                    'w-full justify-start',
                    pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}

          {userProfile?.role === 'instructor' && (
             <SidebarGroup>
                <SidebarGroupLabel>Course Creation</SidebarGroupLabel>
                <SidebarMenuItem>
                     <Link href="/instructor/courses/new" legacyBehavior passHref>
                        <SidebarMenuButton
                            className={cn(
                                'w-full justify-start',
                                pathname === "/instructor/courses/new" && 'bg-sidebar-accent text-sidebar-accent-foreground'
                            )}
                            isActive={pathname === "/instructor/courses/new"}
                            tooltip={{ children: "Create New Course", side: 'right', align: 'center' }}
                        >
                         <Edit3 className="h-5 w-5 mr-3" />
                         <span>Create New Course</span>
                        </SidebarMenuButton>
                     </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                     <Link href="/instructor/upload-content" legacyBehavior passHref>
                        <SidebarMenuButton
                            className={cn(
                                'w-full justify-start',
                                pathname === "/instructor/upload-content" && 'bg-sidebar-accent text-sidebar-accent-foreground'
                            )}
                            isActive={pathname === "/instructor/upload-content"}
                            tooltip={{ children: "Upload Content", side: 'right', align: 'center' }}
                        >
                         <FileUp className="h-5 w-5 mr-3" />
                         <span>Upload Content</span>
                        </SidebarMenuButton>
                     </Link>
                </SidebarMenuItem>
             </SidebarGroup>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {/* Footer content if any, e.g. version, help link */}
        <p className="text-xs text-sidebar-foreground/70">LearnFlow &copy; {new Date().getFullYear()}</p>
      </SidebarFooter>
    </Sidebar>
  );
}
