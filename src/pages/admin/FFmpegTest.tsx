import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface TestResult {
  ffmpegAvailable: boolean;
  testVideoProcessed: boolean;
  verdict: string;
  log: string[];
  errorDetails: string | null;
  recommendation: string;
}

export default function FFmpegTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("test-ffmpeg", {
        body: {},
      });

      if (error) throw error;

      setResult(data as TestResult);
    } catch (error) {
      console.error("Test error:", error);
      setResult({
        ffmpegAvailable: false,
        testVideoProcessed: false,
        verdict: "ERROR",
        log: [`Error running test: ${error}`],
        errorDetails: String(error),
        recommendation: "Use Cloudflare Stream API as alternative",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getVerdictIcon = () => {
    if (!result) return null;
    
    if (result.verdict === "FULLY_WORKING") {
      return <CheckCircle2 className="h-8 w-8 text-green-500" />;
    } else if (result.verdict === "COMMAND_EXISTS_BUT_PROCESSING_FAILED") {
      return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getVerdictMessage = () => {
    if (!result) return null;
    
    if (result.verdict === "FULLY_WORKING") {
      return (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-900">
            <strong>FFmpeg is FULLY WORKING</strong> in Supabase Edge Functions runtime. 
            Video processing is fully supported and can be used for clip generation.
          </AlertDescription>
        </Alert>
      );
    } else if (result.verdict === "COMMAND_EXISTS_BUT_PROCESSING_FAILED") {
      return (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertDescription className="text-yellow-900">
            <strong>FFmpeg command exists</strong> but video processing failed. 
            This may indicate missing codecs or permission issues.
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-900">
            <strong>FFmpeg is NOT AVAILABLE</strong> in Supabase Edge Functions runtime. 
            An alternative solution is required for video processing.
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            FFmpeg Availability Test
          </CardTitle>
          <CardDescription>
            This test explicitly checks if FFmpeg is available in the Supabase Edge Functions 
            runtime and whether it can process video files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={runTest} 
            disabled={isRunning}
            size="lg"
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Test...
              </>
            ) : (
              "Run FFmpeg Test"
            )}
          </Button>

          {result && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {getVerdictIcon()}
                <div className="flex-1">
                  {getVerdictMessage()}
                </div>
              </div>

              <Card className="border-muted">
                <CardHeader>
                  <CardTitle className="text-lg">Test Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">FFmpeg Command</div>
                      <div className="text-lg font-semibold">
                        {result.ffmpegAvailable ? (
                          <span className="text-green-600">✓ Available</span>
                        ) : (
                          <span className="text-red-600">✗ Not Found</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Video Processing</div>
                      <div className="text-lg font-semibold">
                        {result.testVideoProcessed ? (
                          <span className="text-green-600">✓ Working</span>
                        ) : (
                          <span className="text-red-600">✗ Failed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Recommendation</div>
                    <div className="text-sm bg-muted p-3 rounded">
                      {result.recommendation}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted">
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-black text-green-400 p-4 rounded overflow-auto max-h-96 font-mono">
                    {result.log.join('\n')}
                  </pre>
                </CardContent>
              </Card>

              {result.errorDetails && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Error Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-red-50 text-red-900 p-4 rounded overflow-auto max-h-48 font-mono">
                      {result.errorDetails}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
