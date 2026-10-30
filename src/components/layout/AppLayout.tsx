import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from './AppLayout.module.css';

const COLLAPSED_KEY = 'aquece-lar:menu-recolhido';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch (error) {
    console.warn('Não foi possível ler a preferência do menu', error);
    return false;
  }
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
      } catch (error) {
        console.warn('Não foi possível salvar a preferência do menu', error);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.classList.add('no-scroll');
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className={styles.shell}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={toggleCollapsed}
        onCloseMobile={closeMobile}
      />
      <div className={styles.content}>
        <Topbar mobileMenuOpen={mobileOpen} onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
