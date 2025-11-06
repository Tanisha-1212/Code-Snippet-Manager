import Navbar from "./Navbar";
import Footer from "./Footer";


export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="max-w-7xl mx-auto px-2 sm:py-2 lg:py-3">
        {children}
      </main>
      <Footer/>
    </div>
  );
};

export default MainLayout;