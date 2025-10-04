import useAuthStore from '@/stores/useAuthStore';
import { useEffect } from 'react';

const App = () => {
    const restore = useAuthStore((state) => state.actions.restore);

    useEffect(() => {
        restore();
    }, [restore]);

    return <div></div>;
};

export default App;
