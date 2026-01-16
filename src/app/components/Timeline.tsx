import React from 'react';

const events = [
    {
        date: 'February 4, 2022',
        title: 'Initial Confirmation',
        description: 'Rockstar Games officially confirmed that development for the next entry in the Grand Theft Auto series was "well underway."',
    },
    {
        date: 'December 4, 2023',
        title: 'The Announcement (Trailer 1)',
        description: 'After a low-quality leak forced their hand, Rockstar released the first official trailer early. This confirmed the Vice City setting and a 2025 release window.',
    },
    {
        date: 'May 2, 2025',
        title: 'First Major Delay',
        description: 'During a financial update, the release window was pushed from late 2025 to May 26, 2026, to allow for additional "polishing."',
    },
    {
        date: 'November 6, 2025',
        title: 'Second Delay (Current Date)',
        description: 'Rockstar announced another shift, moving the launch to its current target: November 19, 2026.',
    },
];

const Timeline = () => {
    return (
        <div className="w-full max-w-4xl mx-auto mt-16 p-6 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl font-bold text-center text-white mb-10 uppercase tracking-widest drop-shadow-lg">
                Development Timeline
            </h2>
            <div className="relative border-l-4 border-yellow-500 ml-4 md:ml-10">
                {events.map((event, index) => (
                    <div key={index} className="mb-10 ml-8 relative">
                        <div className="absolute -left-[45px] w-6 h-6 bg-yellow-400 rounded-full border-4 border-black" />
                        <div className="p-6 bg-white/10 rounded-lg border border-white/10 shadow-lg hover:bg-white/20 transition-all duration-300">
                            <span className="block text-sm text-yellow-300 font-mono mb-1 uppercase tracking-wider">
                                {event.date}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                            <p className="text-gray-200 leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
