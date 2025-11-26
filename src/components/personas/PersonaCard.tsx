import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tag {
  icon: string;
  label: string;
}

interface PersonaCardProps {
  name: string;
  role: string;
  videoUrl: string;
  thumbnailUrl?: string;
  tags: Tag[];
  description: string;
  onLearnMore?: () => void;
}

export const PersonaCard = ({
  name,
  role,
  videoUrl,
  tags,
  description,
}: PersonaCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleCardClick = () => {
    // Only flip if video is not playing
    if (!isPlaying) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className="relative w-full h-[500px] perspective-1000 cursor-pointer"
      onClick={handleCardClick}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Front of card - Video */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative w-full h-full">
            {/* Video background */}
            {videoUrl ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                src={videoUrl}
                muted={isMuted}
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Video Controls - Top Right */}
            <div className="absolute top-6 right-6 flex gap-2 z-10">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30"
                onClick={handleMuteToggle}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </Button>
            </div>

            {/* Content - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <motion.h3
                className="text-3xl font-bold text-white mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {name}
              </motion.h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <motion.div
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium flex items-center gap-1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Play/Pause Button */}
              <Button
                size="lg"
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause Video
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Play Video
                  </>
                )}
              </Button>

              {!isPlaying && (
                <p className="text-xs text-white/60 text-center mt-3 animate-pulse">
                  Click to learn more
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Back of card - Getting Started / Engagement */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary via-primary-dark to-accent"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="relative w-full h-full p-8 flex flex-col justify-between text-white">
            <div>
              <h3 className="text-3xl font-bold mb-2">{name}</h3>
              <p className="text-lg text-white/80 mb-6">{role}</p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold mb-3">Getting Started</h4>
                <p className="text-white/90 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Engagement Hook - Spin Wheel */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                  <h5 className="text-xl font-bold">Welcome Bonus!</h5>
                </div>
                <p className="text-sm text-white/90 mb-4">
                  Spin the wheel to win free credits and get started with{" "}
                  {name.split(" ")[0]}'s tools!
                </p>
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90 font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Integrate with spin wheel
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Spin the Wheel
                </Button>
              </div>
            </div>

            <p className="text-xs text-white/60 text-center animate-pulse">
              Click to flip back
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
