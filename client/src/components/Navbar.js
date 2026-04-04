import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-6 flex-wrap">
                        <Link to="/dashboard" className="text-lg font-semibold text-green-700">
                            KrishiPath
                        </Link>
                        <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                            Dashboard
                        </Link>
                        <Link to="/track" className="text-sm text-gray-600 hover:text-gray-900">
                            {t('produce.trackProduce')}
                        </Link>
                        <Link to="/scan" className="text-sm text-gray-600 hover:text-gray-900">
                            QR
                        </Link>
                        {user.role === 'farmer' && (
                            <Link to="/add-produce" className="text-sm text-gray-600 hover:text-gray-900">
                                {t('produce.addProduce')}
                            </Link>
                        )}
                        {user.role === 'government' && (
                            <Link to="/government" className="text-sm text-gray-600 hover:text-gray-900">
                                Government
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            {user.name} · {t('roles.' + user.role, { defaultValue: user.role })}
                        </span>
                        <LanguageSelector />
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                            {t('auth.logout', { defaultValue: 'Logout' })}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
