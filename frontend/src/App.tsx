import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { List, PieChart, FileText } from "lucide-react";
import ExpensePage from "./pages/ExpensePage";
import SummaryPage from "./pages/SummaryPage";
import TemplatesPage from "./pages/TemplatesPage";

export default function App() {
    return (
        <Router>
            <div className="max-w-5xl mx-auto">
                <nav className="p-4 flex gap-6 text-brown font-semibold">
                    <Link
                        to="/"
                        className="hover:underline hover:text-clay transition-colors duration-200 flex items-center gap-2"
                        aria-label="Expenses"
                    >
                        <List size={20} />
                    </Link>
                    <Link
                        to="/summary"
                        className="hover:underline hover:text-clay transition-colors duration-200 flex items-center gap-2"
                        aria-label="Summary"
                    >
                        <PieChart size={20} />
                    </Link>
                    <Link
                        to="/templates"
                        className="hover:underline hover:text-clay transition-colors duration-200 flex items-center gap-2"
                        aria-label="Templates"
                    >
                        <FileText size={20} />
                    </Link>
                </nav>

                <Routes>
                    <Route path="/" element={<ExpensePage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    <Route path="/templates" element={<TemplatesPage />} />
                </Routes>
            </div>
        </Router>
    );
}
