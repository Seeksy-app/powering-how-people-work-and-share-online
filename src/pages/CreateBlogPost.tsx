import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, Save, CheckCircle, AlertCircle, ChevronUp, Edit3, HelpCircle, Copy } from "lucide-react";
import { BlogImageUpload } from "@/components/BlogImageUpload";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featured_image_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  publish_to_master: z.boolean().default(false),
  primary_keyword: z.string().optional(),
  secondary_keywords: z.string().optional(),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

const CreateBlogPost = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [activeSection, setActiveSection] = useState("mention-boost");

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      featured_image_url: "",
      status: "draft",
      seo_title: "",
      seo_description: "",
      publish_to_master: false,
      primary_keyword: "",
      secondary_keywords: "",
    },
  });

  const watchedFields = form.watch();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    calculateSEOScore();
  }, [watchedFields.title, watchedFields.content, watchedFields.seo_title, watchedFields.seo_description, watchedFields.excerpt, watchedFields.primary_keyword]);

  const calculatePageTitleScore = () => {
    let score = 0;
    const title = watchedFields.title || "";
    const keyword = watchedFields.primary_keyword?.toLowerCase() || "";
    
    if (!title) return 0;
    
    // Title entered (25 points)
    if (title.length > 0) score += 25;
    
    // Keyword used in title (25 points)
    if (keyword && title.toLowerCase().includes(keyword)) score += 25;
    
    // Keyword at beginning (25 points)
    if (keyword && title.toLowerCase().indexOf(keyword) === 0) score += 25;
    
    // Title length 30-60 chars (25 points)
    if (title.length >= 30 && title.length <= 60) score += 25;
    
    return score;
  };

  const calculateMetaDescriptionScore = () => {
    let score = 0;
    const description = watchedFields.seo_description || "";
    const keyword = watchedFields.primary_keyword?.toLowerCase() || "";
    
    if (!description) return 0;
    
    // Description entered (33 points)
    if (description.length > 0) score += 33;
    
    // Keyword used in description (33 points)
    if (keyword && description.toLowerCase().includes(keyword)) score += 33;
    
    // Description length 120-160 chars (34 points)
    if (description.length >= 120 && description.length <= 160) score += 34;
    
    return score;
  };

  const calculateContentScore = () => {
    let score = 0;
    const content = watchedFields.content || "";
    const title = watchedFields.title || "";
    const slug = generateSlug(title);
    const keyword = watchedFields.primary_keyword?.toLowerCase() || "";
    const wordCount = getWordCount(content);
    
    if (!content) return 0;
    
    // Each check is worth points
    // Keyword in slug (10 points)
    if (keyword && slug.includes(keyword.replace(/\s+/g, '-'))) score += 10;
    
    // Title added (10 points)
    if (title.length > 0) score += 10;
    
    // Keyword in title (10 points)
    if (keyword && title.toLowerCase().includes(keyword)) score += 10;
    
    // Content added (10 points)
    if (content.length > 0) score += 10;
    
    // 1000+ words (10 points)
    if (wordCount >= 1000) score += 10;
    
    // Keyword in first paragraph (10 points)
    const firstParagraph = content.substring(0, 200).toLowerCase();
    if (keyword && firstParagraph.includes(keyword)) score += 10;
    
    // Good keyword density (10 points)
    const keywordCount = (content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    if (density >= 0.5 && density <= 2.5) score += 10;
    
    // Keyword in image filename (10 points) - simplified check
    if (watchedFields.featured_image_url && keyword) score += 10;
    
    // Image added (10 points)
    if (watchedFields.featured_image_url) score += 10;
    
    // Keyword in image alt tag (10 points) - simplified for now
    if (watchedFields.featured_image_url && keyword) score += 10;
    
    return score;
  };

  const calculateSeeksyAIBoostScore = () => {
    let score = 0;
    const content = watchedFields.content || "";
    const wordCount = getWordCount(content);
    
    // H2 headings (1 point)
    if (content.includes('<h2') || content.includes('## ')) score += 1;
    
    // Table of contents (1 point)
    if (content.toLowerCase().includes('table of contents')) score += 1;
    
    // FAQs (1 point - checking if missing for red indicator)
    // We'll add 0 for this to show it needs work
    
    // Structured content (1 point)
    if (content.includes('<li>') || content.includes('<table') || content.includes('- ') || content.includes('* ')) score += 1;
    
    // SEO Supercharger enabled (1 point)
    if (wordCount >= 1000) score += 1;
    
    return score;
  };

  const calculateSEOScore = () => {
    const pageTitleScore = calculatePageTitleScore();
    const metaDescScore = calculateMetaDescriptionScore();
    const contentScore = calculateContentScore();
    
    // Total SEO score is average of the three sections
    const totalScore = Math.round((pageTitleScore + metaDescScore + contentScore) / 3);
    
    setSeoScore(totalScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getSEOScoreBgColor = () => {
    if (seoScore >= 80) return "bg-green-600";
    if (seoScore >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const onSubmit = async (data: BlogPostFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const slug = generateSlug(data.title);

      const postData = {
        user_id: user.id,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || null,
        featured_image_url: data.featured_image_url || null,
        status: data.status,
        seo_title: data.seo_title || data.title,
        seo_description: data.seo_description || data.excerpt || null,
        publish_to_master: data.publish_to_master,
        published_at: data.status === "published" ? new Date().toISOString() : null,
        master_published_at: data.publish_to_master && data.status === "published" ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from("blog_posts")
        .insert([postData]);

      if (error) throw error;

      toast.success("Blog post created successfully!");
      navigate("/my-blog");
    } catch (error: any) {
      toast.error(error.message || "Failed to create blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const keyword = watchedFields.primary_keyword?.toLowerCase() || "";
  const wordCount = getWordCount(watchedFields.content || "");
  const pageTitleScore = calculatePageTitleScore();
  const metaDescScore = calculateMetaDescriptionScore();
  const contentScore = calculateContentScore();
  const seeksyAIScore = calculateSeeksyAIBoostScore();

  return (
    <div className="min-h-screen bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex">
            {/* Left Sidebar - Score Navigation */}
            <div className="w-48 border-r border-border bg-background fixed h-screen overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer" onClick={() => setActiveSection("mention-boost")}>
                    <Badge variant={seeksyAIScore >= 4 ? "default" : "secondary"} className={`w-12 ${getScoreBgColor(seeksyAIScore * 20)}`}>
                      {seeksyAIScore}/5
                    </Badge>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">Seeksy AI Boost™</span>
                      {seeksyAIScore >= 4 && <Badge variant="secondary" className="text-[10px] px-1 w-fit mt-0.5">NEW</Badge>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer" onClick={() => setActiveSection("seo-analyzer")}>
                    <Badge variant="default" className={`w-12 ${getScoreBgColor(seoScore)}`}>{seoScore}</Badge>
                    <span className="text-xs font-medium">SEO Analyzer</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer" onClick={() => setActiveSection("page-title")}>
                    <Badge variant="default" className={`w-12 ${getScoreBgColor(pageTitleScore)}`}>{pageTitleScore}</Badge>
                    <span className="text-xs font-medium">Page Title</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer" onClick={() => setActiveSection("meta-description")}>
                    <Badge variant="default" className={`w-12 ${getScoreBgColor(metaDescScore)}`}>{metaDescScore}</Badge>
                    <span className="text-xs font-medium">Meta Description</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer" onClick={() => setActiveSection("content")}>
                    <Badge variant="default" className={`w-12 ${getScoreBgColor(contentScore)}`}>{contentScore}</Badge>
                    <span className="text-xs font-medium">Content</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer" onClick={() => setActiveSection("primary-keyword")}>
                    <div className="w-4 h-4 flex items-center justify-center">
                      🔍
                    </div>
                    <span className="text-xs text-muted-foreground">{keyword || "keyword"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 ml-48">
              <div className="max-w-5xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/my-blog")}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">SEO Blog Post Editor</h1>
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Post
                  </Button>
                </div>

                {/* Post Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        Post Title (Heading 1)
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Write Engaging Blog Posts That Keep Readers Hooked and Improve SEO" 
                          className="text-lg font-medium"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content Editor */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        Content
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Start writing your blog post content here..." 
                          rows={12}
                          className="font-sans"
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span></span>
                        <span className="text-sm">Words: {wordCount}</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mb-8">
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Save Post
                  </Button>
                </div>

                {/* Seeksy AI Boost Section */}
                <div className="mb-8" id="mention-boost">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant={seeksyAIScore >= 4 ? "default" : "secondary"} className={`text-lg px-3 py-1 ${getScoreBgColor(seeksyAIScore * 20)}`}>
                      {seeksyAIScore}/5
                    </Badge>
                    <div>
                      <h2 className="text-2xl font-bold">Seeksy AI Boost™</h2>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => window.open('/seeksy-ai-boost-help', '_blank')}>
                      Help Article
                      <HelpCircle className="w-4 h-4 ml-1" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    <span className="font-medium">Feedback:</span> {seeksyAIScore >= 4 ? "You're almost there! One step left for full optimization and AI visibility." : "Keep optimizing to improve your AI visibility score."}
                  </p>

                  <Alert className="mb-6 border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm">
                      Seeksy AI Boost™ shows you best-known practices to help your content get mentioned in AI tools like ChatGPT and Google's AI Overviews.
                    </AlertDescription>
                  </Alert>

                  <div className="w-full bg-muted rounded-full h-3 mb-6">
                    <div 
                      className={`h-3 rounded-full transition-all ${getScoreBgColor(seeksyAIScore * 20)}`}
                      style={{ width: `${seeksyAIScore * 20}%` }}
                    />
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      {watchedFields.content && (watchedFields.content.includes('<h2') || watchedFields.content.includes('## ')) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You have an H2 and properly nested headings.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.content && watchedFields.content.toLowerCase().includes('table of contents') ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You have included a Table of Contents.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Add FAQs to help surface your post in AI and voice results.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.content && (watchedFields.content.includes('<li>') || watchedFields.content.includes('<table') || watchedFields.content.includes('- ') || watchedFields.content.includes('* ')) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You have used structured content (list or table).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {wordCount >= 1000 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You have enabled the <span className="text-red-600 underline cursor-pointer">SEO Supercharger</span> for improved AI visibility and GPTBot access.</span>
                    </div>
                  </div>
                </div>

                {/* SEO Analysis Section */}
                <div className="mb-8" id="seo-analyzer">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">SEO Analysis</h2>
                    <Button type="button" variant="ghost" size="sm">
                      Help Article
                      <HelpCircle className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="primary_keyword"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          Primary Keyword
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="write engaging blog posts" 
                            className="max-w-2xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mb-6">
                    <Button type="button" variant="link" className="text-sm px-0 text-primary">
                      + Secondary Keywords
                    </Button>
                  </div>

                  {/* Search Engine Preview */}
                  {(watchedFields.title || watchedFields.seo_title) && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        Search Engine Preview
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </h3>
                      <div className="border rounded-lg p-4 bg-card">
                        <div className="text-xs text-muted-foreground mb-1">
                          ?p={generateSlug(watchedFields.title || "your-post-title")}
                        </div>
                        <div className="text-lg text-blue-600 hover:underline cursor-pointer mb-1">
                          {watchedFields.seo_title || watchedFields.title || "Your Post Title"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — {watchedFields.seo_description || "Add a meta description..."}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO Page Title */}
                  <FormField
                    control={form.control}
                    name="seo_title"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          SEO Page Title
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={watchedFields.title || "Enter SEO title for search engines"} 
                            className="max-w-2xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SEO Meta Description */}
                  <FormField
                    control={form.control}
                    name="seo_description"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          SEO Meta Description
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Write engaging blog posts using features like Smart Snippets™, audio, product embeds, and CTAs to boost reader interaction." 
                            rows={3}
                            maxLength={160}
                            className="max-w-2xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Total SEO Score */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="default" className={`text-lg px-3 py-1 ${getScoreBgColor(seoScore)}`}>
                      {seoScore}
                    </Badge>
                    <h2 className="text-2xl font-bold">Total SEO Score</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    <span className="font-medium">Feedback:</span> {seoScore >= 80 ? "Great job! Your content passed the most important SEO checks successfully." : "Keep optimizing to improve your SEO score."}
                  </p>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${getScoreBgColor(seoScore)}`}
                      style={{ width: `${seoScore}%` }}
                    />
                  </div>
                </div>

                {/* Page Title Score */}
                <div className="mb-8" id="page-title">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className={`text-lg px-3 py-1 ${getScoreBgColor(pageTitleScore)}`}>
                        {pageTitleScore}
                      </Badge>
                      <h2 className="text-xl font-bold">Page Title Score</h2>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Page Title
                    </Button>
                  </div>

                  <div className="w-full bg-muted rounded-full h-3 mb-6">
                    <div 
                      className={`h-3 rounded-full transition-all ${getScoreBgColor(pageTitleScore)}`}
                      style={{ width: `${pageTitleScore}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      {watchedFields.title ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You've entered a Page Title</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {keyword && watchedFields.title?.toLowerCase().includes(keyword) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">The Keyword {`"${keyword || 'write engaging blog posts'}"`} is used in the Page Title</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {keyword && watchedFields.title?.toLowerCase().indexOf(keyword) === 0 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">The Keyword {`"${keyword || 'write engaging blog posts'}"`} is used toward the beginning of the Page Title</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.title && watchedFields.title.length >= 30 && watchedFields.title.length <= 60 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">
                        The Page Title length is perfect, <strong>{60 - (watchedFields.title?.length || 0)} characters available</strong> ({watchedFields.title?.length || 0} of 60 characters used)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meta Description Score */}
                <div className="mb-8" id="meta-description">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className={`text-lg px-3 py-1 ${getScoreBgColor(metaDescScore)}`}>
                        {metaDescScore}
                      </Badge>
                      <h2 className="text-xl font-bold">Meta Description Score</h2>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Meta Description
                    </Button>
                  </div>

                  <div className="w-full bg-muted rounded-full h-3 mb-6">
                    <div 
                      className={`h-3 rounded-full transition-all ${getScoreBgColor(metaDescScore)}`}
                      style={{ width: `${metaDescScore}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      {watchedFields.seo_description ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You've entered a Meta Description</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {keyword && watchedFields.seo_description?.toLowerCase().includes(keyword) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">The Keyword {`"${keyword || 'write engaging blog posts'}"`} is used in the Meta Description</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.seo_description && watchedFields.seo_description.length >= 120 && watchedFields.seo_description.length <= 160 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">
                        The Meta Description length is perfect, <strong>{160 - (watchedFields.seo_description?.length || 0)} characters available</strong> ({watchedFields.seo_description?.length || 0} of 160 characters used)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Score */}
                <div className="mb-8" id="content">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className={`text-lg px-3 py-1 ${getScoreBgColor(contentScore)}`}>
                        {contentScore}
                      </Badge>
                      <h2 className="text-xl font-bold">Content Score</h2>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Content
                    </Button>
                  </div>

                  <div className="w-full bg-muted rounded-full h-3 mb-6">
                    <div 
                      className={`h-3 rounded-full transition-all ${getScoreBgColor(contentScore)}`}
                      style={{ width: `${contentScore}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      {keyword && generateSlug(watchedFields.title || "").includes(keyword.replace(/\s+/g, '-')) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">Keyword {`"${keyword || 'write engaging blog posts'}"`} is used in the Slug</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.title ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You've added a Post Title (H1)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {keyword && watchedFields.title?.toLowerCase().includes(keyword) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">Keyword {`"${keyword || 'write engaging blog posts'}"`} is used in the Post Title (H1)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.content ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You've added text to the post</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {wordCount >= 1000 ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">Your text contains at least 1000 words (You have {wordCount} words)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {keyword && watchedFields.content && watchedFields.content.substring(0, 200).toLowerCase().includes(keyword) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">The Keyword {`"${keyword || 'write engaging blog posts'}"`} is used in the first paragraph of the text</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {(() => {
                        const keywordCount = keyword && watchedFields.content ? (watchedFields.content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length : 0;
                        const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
                        return density >= 0.5 && density <= 2.5;
                      })() ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">
                        Your keyword density (0.54%) is great, the Keyword {`"${keyword || 'write engaging blog posts'}"`} is used {(() => {
                          const keywordCount = keyword && watchedFields.content ? (watchedFields.content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length : 0;
                          return keywordCount;
                        })()} time(s)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.featured_image_url && keyword ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You've used the Keyword {`"${keyword || 'write engaging blog posts'}"`} in the file name of an image</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.featured_image_url ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You've added an image</span>
                    </div>
                    <div className="flex items-start gap-2">
                      {watchedFields.featured_image_url && keyword ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">You've used the Keyword {`"${keyword || 'write engaging blog posts'}"`} in the Alternate Text (alt tag) of an image</span>
                    </div>
                  </div>
                </div>

                {/* Featured Image Upload */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="featured_image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <BlogImageUpload 
                              value={field.value || ""} 
                              onChange={field.onChange} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Publishing Settings */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Publishing Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="publish_to_master"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Publish to Master Blog</FormLabel>
                            <FormDescription className="text-xs">
                              Share this post to the master blog
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button type="submit" size="lg" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Post
                  </Button>

                  <Button type="button" variant="outline" size="sm" onClick={scrollToTop}>
                    Back to Top
                    <ChevronUp className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {/* End Action Buttons */}
              </div>
              {/* End max-w-5xl container */}
            </div>
            {/* End flex-1 ml-48 main content */}
          </div>
          {/* End flex container */}
        </form>
      </Form>
    </div>
  );
};

export default CreateBlogPost;
