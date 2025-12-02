import { motion } from "framer-motion";

const metrics = [
  { value: "10K+", label: "Active Creators" },
  { value: "50K+", label: "Episodes Recorded" },
  { value: "1M+", label: "Hours Streamed" },
  { value: "98%", label: "Satisfaction" },
];

export function TrustMetrics() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-black text-foreground mb-2">
                {metric.value}
              </p>
              <p className="text-muted-foreground font-medium">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
