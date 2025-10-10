// src/pages/Board/index.tsx
import Column from '@/components/board/Column';
import { Container } from '@/shared/ui';
import useBoardStore from '@/stores/useBoardStore';
import Navbar from '@/widgets/Navbar';
import React, { useEffect } from 'react';

const BoardPage: React.FC = () => {
    const columns = useBoardStore((s) => s.columns);
    const fetchBoard = useBoardStore((s) => s.actions.fetchBoard);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Navbar />

            <Container>
                <div className="flex w-full justify-between gap-6 py-8">
                    {columns.map((col) => (
                        <Column key={col.id} column={col} />
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default BoardPage;
