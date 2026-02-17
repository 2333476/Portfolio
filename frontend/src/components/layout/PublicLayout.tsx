import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

export default function PublicLayout() {
    const location = useLocation();
    const isFixedPage = location.pathname === '/' || location.pathname === '/about';

    return (
        <div className={`bg-gray-950 text-white font-sans selection:bg-green-500 selection:text-black ${isFixedPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            <Navbar />
            <main className={isFixedPage ? '' : 'pt-20'}>
                <Outlet />
            </main>
            {!isFixedPage && <Footer />}
        </div>
    );
}
