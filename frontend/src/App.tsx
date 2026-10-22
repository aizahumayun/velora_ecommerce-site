/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { authService } from './services/authService';
import { login, logout } from './store/slices/authSlice';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickAddModal } from './components/common/QuickAddModal';
import { SizeGuideModal } from './components/common/SizeGuideModal';
import { ToastNotification } from './components/common/ToastNotification';
const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then((module) => ({ default: module.ShopPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then((module) => ({ default: module.OrderConfirmationPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then((module) => ({ default: module.AccountPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then((module) => ({ default: module.OrderDetailPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((module) => ({ default: module.ContactPage })));

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RestoreSession() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!authService.getToken()) {
      dispatch(logout());
      return;
    }

    let active = true;
    authService.getCurrentUser().then((user) => {
      if (!active) return;
      dispatch(user ? login(user) : logout());
    });

    return () => {
      active = false;
    };
  }, [dispatch]);

  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <RestoreSession />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#EEE9DF] text-[#1B2632] selection:bg-[#1B2632] selection:text-[#EEE9DF] font-sans antialiased overflow-x-hidden">
          <Navbar />

          <main className="flex-1 pt-24 sm:pt-28">
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-xs text-[#2C3B4D]" role="status">Loading</div>}>
            <Routes>
              {/* Core Store Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Customer Account & Order Routes */}
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/orders" element={<OrdersPage />} />
              <Route path="/account/orders/:id" element={<OrderDetailPage />} />

              {/* Editorial / Support Routes */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Legacy Story redirects */}
              <Route path="/story" element={<Navigate to="/about" replace />} />
              <Route path="/our-story" element={<Navigate to="/about" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </main>

          <Footer />

          {/* Global Modals & Overlays */}
          <CartDrawer />
          <QuickAddModal />
          <SizeGuideModal />
          <ToastNotification />
        </div>
      </BrowserRouter>
    </Provider>
  );
}
