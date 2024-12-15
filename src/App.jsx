import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AddEmployee from './components/AddEmployee'
import ViewEmployees from './components/ViewEmployees'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={
              <div className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Welcome to</span>
                    <span className="block text-indigo-600">Employee Scheduler</span>
                  </h1>
                  <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Streamline your workforce management with our intuitive scheduling system.
                  </p>
                  <div className="mt-10 flex justify-center gap-x-6">
                    <a href="/add" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      Add Employee
                    </a>
                    <a href="/view" className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      View Schedule
                    </a>
                  </div>
                </div>

                {/* Feature Section */}
                <div className="mt-32">
                  <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
                    {/* Feature 1 */}
                    <div className="text-center md:flex md:items-start md:text-left lg:block lg:text-center">
                      <div className="md:flex-shrink-0 flex justify-center">
                        <div className="h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
                          <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                        <h3 className="text-base font-medium text-gray-900">Easy Scheduling</h3>
                        <p className="mt-3 text-sm text-gray-500">
                          Quickly add and manage employee schedules with our intuitive interface.
                        </p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="text-center md:flex md:items-start md:text-left lg:block lg:text-center">
                      <div className="md:flex-shrink-0 flex justify-center">
                        <div className="h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
                          <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                        <h3 className="text-base font-medium text-gray-900">Smart Organization</h3>
                        <p className="mt-3 text-sm text-gray-500">
                          Keep track of all employee schedules in one organized dashboard.
                        </p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="text-center md:flex md:items-start md:text-left lg:block lg:text-center">
                      <div className="md:flex-shrink-0 flex justify-center">
                        <div className="h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100">
                          <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                        <h3 className="text-base font-medium text-gray-900">Quick Actions</h3>
                        <p className="mt-3 text-sm text-gray-500">
                          Perform schedule updates and changes with just a few clicks.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/add" element={<AddEmployee />} />
            <Route path="/view" element={<ViewEmployees />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
