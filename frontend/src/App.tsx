import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ExpensePage from "./pages/ExpensePage";
import SummaryPage from "./pages/SummaryPage";

export default function App() {
    return (
        <Router>
            <div className="max-w-5xl mx-auto">
                <nav className="p-4 flex gap-6 text-brown font-semibold">
                    <Link
                        to="/"
                        className="hover:underline hover:text-clay transition-colors duration-200"
                    >
                        Expenses
                    </Link>
                    <Link
                        to="/summary"
                        className="hover:underline hover:text-clay transition-colors duration-200"
                    >
                        Summary
                    </Link>
                </nav>

                <Routes>
                    <Route path="/" element={<ExpensePage />} />
                    <Route path="/summary" element={<SummaryPage />} />
                </Routes>
            </div>
        </Router>
    );
}
