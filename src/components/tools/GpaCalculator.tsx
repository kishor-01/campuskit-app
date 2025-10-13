// /src/components/tools/GpaCalculator.tsx
'use client'

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

// --- Types and Constants ---
type Course = {
  id: number;
  credits: string;
  grade: string;
};

// NEW: Type for a semester
type Semester = {
  id: number;
  sgpa: string;
  credits: string;
};

const GRADE_POINTS: { [key: string]: number } = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0,
};

const gradeOptions = Object.keys(GRADE_POINTS);

let nextId = 1;

// --- Main Component ---
export default function GpaCalculator() {
  const [activeTab, setActiveTab] = useState<'SGPA' | 'CGPA'>('SGPA');
  
  // --- SGPA State & Handlers ---
  const [courses, setCourses] = useState<Course[]>([
    { id: 0, credits: '', grade: 'O' },
  ]);

  const handleAddCourse = () => {
    setCourses([...courses, { id: nextId++, credits: '', grade: 'O' }]);
  };
  const handleRemoveCourse = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id));
  };
  const handleCourseChange = (id: number, field: 'credits' | 'grade', value: string) => {
    setCourses(courses.map((course) => course.id === id ? { ...course, [field]: value } : course));
  };

  // --- NEW: CGPA State & Handlers ---
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: 0, sgpa: '', credits: '' },
  ]);

  const handleAddSemester = () => {
    setSemesters([...semesters, { id: nextId++, sgpa: '', credits: '' }]);
  };
  const handleRemoveSemester = (id: number) => {
    setSemesters(semesters.filter((semester) => semester.id !== id));
  };
  const handleSemesterChange = (id: number, field: 'sgpa' | 'credits', value: string) => {
    setSemesters(semesters.map((semester) => semester.id === id ? { ...semester, [field]: value } : semester));
  };

  // --- Calculations ---
  const sgpa = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach(course => {
      const credits = parseFloat(course.credits);
      const gradePoint = GRADE_POINTS[course.grade];
      if (!isNaN(credits) && credits > 0 && gradePoint !== undefined) {
        totalPoints += credits * gradePoint;
        totalCredits += credits;
      }
    });
    if (totalCredits === 0) return '0.00';
    return (totalPoints / totalCredits).toFixed(2);
  }, [courses]);
  
  // NEW: CGPA Calculation
  const cgpa = useMemo(() => {
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    semesters.forEach(sem => {
        const sgpa = parseFloat(sem.sgpa);
        const credits = parseFloat(sem.credits);
        if(!isNaN(sgpa) && !isNaN(credits) && credits > 0) {
            totalWeightedPoints += sgpa * credits;
            totalCredits += credits;
        }
    });
    if(totalCredits === 0) return '0.00';
    return (totalWeightedPoints / totalCredits).toFixed(2);
  }, [semesters]);


  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex justify-center bg-muted/50 p-1 rounded-lg mb-8">
        <button onClick={() => setActiveTab('SGPA')} className={`px-8 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'SGPA' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          SGPA Calculator
        </button>
        <button onClick={() => setActiveTab('CGPA')} className={`px-8 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'CGPA' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          CGPA Calculator
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Inputs */}
        <div className="md:col-span-2 bg-muted/50 p-6 rounded-lg">
          {activeTab === 'SGPA' ? (
            <div>
              <h2 className="font-bold text-xl mb-4">Enter Your Subjects</h2>
              <div className="grid grid-cols-[1fr,1fr,auto] gap-3 text-sm font-medium text-muted-foreground mb-2 px-2">
                <span>Credits</span><span>Grade</span><span/>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {courses.map((course) => (
                    <motion.div key={course.id} layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} className="grid grid-cols-[1fr,1fr,auto] gap-3 items-center">
                      <input type="number" placeholder="e.g. 4" value={course.credits} onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)} className="p-2 w-full bg-input rounded-md"/>
                      <select value={course.grade} onChange={(e) => handleCourseChange(course.id, 'grade', e.target.value)} className="p-2 w-full bg-input rounded-md">
                        {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <button onClick={() => handleRemoveCourse(course.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <button onClick={handleAddCourse} className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary"><Plus size={16} /> Add Course</button>
            </div>
          ) : (
            // NEW: CGPA Calculator UI
            <div>
              <h2 className="font-bold text-xl mb-4">Enter Your Semesters</h2>
              <div className="grid grid-cols-[1fr,1fr,auto] gap-3 text-sm font-medium text-muted-foreground mb-2 px-2">
                <span>Semester GPA</span><span>Total Credits</span><span/>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {semesters.map((semester) => (
                    <motion.div key={semester.id} layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} className="grid grid-cols-[1fr,1fr,auto] gap-3 items-center">
                      <input type="number" placeholder="e.g. 8.75" value={semester.sgpa} onChange={(e) => handleSemesterChange(semester.id, 'sgpa', e.target.value)} className="p-2 w-full bg-input rounded-md"/>
                      <input type="number" placeholder="e.g. 24" value={semester.credits} onChange={(e) => handleSemesterChange(semester.id, 'credits', e.target.value)} className="p-2 w-full bg-input rounded-md"/>
                      <button onClick={() => handleRemoveSemester(semester.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <button onClick={handleAddSemester} className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary"><Plus size={16} /> Add Semester</button>
            </div>
          )}
        </div>
        
        {/* UPDATED: Dynamic Results Panel */}
        <div className="bg-muted/50 p-6 rounded-lg text-center flex flex-col justify-center">
            <p className="text-muted-foreground font-medium">Your {activeTab}</p>
            <motion.p key={activeTab === 'SGPA' ? sgpa : cgpa} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-bold text-primary my-2">
              {activeTab === 'SGPA' ? sgpa : cgpa}
            </motion.p>
        </div>
      </div>
    </div>
  );
}