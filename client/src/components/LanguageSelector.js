import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
    ];

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
    };

    return (
        <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                <span>{languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}</span>
                <span className="hidden md:block">
                    {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {languages.map((language) => (
                    <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`flex items-center space-x-3 px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${i18n.language === language.code ? 'bg-green-50 text-green-700' : 'text-gray-700'
                            }`}
                    >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSelector;