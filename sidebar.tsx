import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  ClipboardCheck, 
  GitBranch, 
  BookOpen, 
  BarChart3, 
  User, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  mobile: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ open, mobile }) => {
  const [location] = useLocation();
  
  const mainNavItems: NavItem[] = [
    {
      path: "/",
      label: "Dashboard",
      icon: <Home className="h-5 w-5 mr-3" />
    },
    {
      path: "/assessment",
      label: "My Assessment",
      icon: <ClipboardCheck className="h-5 w-5 mr-3" />
    },
    {
      path: "/roadmap",
      label: "Career Roadmap",
      icon: <GitBranch className="h-5 w-5 mr-3" />
    },
    {
      path: "/resources",
      label: "Learning Resources",
      icon: <BookOpen className="h-5 w-5 mr-3" />
    },
    {
      path: "/progress",
      label: "Progress Tracking",
      icon: <BarChart3 className="h-5 w-5 mr-3" />
    }
  ];
  
  const accountNavItems: NavItem[] = [
    {
      path: "/profile",
      label: "Profile",
      icon: <User className="h-5 w-5 mr-3" />
    },
    {
      path: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5 mr-3" />
    }
  ];
  
  const classes = cn(
    "bg-white shadow-sm",
    {
      "hidden": mobile && !open,
      "flex flex-col w-64": !mobile || (mobile && open),
      "fixed inset-y-0 left-0 z-30": mobile && open,
    }
  );
  
  return (
    <div className={classes}>
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-primary">CS Career GPS</h1>
      </div>
      
      <div className="flex flex-col flex-grow p-4 overflow-auto">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Main
          </div>
          
          {mainNavItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg",
                  location === item.path
                    ? "text-gray-700 bg-primary bg-opacity-10"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {React.cloneElement(item.icon as React.ReactElement, { 
                  className: cn(
                    (item.icon as React.ReactElement).props.className,
                    location === item.path ? "text-primary" : "text-gray-500"
                  )
                })}
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Account
          </div>
          
          {accountNavItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg",
                  location === item.path
                    ? "text-gray-700 bg-primary bg-opacity-10"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {React.cloneElement(item.icon as React.ReactElement, { 
                  className: cn(
                    (item.icon as React.ReactElement).props.className,
                    location === item.path ? "text-primary" : "text-gray-500"
                  )
                })}
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
