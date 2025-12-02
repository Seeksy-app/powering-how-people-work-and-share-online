import { motion } from "framer-motion";
import { Star } from "lucide-react";
import testimonial1 from "@/assets/homepage/testimonial-1.jpg";
import testimonial2 from "@/assets/homepage/testimonial-2.jpg";
import testimonial3 from "@/assets/homepage/testimonial-3.jpg";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Podcast Host",
    image: testimonial1,
    quote: "Seeksy transformed how I manage my show and helped me land my first brand deal.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "YouTube Creator",
    image: testimonial2,
    quote: "The analytics dashboard alone is worth it. I finally understand my audience.",
    rating: 5,
  },
  {
    name: "Isabella Rodriguez",
    role: "Lifestyle Influencer",
    image: testimonial3,
    quote: "Booking guests used to take hours. Now it takes minutes. Game changer!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Loved by Creators
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of creators who trust Seeksy to grow their brand
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-brand-gold text-brand-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
