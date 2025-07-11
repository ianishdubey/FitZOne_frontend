import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Programs from './components/Programs';
import Pricing from './components/Pricing';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProgramDetail from './components/ProgramDetail';
import ProgramsPage from './components/ProgramsPage';
import PurchasePage from './components/PurchasePage';
import ServiceDetail from './components/ServiceDetail';
import PricingDetail from './components/PricingDetail';

const HomePage = () => (
  <>
    <Hero />
    <Services />
    <Programs />
    <Pricing />
    <About />
    <Contact />
  </>
);
function App() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app load
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/program/:programId" element={<ProgramDetail />} />
          <Route path="/purchase/:programId" element={<PurchasePage />} />
          <Route path="/service/:serviceId" element={<ServiceDetail />} />
          <Route path="/pricing/:planId" element={<PricingDetail />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;