import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuthUser } = useAuthContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { username, password });
            localStorage.setItem('chat-user', JSON.stringify(res.data));
            setAuthUser(res.data);
            toast.success('Logged in successfully!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex w-full h-screen bg-chat-bg'>
            {/* Left Side: Branding & Logo */}
            <div className='hidden md:flex flex-col items-center justify-center w-1/2 bg-chat-panel border-r border-chat-border'>
                <div className='w-48 h-48 rounded-3xl overflow-hidden shadow-2xl mb-8'>
                    <img src="/logo.png" alt="Chit Chatt Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className='text-5xl font-bold text-white tracking-widest mb-4'>CHIT CHATT</h1>
                <p className='text-chat-textMuted text-lg'>Connect seamlessly with your world.</p>
            </div>

            {/* Right Side: Form */}
            <div className='flex flex-col items-center justify-center w-full md:w-1/2 p-8'>
                <div className='w-full max-w-md flex flex-col'>
                    <div className='md:hidden flex flex-col items-center mb-6'>
                        <div className='w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-4'>
                            <img src="/logo.png" alt="Chit Chatt Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className='text-3xl font-bold text-white tracking-wide'>Chit Chatt</h1>
                    </div>

                    <div className='text-center mb-8'>
                        <h2 className='text-3xl font-bold text-chat-textMain mb-2'>Welcome Back</h2>
                        <p className='text-chat-textMuted text-sm'>Sign in to continue your conversations.</p>
                    </div>

                    <form onSubmit={handleSubmit} className='w-full'>
                        <div className='mb-6'>
                            <input
                                type='text'
                                placeholder='Username'
                                className='w-full bg-chat-panel rounded-xl py-3.5 px-4 text-chat-textMain focus:outline-none focus:ring-2 focus:ring-chat-accent transition-all placeholder-chat-textMuted/70'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className='mb-8'>
                            <input
                                type='password'
                                placeholder='Password'
                                className='w-full bg-chat-panel rounded-xl py-3.5 px-4 text-chat-textMain focus:outline-none focus:ring-2 focus:ring-chat-accent transition-all placeholder-chat-textMuted/70'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        
                        <button className='w-full bg-chat-accent text-white rounded-xl py-3.5 hover:bg-chat-accentHover transition-colors font-semibold text-lg flex items-center justify-center gap-2' disabled={loading}>
                            {loading ? <span className='loading loading-spinner'></span> : 'Log In'}
                            {!loading && <span>&rarr;</span>}
                        </button>

                        <div className='text-center mt-8'>
                            <span className='text-sm text-chat-textMuted'>Don't have an account? </span>
                            <Link to='/register' className='text-sm text-chat-accent hover:text-white transition-all'>
                                Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
