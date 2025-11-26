import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
  thumbnailUrl,
  tags,
  description,
  onLearnMore,
}: PersonaCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full h-[400px] perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsFlipped(false);
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-xl">
          <div className="relative w-full h-full">
            {/* Video/Image background */}
            {videoUrl && !thumbnailUrl ? (
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src={videoUrl}
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              <img
                className="absolute inset-0 w-full h-full object-cover"
                src={thumbnailUrl || videoUrl}
                alt={name}
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
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

              {/* Hover message */}
              <motion.div
                className="flex items-center gap-2 text-white font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary/90 to-primary-dark"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="relative w-full h-full p-8 flex flex-col justify-center items-center text-center">
            <h3 className="text-3xl font-bold text-white mb-2">{name}</h3>
            <p className="text-xl text-white/80 mb-6">{role}</p>
            <p className="text-white/90 text-lg leading-relaxed mb-8">
              {description}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLearnMore?.();
              }}
              className="px-8 py-3 bg-white text-primary rounded-full font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 group"
            >
              <span>Watch Full Video</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
