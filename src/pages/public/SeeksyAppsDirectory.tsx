import { SEEKSY_MODULES, MODULE_CATEGORIES } from "@/components/modules/moduleData";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";

const SeeksyAppsDirectory = () => {
  const navigate = useNavigate();

  // Group modules by category
  const grouped = MODULE_CATEGORIES.map((cat) => ({
    ...cat,
    modules: SEEKSY_MODULES.filter((m) => m.category === cat.id),
  })).filter((g) => g.modules.length > 0);

  // Also grab any modules with categories not in MODULE_CATEGORIES
  const knownCatIds = new Set(MODULE_CATEGORIES.map((c) => c.id));
  const uncategorized = SEEKSY_MODULES.filter((m) => !knownCatIds.has(m.category));
  if (uncategorized.length > 0) {
    grouped.push({ id: "other", name: "Other", modules: uncategorized });
  }

  return (
    <>
      <Helmet>
        <title>Seeksy Apps Directory — All Tools & Modules</title>
        <meta name="description" content="Explore the full directory of Seeksy apps — creator tools, podcasting, marketing, CRM, AI automation, analytics, and more." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/seeksy-logo.png" alt="Seeksy" className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tight text-foreground">Apps Directory</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Everything You Need.<br className="hidden sm:block" /> One Platform.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {SEEKSY_MODULES.length} modular apps spanning creator tools, marketing, CRM, AI, and more — mix and match to build your perfect workflow.
          </p>
        </section>

        {/* Categories */}
        <main className="max-w-6xl mx-auto px-6 pb-24 space-y-16">
          {grouped.map((group) => (
            <section key={group.id}>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
                {(group as any).isNew && (
                  <Badge variant="secondary" className="text-xs">New</Badge>
                )}
                <span className="text-sm text-muted-foreground ml-1">
                  ({group.modules.length} app{group.modules.length !== 1 ? "s" : ""})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className="group relative rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`shrink-0 rounded-lg p-2.5 ${mod.iconBg || "bg-muted"}`}>
                          <Icon className={`h-5 w-5 ${mod.iconColor || "text-foreground"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground text-sm leading-tight">
                              {mod.name}
                            </h3>
                            {mod.isNew && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                <Sparkles className="h-2.5 w-2.5 mr-0.5" /> New
                              </Badge>
                            )}
                            {mod.isAIPowered && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                                <Zap className="h-2.5 w-2.5 mr-0.5" /> AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Seeksy. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default SeeksyAppsDirectory;
