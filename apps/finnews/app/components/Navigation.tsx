import { Link, useLocation } from 'react-router';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/ticker-sync', label: 'Ticker Sync' },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              FinNews
            </Link>
            <div className="flex gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActive
                        ? 'text-blue-600 border-b-2 border-blue-600 pb-[22px]'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
