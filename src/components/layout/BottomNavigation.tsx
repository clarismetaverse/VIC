import { Home, CalendarDays, Send } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/activities', label: 'Activities', icon: CalendarDays },
  { to: '/activities/invite', label: 'Invite', icon: Send },
];

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-3">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-1 py-3 text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
