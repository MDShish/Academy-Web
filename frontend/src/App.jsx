import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, GraduationCap, BarChart3, Download, Printer, User, School, MapPin, Phone, GraduationCap as BoardIcon, Heart, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Lock, LayoutDashboard, FileSpreadsheet, LogOut, ChevronRight } from 'lucide-react';
import questionsData from './questions.json';
import axios from 'axios';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.VITE_API_URL;

axios.post(`${API_BASE}/api/admin/login`, data)


// --- Sub-Components ---

const RegistrationForm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    district: '',
    mobile: '',
    board: 'SSLC',
    consent: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.consent) {
      onNext(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-white"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-2xl mb-4">
          <Heart className="text-pink-500 w-8 h-8 fill-pink-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Hello, Future Star!</h2>
        <p className="text-gray-500 mt-2">Let's find the best path for your journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text"><User className="inline w-4 h-4 mr-1" />What's your name?</label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text"><School className="inline w-4 h-4 mr-1" />School Name</label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text"><MapPin className="inline w-4 h-4 mr-1" />District</label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text"><Phone className="inline w-4 h-4 mr-1" />Mobile Number</label>
            <input
              type="tel"
              required
              className="input-field"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text"><BoardIcon className="inline w-4 h-4 mr-1" />Your Board</label>
            <select
              className="input-field"
              value={formData.board}
              onChange={(e) => setFormData({ ...formData, board: e.target.value })}
            >
              <option value="SSLC">SSLC (Karnataka)</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 p-3 bg-pink-50/50 rounded-xl">
          <input
            type="checkbox"
            id="consent"
            required
            className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
            checked={formData.consent}
            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
          />
          <label htmlFor="consent" className="mb-0 text-sm text-gray-600 font-medium cursor-pointer">
            I'm ready to take this career quiz!
          </label>
        </div>

        <button type="submit" className="primary-button mt-6 flex items-center justify-center gap-2">
          Start My Journey <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
};

const Questionnaire = ({ studentName, onComplete }) => {
  const [responses, setResponses] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const questionsPerPage = 10;

  const totalSections = Math.ceil(questionsData.length / questionsPerPage);
  const currentQuestions = questionsData.slice(
    currentSection * questionsPerPage,
    (currentSection + 1) * questionsPerPage
  );

  const handleScore = (id, score) => {
    setResponses({ ...responses, [id]: score });
  };

  const isSectionComplete = currentQuestions.every(q => responses[q.id]);
  const isAllComplete = questionsData.every(q => responses[q.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto w-full px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Hey {studentName}! 🚀</h2>
        <p className="text-gray-500">Pick how much you agree with each statement</p>
      </div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {[...Array(totalSections)].map((_, i) => (
          <div
            key={i}
            className={`timeline-dot ${i <= currentSection ? 'active' : ''}`}
          >
            {i < currentSection ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentQuestions.map((q) => (
              <div key={q.id} className="question-card">
                <p className="text-lg font-semibold text-gray-700">{q.text}</p>
                <div className="option-group">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      className={`option-btn ${responses[q.id] === val ? 'active' : ''}`}
                      onClick={() => handleScore(q.id, val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-2 px-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>No Way!</span>
                  <span>Maybe</span>
                  <span>Yes!!</span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-4 mt-8 pb-10">
        <button
          className="primary-button flex-1 bg-white text-gray-500 border-2 border-gray-100 shadow-none hover:bg-gray-50 flex items-center justify-center gap-2"
          onClick={() => {
            if (currentSection > 0) {
              setCurrentSection(s => s - 1);
              window.scrollTo(0, 0);
            }
          }}
          disabled={currentSection === 0}
        >
          <ArrowLeft className="w-5 h-5" /> Previous
        </button>

        {currentSection < totalSections - 1 ? (
          <button
            className="primary-button flex-1 flex items-center justify-center gap-2"
            disabled={!isSectionComplete}
            onClick={() => { setCurrentSection(s => s + 1); window.scrollTo(0, 0); }}
          >
            Next Step <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            className="primary-button flex-1 bg-pink-600 hover:bg-pink-700 flex items-center justify-center gap-2"
            disabled={!isAllComplete}
            onClick={() => onComplete(responses)}
          >
            See My Results <Sparkles className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

const Results = ({ studentData, reportId }) => {
  const [scores, setScores] = useState(null);
  const [dominant, setDominant] = useState('');

  useEffect(() => {
    if (studentData?.scores && typeof studentData.scores === 'object') {
      setScores(studentData.scores);
      setDominant(studentData.dominant_trait || 'General');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#fef3c7', '#ffffff']
      });
    }
  }, [studentData]);

  const downloadPDF = () => {
    window.open(`${API_BASE}/api/report/${reportId}`, '_blank');
  };

  if (!scores) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-2xl font-bold text-gray-800">Calculating your future...</h2>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto w-full px-4 space-y-6 pb-20"
    >
      <div className="card-white text-center max-w-none">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-yellow-100 rounded-full">
            <Sparkles className="w-10 h-10 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800">Mission Accomplished, {studentData.name}!</h1>
        <p className="text-gray-500 mt-2">Here's a map of your superpowers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-white max-w-none">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <BarChart3 className="w-6 h-6 text-pink-500" /> Your Trait Profile
          </h3>
          <div className="space-y-5">
            {Object.entries(scores).map(([trait, score], i) => (
              <div key={trait}>
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-gray-700">{trait}</span>
                  <span className="text-pink-600 font-bold">{score.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full bg-pink-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-white max-w-none flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Perfect Pathway</h3>
            <div className="bg-pink-50 p-8 rounded-3xl border-2 border-dashed border-pink-200 text-center">
              <div className="bg-white w-20 h-20 rounded-2xl shadow-md mx-auto mb-6 flex items-center justify-center">
                <Rocket className="w-10 h-10 text-pink-500" />
              </div>
              <h2 className="text-2xl font-black text-pink-600 uppercase mb-4">{dominant}</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                You're a natural-born <strong>{dominant}</strong>! This means you'll thrive in streams that let you explore your passions.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
            <p className="text-xs text-yellow-700 font-black uppercase mb-1 tracking-wider">💡 Expert Suggestion</p>
            <p className="text-sm text-yellow-800 font-medium">Based on your RIASEC profile, you'd be amazing in <strong className="text-pink-600">Science</strong> or <strong className="text-pink-600">Pure Arts</strong> courses!</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={downloadPDF}
          className="primary-button flex-1 flex items-center justify-center gap-2 py-4"
        >
          <Download className="w-5 h-5" /> Download My Report
        </button>
        <button
          onClick={() => window.print()}
          className="primary-button flex-1 bg-white text-gray-500 border-2 border-gray-100 shadow-none hover:bg-gray-50 flex items-center justify-center gap-2 py-4"
        >
          <Printer className="w-5 h-5" /> Print Result
        </button>
      </div>
    </motion.div>
  );
};

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/admin/login`, { password });
      onLogin();
    } catch (err) {
      setError('Invalid password. cosmic access denied! 🌌');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-white max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl mb-4">
          <Lock className="text-purple-500 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Admin Portal</h2>
        <p className="text-gray-500 mt-2">Enter secret code to access headquarters</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text">Password</label>
          <input
            type="password"
            required
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm font-bold animate-shake">{error}</p>}
        <button type="submit" className="primary-button bg-purple-600 hover:bg-purple-700 mt-6 flex items-center justify-center gap-2">
          Beam Me In <Rocket className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/students`);
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    window.open(`${API_BASE}/api/admin/export-csv`, '_blank');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-purple-600 font-bold">Scanning student database...</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto w-full px-4 space-y-6 pb-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-purple-50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="text-purple-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          </div>
          <p className="text-gray-500">Managing {students.length} future leaders</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadCSV}
            className="primary-button bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-5 h-5" /> Export CSV
          </button>
          <button
            onClick={onLogout}
            className="primary-button bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-none border-2 border-gray-200 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      <div className="card-white max-w-none overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">School/District</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Mobile</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Trait</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-400 font-medium">{student.board} Board</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-600">{student.school}</p>
                    <p className="text-xs text-gray-400">{student.district}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono text-gray-600">{student.mobile}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {student.trait_dominance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => window.open(`${API_BASE}/api/report/${student.id}`, '_blank')}
                      className="text-purple-600 hover:text-purple-700 font-bold text-sm flex items-center gap-1"
                    >
                      Report <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

function App() {
  const [step, setStep] = useState(0);
  const [studentData, setStudentData] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStart = (data) => {
    setStudentData(data);
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleComplete = async (responses) => {
    setLoading(true);
    try {
      const payload = {
        student_info: studentData,
        responses: responses
      };

      const res = await axios.post(`${API_BASE}/api/submit`, payload);
      setStudentData({ ...studentData, scores: res.data.scores, dominant_trait: res.data.dominant_trait });
      setReportId(res.data.id);
      setStep(2);
    } catch (err) {
      console.error("Submission failed", err);
      alert("Oops! Our cosmic connection failed. Please try again.");
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="app-container">
      <header className="py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
            <Rocket className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter">SOPHIA <span className="text-pink-500">ACADEMY</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest -mt-1">Future Guidance Hub</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40"
            >
              <div className="w-20 h-20 border-6 border-pink-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-2xl font-black text-pink-600 animate-pulse">CREATING MAGIC...</p>
            </motion.div>
          ) : (
            <>
              {step === 0 && (
                <RegistrationForm key="reg" onNext={handleStart} />
              )}
              {step === 1 && (
                <Questionnaire key="ques" studentName={studentData?.name} onComplete={handleComplete} />
              )}
              {step === 2 && (
                <Results key="res" studentData={studentData} reportId={reportId} />
              )}
              {step === 3 && (
                <AdminLogin key="admin-login" onLogin={() => setStep(4)} />
              )}
              {step === 4 && (
                <AdminDashboard key="admin-dash" onLogout={() => setStep(0)} />
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-10 text-center space-y-4">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">© 2026 Sophia Academy • Made with ❤️ for Students</p>
        <div>
          <button
            onClick={() => setStep(3)}
            className="text-[10px] text-gray-300 hover:text-purple-400 font-black uppercase tracking-[0.2em] transition-colors"
          >
            • Admin Portal •
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;

