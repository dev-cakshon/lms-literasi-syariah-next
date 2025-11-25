import React from "react";

interface YoutubePlayerProps {
    videoUrl: string;
    title?: string;
    className?: string;
}

// Accepts full YouTube URL or just the video ID
function getYoutubeId(url: string): string | null {
    // Regex for various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) return match[1];
    // If only video ID is provided
    if (/^[\w-]{11}$/.test(url)) return url;
    return null;
}

export const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ videoUrl, title, className }) => {
    const videoId = getYoutubeId(videoUrl);
    if (!videoId) return <div className="text-red-500">Invalid YouTube URL</div>;
    return (
        <div className={className}>
            <iframe
                width="70%"
                height="400"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title || "YouTube video player"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};
