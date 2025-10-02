import { Route, Routes } from 'react-router-dom';

function App() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-green-900 dark:text-gray-100">
            <Routes>
                <Route
                    path="/"
                    element={<h1 className="text-3xl font-bold p-4">Kanban Board</h1>}
                />
            </Routes>
        </div>
    );
}

export default App;
