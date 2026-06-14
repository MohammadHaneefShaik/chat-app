import Sidebar from '../components/Sidebar';
import MessageContainer from '../components/MessageContainer';

const Home = () => {
    return (
        <div className='flex h-[100dvh] w-full bg-chat-bg'>
            <div className='flex w-full h-full md:p-6 lg:p-8 justify-center'>
                <div className='flex w-full max-w-6xl h-full md:h-[90vh] md:rounded-3xl overflow-hidden bg-chat-bg md:shadow-2xl md:border border-chat-border/50'>
                    <Sidebar />
                    <MessageContainer />
                </div>
            </div>
        </div>
    );
};

export default Home;
