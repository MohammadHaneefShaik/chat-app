import { useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const SearchInput = () => {
    const [search, setSearch] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!search) return;
        if (search.length < 3) {
            return toast.error('Search term must be at least 3 characters long');
        }
        toast('Search feature coming soon', { icon: 'ℹ️' });
    };

    return (
        <form onSubmit={handleSubmit} className='flex items-center w-full'>
            <div className='relative w-full'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <Search size={18} className='text-chat-textMuted' />
                </div>
                <input
                    type='text'
                    placeholder='Search...'
                    className='w-full bg-chat-inputBg text-chat-textMain rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-chat-accent transition-all text-sm shadow-inner'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </form>
    );
};

export default SearchInput;
