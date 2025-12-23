import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Chrome, 
  Settings2, 
  FolderOpen, 
  CheckCircle2,
  ExternalLink,
  Mail,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";

const steps = [
  {
    number: 1,
    title: "Download the Extension",
    description: "Click the button below to download the extension files as a ZIP.",
    icon: Download,
  },
  {
    number: 2,
    title: "Extract the ZIP",
    description: "Unzip the downloaded file to a folder on your computer (e.g., Desktop/trucking-extension).",
    icon: FolderOpen,
  },
  {
    number: 3,
    title: "Open Chrome Extensions",
    description: "Navigate to chrome://extensions in your browser or click Menu → More Tools → Extensions.",
    icon: Chrome,
  },
  {
    number: 4,
    title: "Enable Developer Mode",
    description: "Toggle the 'Developer mode' switch in the top-right corner of the Extensions page.",
    icon: Settings2,
  },
  {
    number: 5,
    title: "Load the Extension",
    description: "Click 'Load unpacked' and select the folder where you extracted the extension.",
    icon: CheckCircle2,
  },
];

export default function ExtensionInstallPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("chrome://extensions");
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Create a simple instruction since we can't bundle the extension dynamically
    toast.info("Extension download will be available soon. Contact support for manual installation.");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4 mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Email Tracking Extension</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Track your email communications with carriers directly from Gmail. 
            Automatically log emails to the right load and contact.
          </p>
          <Badge variant="secondary" className="mt-3">
            <Chrome className="h-3 w-3 mr-1" />
            Chrome Extension
          </Badge>
        </div>

        {/* Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">What You Get</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Auto-Link Emails</p>
                  <p className="text-xs text-muted-foreground">Emails linked to loads automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Contact Sync</p>
                  <p className="text-xs text-muted-foreground">Carrier info updated in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Activity Timeline</p>
                  <p className="text-xs text-muted-foreground">Full history in load details</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Installation Steps</CardTitle>
            <CardDescription>
              Follow these steps to install the extension in Developer Mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-px h-full bg-border mt-2 min-h-[20px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    
                    {/* Special content for step 3 */}
                    {step.number === 3 && (
                      <div className="mt-3 flex items-center gap-2">
                        <code className="px-3 py-1.5 bg-muted rounded text-sm font-mono">
                          chrome://extensions
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCopyUrl}
                          className="h-8"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Download Button */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Ready to Install?</h3>
                <p className="text-sm text-muted-foreground">
                  Download the extension package and follow the steps above.
                </p>
              </div>
              <Button size="lg" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download Extension
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-sm mb-1">Extension not appearing?</p>
              <p className="text-sm text-muted-foreground">
                Make sure Developer Mode is enabled and you selected the correct folder (the one containing manifest.json).
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-1">Errors during load?</p>
              <p className="text-sm text-muted-foreground">
                Check that all extension files were extracted properly. Try re-downloading the ZIP.
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-1">Need help?</p>
              <p className="text-sm text-muted-foreground">
                Contact support and we'll help you get set up.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
