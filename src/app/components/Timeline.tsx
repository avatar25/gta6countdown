import React from 'react';

const events = [
    {
        date: 'February 4, 2022',
        title: 'Initial Confirmation',
        description: 'Rockstar Games officially confirmed that development for the next entry in the Grand Theft Auto series was "well underway."',
        source: 'https://www.rockstargames.com/newswire/article/ak73k92o47ko75/grand-theft-auto-community-update',
        sourceLabel: 'Rockstar Newswire',
    },
    {
        date: 'December 4, 2023',
        title: 'The Announcement (Trailer 1)',
        description: 'Rockstar released Trailer 1 ahead of schedule after it leaked online, officially revealing Lucia, Vice City and an initial 2025 release window.',
        source: 'https://www.youtube.com/watch?v=QdBZY2fkU-0',
        sourceLabel: 'Watch Trailer 1',
    },
    {
        date: 'May 2, 2025',
        title: 'First Major Delay',
        description: 'Rockstar moved the game from its 2025 window to May 26, 2026, saying the additional time was needed to deliver the expected level of quality.',
        source: 'https://www.rockstargames.com/newswire/article/258aa538o412ok/grand-theft-auto-vi-is-now-coming-may-26-2026',
        sourceLabel: 'Rockstar announcement',
    },
    {
        date: 'May 6, 2025',
        title: 'Trailer 2 & Leonida Expanded',
        description: 'Trailer 2 put Jason and Lucia at the center of the story, while Rockstar revealed more of Leonida, its characters and locations. The footage was captured in-game on PlayStation 5.',
        source: 'https://www.rockstargames.com/VI',
        sourceLabel: 'Official GTA VI site',
    },
    {
        date: 'November 6, 2025',
        title: 'Second Delay',
        description: 'Rockstar shifted the launch by almost six months, setting the current release date of November 19, 2026 for PlayStation 5 and Xbox Series X|S.',
        source: 'https://www.rockstargames.com/VI',
        sourceLabel: 'Official GTA VI site',
    },
    {
        date: 'June 25, 2026',
        title: 'Pre-Orders Open',
        description: 'Rockstar opened the official pre-order phase, revealed the Ultimate Edition and detailed the Vintage Vice City Pack pre-order bonus as the November launch campaign accelerates.',
        source: 'https://www.rockstargames.com/newswire/article/5171972o3ak5oa/pre-order-grand-theft-auto-vi-on-june-25',
        sourceLabel: 'Rockstar Newswire',
    },
    {
        date: 'August 6, 2026',
        title: 'An Extended Look Announced',
        description: 'Rockstar announced Grand Theft Auto VI: An Extended Look for August 27. It premieres on Netflix at 3 p.m. ET, followed by the official Rockstar Games YouTube channel and GTA VI site at 9 p.m. ET.',
        source: 'https://www.netflix.com/GTAVI',
        sourceLabel: 'Official premiere page',
        latest: true,
    },
];

const Timeline = () => {
    return (
        <div className="w-full max-w-4xl mx-auto mt-16 p-6 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            <div className="mb-10 text-center">
                <p className="mb-3 text-xs font-mono uppercase tracking-[0.28em] text-yellow-300">
                    Verified August 16, 2026
                </p>
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest drop-shadow-lg">
                    Development Timeline
                </h2>
            </div>
            <div className="relative border-l-4 border-yellow-500 ml-4 md:ml-10">
                {events.map((event, index) => (
                    <div key={index} className="mb-10 ml-8 relative">
                        <div
                            className={`absolute -left-[45px] w-6 h-6 rounded-full border-4 border-black ${
                                event.latest ? 'bg-white shadow-[0_0_22px_#facc15] animate-pulse' : 'bg-yellow-400'
                            }`}
                        />
                        <article
                            className={`p-6 rounded-lg border shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                                event.latest
                                    ? 'bg-yellow-400/15 border-yellow-300/70 hover:bg-yellow-400/20'
                                    : 'bg-white/10 border-white/10 hover:bg-white/20'
                            }`}
                        >
                            <div className="mb-2 flex flex-wrap items-center gap-3">
                                <span className="block text-sm text-yellow-300 font-mono uppercase tracking-wider">
                                    {event.date}
                                </span>
                                {event.latest && (
                                    <span className="rounded-full bg-yellow-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-black">
                                        Latest official update
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                            <p className="text-gray-200 leading-relaxed">
                                {event.description}
                            </p>
                            <a
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-yellow-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300"
                                href={event.source}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {event.sourceLabel}
                                <span aria-hidden="true">↗</span>
                            </a>
                        </article>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
