import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import LanguageSelector from '../components/LanguageSelector';

const Login = () => {
    const { t } = useTranslation();
    const { login, register, loading } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'farmer',
        address: '',
        phone: '',
        walletAddress: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData);
        }

        if (!result.success) {
            setMessage(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <div className="text-center">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                🌾 AgriTrustChain
                            </h2>
                            <LanguageSelector />
                        </div>
                        <p className="text-sm text-gray-600 mb-8">
                            {isLogin ? t('auth.login') : t('auth.register')}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="name" className="sr-only">
                                        {t('auth.name')}
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder={t('auth.name')}
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="role" className="sr-only">
                                        {t('auth.role')}
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        required
                                        className="relative block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="farmer">{t('roles.farmer')}</option>
                                        <option value="transporter">{t('roles.transporter')}</option>
                                        <option value="retailer">{t('roles.retailer')}</option>
                                        <option value="consumer">{t('roles.consumer')}</option>
                                        <option value="government">{t('roles.government')}</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email" className="sr-only">
                                {t('auth.email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                placeholder={t('auth.email')}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">
                                {t('auth.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                placeholder={t('auth.password')}
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="phone" className="sr-only">
                                        {t('auth.phone')}
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder={t('auth.phone')}
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="sr-only">
                                        {t('auth.address')}
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows="2"
                                        className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder={t('auth.address')}
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="walletAddress" className="sr-only">
                                        {t('auth.walletAddress')}
                                    </label>
                                    <input
                                        id="walletAddress"
                                        name="walletAddress"
                                        type="text"
                                        className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder={t('auth.walletAddress')}
                                        value={formData.walletAddress}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        {message && (
                            <div className="text-red-600 text-sm text-center">{message}</div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('common.loading')}
                                    </span>
                                ) : (
                                    <span>
                                        {isLogin ? t('auth.login') : t('auth.register')}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                className="text-green-600 hover:text-green-500 text-sm"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin
                                    ? `Don't have an account? ${t('auth.register')}`
                                    : `Already have an account? ${t('auth.login')}`
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};