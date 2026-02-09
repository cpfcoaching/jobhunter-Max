import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Calendar, Settings } from 'lucide-react';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/companies', icon: Building2, label: 'Companies' },
        { to: '/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        CyberHunter
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                )
                            }
                        >
                            <Icon size={20} />
                            <span className="font-medium">{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};
