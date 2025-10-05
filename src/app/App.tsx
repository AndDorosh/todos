import useAuthStore from '@/stores/useAuthStore';
import { useEffect } from 'react';
import AppRouter from './router';

const App = () => {
    const restore = useAuthStore((state) => state.actions.restore);

    useEffect(() => {
        restore();
    }, [restore]);

    return <AppRouter />;
};

export default App;
