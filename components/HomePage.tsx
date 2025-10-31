
import React, { useState } from 'react';
import { Course, AiMessage } from '../types';
import CourseCard from './CourseCard';
import Footer from './Footer';
import PublicHeader from './PublicHeader';
import { BookOpenIcon, CheckCircleIcon, StarIcon, ShieldCheckIcon, TrophyIcon, UsersIcon } from './icons';
import AiAssistant from './AiAssistant';

interface HomePageProps {
  setPage: (page: 'home' | 'login' | 'register') => void;
}

const featuredCourses: Course[] = [
  {
    id: 'featured-1',
    title: 'Digital Marketing in Finance',
    description: 'Learn how to apply modern digital marketing strategies within the financial sector to reach and engage customers.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop',
    category: 'Digital Banking & Fintech',
    passingScore: 70,
    modules: [
        {
            id: 'module-kpi-1',
            title: 'Key Performance Indicators',
            content: '<p>Measuring the success of digital marketing campaigns is crucial. <strong>Key Performance Indicators (KPIs)</strong> help quantify the effectiveness of your efforts.</p><ul><li><strong>Cost Per Acquisition (CPA):</strong> The cost to acquire a new client.</li><li><strong>Customer Lifetime Value (CLV):</strong> The total revenue a business can expect from a single customer account.</li><li><strong>Conversion Rate:</strong> The percentage of users who complete a desired action, like a loan application.</li><li><strong>Return on Ad Spend (ROAS):</strong> Measures the gross revenue generated for every dollar spent on advertising.</li></ul><p>Tracking these metrics allows for data-driven decisions and optimization of marketing budgets.</p>',
            type: 'text'
        }
    ],
    quiz: [],
    reviews: [],
    discussion: [],
  },
  {
    id: 'featured-2',
    title: 'Cybersecurity for Banking',
    description: 'Understand the critical threats to the banking industry and learn the best practices to secure financial data and systems.',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=600&auto=format&fit=crop',
    category: 'Risk Management in IFB',
    passingScore: 70,
    modules: [],
    quiz: [],
    reviews: [],
    discussion: [],
  },
  {
    id: 'featured-3',
    title: 'Advanced Islamic Finance (IFB)',
    description: 'A deep dive into complex Islamic financial instruments, structures, and modern applications in the banking sector.',
    imageUrl: 'https://images.unsplash.com/photo-1627895513511-23521b6a1f3b?q=80&w=600&auto=format&fit=crop',
    category: 'General Islamic Finance',
    passingScore: 70,
    modules: [],
    quiz: [],
    reviews: [],
    discussion: [],
  }
];


const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-zamzam-teal-100 text-zamzam-teal-600 mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
    </div>
);


const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  const [aiChatHistory, setAiChatHistory] = useState<AiMessage[]>([]);

  return (
    <div className="bg-white font-sans text-slate-800">
      <PublicHeader setPage={setPage} />
      
      {/* Hero Section */}
      <main>
        <div className="bg-zamzam-teal-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-zamzam-teal-800 mb-4">
                Unlock Your Potential in Islamic Finance
                </h1>
                <p className="text-lg md:text-xl text-slate-700 font-medium max-w-3xl mx-auto mb-4">
                ZamZam Bank Academy offers comprehensive learning resources to cultivate expertise in ethical banking and Islamic finance.
                </p>
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                Join Zamzam Bank's dedicated e-learning platform to enhance your expertise, master IFB principles, and accelerate your career growth.
                </p>
                <div className="flex justify-center space-x-4">
                <button
                    onClick={() => setPage('login')}
                    className="bg-zamzam-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-zamzam-teal-700 transition shadow-lg"
                >
                    Employee Login
                </button>
                <button
                    onClick={() => setPage('register')}
                    className="bg-white text-zamzam-teal-700 font-bold py-3 px-8 rounded-lg hover:bg-zamzam-teal-100 transition border border-zamzam-teal-200"
                >
                    Register Now
                </button>
                </div>
            </div>
        </div>

        {/* Features Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800">Why Choose Our Platform?</h2>
                    <p className="text-lg text-slate-600 mt-2">A learning experience designed for excellence.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   <Feature 
                        icon={<BookOpenIcon className="h-8 w-8" />} 
                        title="Expert-Led Content"
                        description="Access comprehensive courses on Murabaha, Ijarah, and more, all curated by industry experts."
                   />
                   <Feature 
                        icon={<CheckCircleIcon className="h-8 w-8" />} 
                        title="Interactive Quizzes"
                        description="Test your understanding and solidify your knowledge with engaging quizzes after each course."
                   />
                   <Feature 
                        icon={<StarIcon className="h-8 w-8" />} 
                        title="Earn Certificates"
                        description="Receive official certificates upon course completion to showcase your achievements and skills."
                   />
                </div>
            </div>
        </section>

        {/* Why ZamZam Bank Academy Section */}
        <section className="bg-slate-50 py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Why ZamZam Bank Academy?</h2>
                        <p className="text-lg text-slate-600 mb-8">Investing in our most valuable asset: our people. Our academy is more than just training; it's a commitment to shared growth and ethical excellence.</p>
                        <ul className="space-y-6">
                            <li className="flex items-start space-x-4">
                                <div className="flex-shrink-0 bg-zamzam-teal-100 text-zamzam-teal-600 p-3 rounded-full">
                                    <ShieldCheckIcon className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-800">Shariah-Compliant Expertise</h4>
                                    <p className="text-slate-600">Deepen your understanding of Islamic finance principles with content that is meticulously aligned with Shariah standards.</p>
                                </div>
                            </li>
                             <li className="flex items-start space-x-4">
                                <div className="flex-shrink-0 bg-zamzam-teal-100 text-zamzam-teal-600 p-3 rounded-full">
                                    <TrophyIcon className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-800">Career Advancement</h4>
                                    <p className="text-slate-600">Gain the skills and certifications necessary to progress within Zamzam Bank and the broader financial industry.</p>
                                </div>
                            </li>
                             <li className="flex items-start space-x-4">
                                <div className="flex-shrink-0 bg-zamzam-teal-100 text-zamzam-teal-600 p-3 rounded-full">
                                    <UsersIcon className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-800">Unified Knowledge Base</h4>
                                    <p className="text-slate-600">Ensure consistent, bank-wide understanding of our products, services, and ethical commitments, fostering a cohesive team culture.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                     <div className="order-1 md:order-2">
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop" 
                            alt="Professionals collaborating in a modern learning environment"
                            className="rounded-xl shadow-lg w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Featured Courses Section */}
        <section className="bg-white py-20">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800">Featured Courses</h2>
                    <p className="text-lg text-slate-600 mt-2">Get a glimpse of the valuable knowledge waiting for you.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses.map(course => (
                    <CourseCard
                    key={course.id}
                    course={course}
                    progress={{ completedModules: [], quizScore: null }}
                    onSelectCourse={() => setPage('login')} // Prompt login on click
                    />
                ))}
                </div>
             </div>
        </section>
      </main>

      <AiAssistant history={aiChatHistory} setHistory={setAiChatHistory} />

      <Footer />
    </div>
  );
};

export default HomePage;
