'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { name: 'Users', href: '/users' },
  { name: 'Stores', href: '/stores' },
  { name: 'Products', href: '/products' },
  { name: 'Orders', href: '/orders' },
  { name: 'Database', href: '/database', superAdmin: true },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { isSuperAdmin } = useAuth();

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-8">Admin</h2>
      <nav>
        <ul>
          {navLinks.map((link) => {
            if (link.superAdmin && !isSuperAdmin) {
              return null;
            }
            return (
              <li key={link.name} className="mb-2">
                <Link href={link.href}>
                  <p className={`block p-2 rounded ${pathname === link.href ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    {link.name}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;