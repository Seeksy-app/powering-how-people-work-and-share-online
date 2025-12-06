import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Chrome, CheckCircle, ExternalLink, Sparkles, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

interface ChromeExtensionDownloadProps {
  signatures: any[];
  apiKey: string | null;
}

// Chrome Web Store listing URL (placeholder for when published)
const CHROME_STORE_URL = ""; // Will be set after publishing

export function ChromeExtensionDownload({ signatures, apiKey }: ChromeExtensionDownloadProps) {
  const { toast } = useToast();
  const [selectedSignature, setSelectedSignature] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const [installMethod, setInstallMethod] = useState<"store" | "developer">("store");

  const activeSignatures = signatures.filter(s => s.is_active);
  const selectedSig = signatures.find(s => s.id === selectedSignature);
  const isStorePublished = Boolean(CHROME_STORE_URL);

  const generateExtensionFiles = () => {
    const manifest = {
      manifest_version: 3,
      name: "Seeksy Email Signatures",
      version: "1.0.0",
      description: "Inject Seeksy smart signatures into Gmail with open & click tracking. Auto-insert your branded signature with analytics.",
      permissions: ["activeTab", "storage"],
      host_permissions: ["https://mail.google.com/*"],
      content_scripts: [
        {
          matches: ["https://mail.google.com/*"],
          js: ["content.js"],
          css: ["styles.css"],
          run_at: "document_idle"
        }
      ],
      icons: {
        "16": "icon16.png",
        "48": "icon48.png",
        "128": "icon128.png"
      },
      action: {
        default_popup: "popup.html",
        default_icon: {
          "16": "icon16.png",
          "48": "icon48.png"
        }
      },
      // For Chrome Web Store
      key: undefined,
      offline_enabled: true,
      short_name: "Seeksy Sigs"
    };

    const contentScript = `
// Seeksy Email Signature Injector for Gmail
(function() {
  'use strict';
  
  const SEEKSY_CONFIG = {
    apiKey: '${apiKey || ""}',
    signatureId: '${selectedSignature}',
    baseUrl: 'https://taxqcioheqdqtlmjeaht.supabase.co/functions/v1'
  };

  // Signature HTML (pre-generated with tracking)
  const SIGNATURE_HTML = ${JSON.stringify(generateSignatureHtml(selectedSig))};

  let injectionEnabled = true;
  let lastInjectedCompose = null;

  // Watch for Gmail compose windows
  function observeGmail() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            checkForComposeWindow(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function checkForComposeWindow(node) {
    // Look for Gmail compose containers
    const composeBox = node.querySelector ? 
      node.querySelector('[role="dialog"] [contenteditable="true"][aria-label*="Message"]') ||
      node.querySelector('.Am.Al.editable') :
      null;
    
    if (composeBox && composeBox !== lastInjectedCompose && injectionEnabled) {
      injectSignature(composeBox);
      lastInjectedCompose = composeBox;
    }
  }

  function injectSignature(composeBox) {
    // Check if signature already exists
    if (composeBox.querySelector('.seeksy-signature')) {
      return;
    }

    // Create signature wrapper
    const signatureWrapper = document.createElement('div');
    signatureWrapper.className = 'seeksy-signature';
    signatureWrapper.innerHTML = '<br><br>--<br>' + SIGNATURE_HTML;
    
    // Insert at the end of the compose area
    composeBox.appendChild(signatureWrapper);
    
    console.log('[Seeksy] Signature injected');
  }

  // Initialize
  function init() {
    console.log('[Seeksy] Extension initialized');
    observeGmail();
    
    // Also check existing compose windows
    document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
      if (el.getAttribute('aria-label')?.includes('Message')) {
        injectSignature(el);
      }
    });
  }

  // Wait for Gmail to fully load
  if (document.readyState === 'complete') {
    setTimeout(init, 1000);
  } else {
    window.addEventListener('load', () => setTimeout(init, 1000));
  }
})();
`;

    const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      width: 320px;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      background: #fafafa;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e5e5;
    }
    .logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #000;
      font-size: 18px;
    }
    h1 {
      font-size: 18px;
      margin: 0;
      color: #18181b;
    }
    .subtitle {
      font-size: 12px;
      color: #71717a;
      margin-top: 2px;
    }
    .status {
      padding: 16px;
      background: #fff;
      border-radius: 12px;
      margin-bottom: 16px;
      border: 1px solid #e5e5e5;
    }
    .status.active {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .status-icon {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #16a34a;
      font-size: 13px;
      margin-bottom: 8px;
    }
    .signature-name {
      font-weight: 600;
      font-size: 15px;
      color: #18181b;
    }
    .toggle-btn {
      width: 100%;
      padding: 12px;
      background: #18181b;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .toggle-btn:hover {
      background: #27272a;
    }
    .toggle-btn.disabled {
      background: #e11d48;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #71717a;
    }
    .footer a {
      color: #f59e0b;
      text-decoration: none;
    }
    .tracking-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #fef3c7;
      color: #92400e;
      font-size: 11px;
      border-radius: 4px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">S</div>
    <div>
      <h1>Seeksy Signatures</h1>
      <div class="subtitle">Gmail Auto-Injector</div>
    </div>
  </div>
  
  <div class="status active" id="statusBox">
    <div class="status-icon">
      <span>✓</span> Active Signature
    </div>
    <div class="signature-name">${selectedSig?.name || "No signature selected"}</div>
    <div class="tracking-badge">📊 Tracking enabled</div>
  </div>
  
  <button class="toggle-btn" id="toggleBtn">Disable Auto-Inject</button>
  
  <div class="footer">
    Opens & clicks logged in <a href="https://seeksy.io/signatures" target="_blank">Seeksy Dashboard</a>
  </div>

  <script>
    let enabled = true;
    const btn = document.getElementById('toggleBtn');
    const statusBox = document.getElementById('statusBox');
    
    chrome.storage.local.get(['enabled'], (result) => {
      enabled = result.enabled !== false;
      updateUI();
    });
    
    btn.addEventListener('click', () => {
      enabled = !enabled;
      chrome.storage.local.set({ enabled });
      updateUI();
    });
    
    function updateUI() {
      if (enabled) {
        btn.textContent = 'Disable Auto-Inject';
        btn.classList.remove('disabled');
        statusBox.classList.add('active');
      } else {
        btn.textContent = 'Enable Auto-Inject';
        btn.classList.add('disabled');
        statusBox.classList.remove('active');
      }
    }
  </script>
</body>
</html>`;

    const styles = `
.seeksy-signature {
  margin-top: 16px;
  padding-top: 8px;
}
.seeksy-signature img {
  max-width: 100%;
  height: auto;
}
.seeksy-signature a {
  color: inherit;
  text-decoration: none;
}
`;

    return { manifest, contentScript, popupHtml, styles };
  };

  const generateSignatureHtml = (sig: any): string => {
    if (!sig) return "";
    
    const baseUrl = "https://taxqcioheqdqtlmjeaht.supabase.co/functions/v1";
    const trackingPixelUrl = `${baseUrl}/signature-tracking-pixel/${sig.id}.png`;
    const clickTrackingBase = `${baseUrl}/signature-click-tracking/${sig.id}`;

    let html = `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${sig.font_family || "Arial, sans-serif"}; font-size: 14px; color: ${sig.primary_color || "#000000"};">`;

    if (sig.quote_text) {
      html += `<tr><td style="padding-bottom: 12px; font-style: italic; color: ${sig.secondary_color || "#666666"};">"${sig.quote_text}"</td></tr>`;
    }

    if (sig.profile_name || sig.profile_title) {
      html += `<tr><td style="padding-bottom: 8px;"><table cellpadding="0" cellspacing="0" border="0"><tr>`;
      if (sig.profile_photo_url) {
        html += `<td style="padding-right: 12px; vertical-align: top;"><img src="${sig.profile_photo_url}" alt="${sig.profile_name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" /></td>`;
      }
      html += `<td style="vertical-align: middle;">`;
      if (sig.profile_name) html += `<div style="font-weight: bold; font-size: 16px;">${sig.profile_name}</div>`;
      if (sig.profile_title) html += `<div style="color: ${sig.secondary_color || "#666666"};">${sig.profile_title}</div>`;
      html += `</td></tr></table></td></tr>`;
    }

    if (sig.company_name || sig.company_phone || sig.company_website) {
      html += `<tr><td style="padding-bottom: 8px; color: ${sig.secondary_color || "#666666"};">`;
      if (sig.company_name) html += `<div style="font-weight: 600;">${sig.company_name}</div>`;
      if (sig.company_phone) html += `<div>${sig.company_phone}</div>`;
      if (sig.company_website) {
        const trackUrl = `${clickTrackingBase}/website?url=${encodeURIComponent(sig.company_website)}`;
        const cleanUrl = sig.company_website.replace(/^https?:\/\//, "");
        html += `<div><a href="${trackUrl}" style="color: ${sig.link_color || "#0066cc"}; text-decoration: none;">${cleanUrl}</a></div>`;
      }
      if (sig.company_address) html += `<div style="font-size: 12px;">${sig.company_address}</div>`;
      html += `</td></tr>`;
    }

    const socialLinks = Object.entries(sig.social_links || {}).filter(([_, url]) => url);
    if (socialLinks.length > 0) {
      html += `<tr><td style="padding: 8px 0;">`;
      for (const [platform, url] of socialLinks) {
        const trackUrl = `${clickTrackingBase}/social/${platform}?url=${encodeURIComponent(url as string)}`;
        const icon = getSocialEmoji(platform);
        html += `<a href="${trackUrl}" style="margin-right: 8px; text-decoration: none;">${icon}</a>`;
      }
      html += `</td></tr>`;
    }

    if (sig.banner_image_url) {
      const bannerTrackUrl = sig.banner_cta_url 
        ? `${clickTrackingBase}/banner?url=${encodeURIComponent(sig.banner_cta_url)}`
        : null;
      html += `<tr><td style="padding-top: 12px;">`;
      if (bannerTrackUrl) html += `<a href="${bannerTrackUrl}" target="_blank">`;
      html += `<img src="${sig.banner_image_url}" alt="${sig.banner_alt_text || "Banner"}" style="max-width: 600px; width: 100%; height: auto; display: block;" />`;
      if (bannerTrackUrl) html += `</a>`;
      html += `</td></tr>`;
    }

    html += `<tr><td><img src="${trackingPixelUrl}" width="1" height="1" style="display: block;" alt="" /></td></tr>`;
    html += `</table>`;
    
    return html;
  };

  const getSocialEmoji = (platform: string): string => {
    const icons: Record<string, string> = {
      facebook: "📘",
      twitter: "🐦",
      instagram: "📷",
      linkedin: "💼",
      youtube: "🎬",
      tiktok: "🎵",
      pinterest: "📌",
    };
    return icons[platform] || "🔗";
  };

  // Generate proper PNG icons as base64
  const generateIconPng = (size: number): Uint8Array => {
    // Create a simple PNG with a yellow "S" logo
    // This is a minimal valid PNG structure
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new Uint8Array();
    
    // Yellow gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradient;
    
    // Rounded rectangle
    const radius = size / 6;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    
    // "S" text
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', size / 2, size / 2 + size * 0.05);
    
    // Convert to blob
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const handleDownload = async () => {
    if (!selectedSignature) {
      toast({
        title: "Select a signature",
        description: "Please select a signature to include in the extension.",
        variant: "destructive"
      });
      return;
    }

    setDownloading(true);
    try {
      const { manifest, contentScript, popupHtml, styles } = generateExtensionFiles();
      
      const zip = new JSZip();
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("content.js", contentScript);
      zip.file("popup.html", popupHtml);
      zip.file("styles.css", styles);
      
      // Generate proper PNG icons
      zip.file("icon16.png", generateIconPng(16));
      zip.file("icon48.png", generateIconPng(48));
      zip.file("icon128.png", generateIconPng(128));

      const content = await zip.generateAsync({ type: "blob" });
      
      // Download
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seeksy-signatures-extension.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Extension downloaded!",
        description: "Follow the installation steps below."
      });
    } catch (error) {
      console.error("Error generating extension:", error);
      toast({
        title: "Download failed",
        description: "Could not generate extension ZIP.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Chrome className="h-5 w-5" />
          Chrome Extension
        </CardTitle>
        <CardDescription>
          Auto-inject your signature into Gmail with open & click tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={installMethod} onValueChange={(v) => setInstallMethod(v as "store" | "developer")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="store" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Easy Install
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-2">
              <Package className="h-4 w-4" />
              Developer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-4 mt-4">
            {isStorePublished ? (
              <>
                <Button 
                  asChild
                  className="w-full gap-2"
                >
                  <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer">
                    <Chrome className="h-4 w-4" />
                    Install from Chrome Web Store
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>One-click install • No developer mode required</span>
                </div>
              </>
            ) : (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <p className="font-medium">Coming Soon to Chrome Web Store</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The extension is being submitted for review. Once approved, you'll be able to install with one click—no developer mode needed.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    For now, use the <strong>Developer</strong> tab to install manually.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="developer" className="space-y-4 mt-4">
            {!apiKey && (
              <Alert>
                <AlertDescription>
                  Generate an API key in Settings to enable the extension.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Signature</label>
              <Select value={selectedSignature} onValueChange={setSelectedSignature}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a signature..." />
                </SelectTrigger>
                <SelectContent>
                  {signatures.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.is_active && <Badge variant="secondary" className="ml-2">Active</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleDownload} 
              disabled={!selectedSignature || downloading}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Generating..." : "Download Extension ZIP"}
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <p className="font-medium">Installation Steps:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Download and <strong>unzip</strong> the extension folder</li>
                <li>
                  Open Chrome and go to{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">chrome://extensions</code>
                </li>
                <li>
                  Enable <strong>"Developer mode"</strong> toggle (top right corner)
                </li>
                <li>
                  Click <strong>"Load unpacked"</strong> and select the unzipped folder
                </li>
                <li>
                  Open <strong>Gmail</strong> → compose a new email → signature auto-injects!
                </li>
              </ol>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> After installing, click the extension icon in your toolbar to toggle injection on/off.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Tracking pixel + click tracking included</span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}