import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailAccountManager } from "@/components/email/EmailAccountManager";
import { ContactListManager } from "@/components/email/ContactListManager";
import { Mail } from "lucide-react";

export default function EmailSettings() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          Email Settings
        </h1>
        <p className="text-muted-foreground">
          Manage email accounts, lists, and campaign settings
        </p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Email Accounts</TabsTrigger>
          <TabsTrigger value="lists">Contact Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <EmailAccountManager />
        </TabsContent>

        <TabsContent value="lists" className="space-y-4">
          <ContactListManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
