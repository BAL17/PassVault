"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash,
  Lock,
  ExternalLink,
  Star,
  User,
  LogIn,
  FileText,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { toast } from "~/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar";

// Mock data for password entries
const initialPasswords = [
  {
    id: 1,
    type: "login",
    website: "google.com",
    username: "user@example.com",
    password: "StrongP@ssw0rd123",
    lastUpdated: "2023-12-15",
    strength: "strong",
    notes: "Work account",
    favicon: "https://www.google.com/favicon.ico",
    favorite: true,
  },
  {
    id: 2,
    type: "login",
    website: "github.com",
    username: "devuser",
    password: "C0d3R3p0!2023",
    lastUpdated: "2023-11-20",
    strength: "strong",
    notes: "Personal projects",
    favicon: "https://github.com/favicon.ico",
    favorite: false,
  },
  {
    id: 3,
    type: "login",
    website: "twitter.com",
    username: "tweetuser",
    password: "TweetM3!",
    lastUpdated: "2023-10-05",
    strength: "medium",
    notes: "",
    favicon: "https://twitter.com/favicon.ico",
    favorite: true,
  },
  {
    id: 4,
    type: "login",
    website: "netflix.com",
    username: "moviefan",
    password: "N3tfl1xAndCh1ll",
    lastUpdated: "2023-09-12",
    strength: "medium",
    notes: "Shared with family",
    favicon: "https://netflix.com/favicon.ico",
    favorite: false,
  },
  {
    id: 5,
    type: "login",
    website: "amazon.com",
    username: "shopper123",
    password: "Sh0pp1ng!",
    lastUpdated: "2023-08-30",
    strength: "weak",
    notes: "Shopping account",
    favicon: "https://amazon.com/favicon.ico",
    favorite: false,
  },
  {
    id: 6,
    type: "note",
    title: "WiFi Password",
    content: "Home WiFi: NetworkName123 - Password: H0m3W1f1P@ss",
    lastUpdated: "2023-11-05",
    favorite: true,
  },
  {
    id: 7,
    type: "note",
    title: "Credit Card PIN",
    content: "Main credit card PIN: 1234",
    lastUpdated: "2023-10-22",
    favorite: true,
  },
  {
    id: 8,
    type: "note",
    title: "Server Access",
    content: "SSH Key Password: s3rv3rK3yP@ss\nIP: 192.168.1.100",
    lastUpdated: "2023-09-15",
    favorite: false,
  },
];

type PasswordEntry = {
  id: number;
  type: string;
  website?: string;
  username?: string;
  password?: string;
  title?: string;
  content?: string;
  lastUpdated: string;
  strength?: string;
  notes?: string;
  favicon?: string;
  favorite: boolean;
};

type Category = "all" | "favorites" | "logins" | "notes";




export default function HomePage() {
 const [passwords, setPasswords] = useState<PasswordEntry[]>(initialPasswords);
 const [searchQuery, setSearchQuery] = useState("");
 const [newPassword, setNewPassword] = useState({
   website: "",
   username: "",
   password: "",
   notes: "",
 });
 const [showPasswordId, setShowPasswordId] = useState<number | null>(null);
 const [isAddPasswordOpen, setIsAddPasswordOpen] = useState(false);
 const [activeCategory, setActiveCategory] = useState<Category>("all");

 // Filter passwords based on active category and search query
 const filteredPasswords = passwords.filter((entry) => {
   // First filter by category
   const categoryMatch =
     activeCategory === "all"
       ? true
       : activeCategory === "favorites"
         ? entry.favorite
         : activeCategory === "logins"
           ? entry.type === "login"
           : activeCategory === "notes"
             ? entry.type === "note"
             : true;

   // Then filter by search query
   const searchMatch =
     entry.type === "login"
       ? entry.website?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         entry.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         entry.notes?.toLowerCase().includes(searchQuery.toLowerCase())
       : entry.type === "note"
         ? entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           entry.content?.toLowerCase().includes(searchQuery.toLowerCase())
         : false;

   return categoryMatch && (searchQuery === "" || searchMatch);
 });

 const handleAddPassword = () => {
   if (!newPassword.website || !newPassword.username || !newPassword.password) {
     toast({
       title: "Missing information",
       description: "Please fill in all required fields",
       variant: "destructive",
     });
     return;
   }

   const passwordStrength = calculatePasswordStrength(newPassword.password);

   const newEntry: PasswordEntry = {
     id: passwords.length + 1,
     type: "login",
     website: newPassword.website,
     username: newPassword.username,
     password: newPassword.password,
     lastUpdated: new Date().toISOString().split("T")[0],
     strength: passwordStrength,
     notes: newPassword.notes,
     favicon: `https://${newPassword.website.replace(/^https?:\/\//, "").split("/")[0]}/favicon.ico`,
     favorite: false,
   };

   setPasswords([...passwords, newEntry]);
   setNewPassword({ website: "", username: "", password: "", notes: "" });
   setIsAddPasswordOpen(false);

   toast({
     title: "Password added",
     description: "Your new password has been saved securely",
   });
 };

 const handleDeletePassword = (id: number) => {
   setPasswords(passwords.filter((password) => password.id !== id));
   toast({
     title: "Password deleted",
     description: "The password has been removed from your vault",
   });
 };

 const toggleFavorite = (id: number) => {
   setPasswords(
     passwords.map((password) =>
       password.id === id
         ? { ...password, favorite: !password.favorite }
         : password,
     ),
   );
 };

 const copyToClipboard = (text: string, type: string) => {
   navigator.clipboard.writeText(text);
   toast({
     title: `${type} copied`,
     description: `The ${type.toLowerCase()} has been copied to your clipboard`,
   });
 };

 const togglePasswordVisibility = (id: number) => {
   if (showPasswordId === id) {
     setShowPasswordId(null);
   } else {
     setShowPasswordId(id);
   }
 };

 const calculatePasswordStrength = (
   password: string,
 ): "weak" | "medium" | "strong" => {
   if (password.length < 8) return "weak";

   const hasUppercase = /[A-Z]/.test(password);
   const hasLowercase = /[a-z]/.test(password);
   const hasNumbers = /[0-9]/.test(password);
   const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

   const score = [
     hasUppercase,
     hasLowercase,
     hasNumbers,
     hasSpecialChars,
   ].filter(Boolean).length;

   if (password.length >= 12 && score >= 3) return "strong";
   if (password.length >= 8 && score >= 2) return "medium";
   return "weak";
 };

 const getStrengthColor = (strength: string) => {
   switch (strength) {
     case "weak":
       return "bg-red-500";
     case "medium":
       return "bg-yellow-500";
     case "strong":
       return "bg-green-500";
     default:
       return "bg-gray-300";
   }
 };

 const getCategoryCount = (category: Category) => {
   switch (category) {
     case "all":
       return passwords.length;
     case "favorites":
       return passwords.filter((p) => p.favorite).length;
     case "logins":
       return passwords.filter((p) => p.type === "login").length;
     case "notes":
       return passwords.filter((p) => p.type === "note").length;
     default:
       return 0;
   }
 };

 return (
   <SidebarProvider>
     <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
       <Sidebar className="shrink-0 border-r">
         <SidebarHeader>
           <div className="flex items-center gap-3 px-4 py-2">
             <Avatar>
               <AvatarImage
                 src="/placeholder.svg?height=40&width=40"
                 alt="User"
               />
               <AvatarFallback>JD</AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
               <span className="font-medium">John Doe</span>
               <span className="text-xs text-muted-foreground">
                 john@example.com
               </span>
             </div>
           </div>
         </SidebarHeader>
         <SidebarContent>
           <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton
                 isActive={activeCategory === "all"}
                 onClick={() => setActiveCategory("all")}
               >
                 <Lock className="h-4 w-4" />
                 <span>All Items</span>
                 <Badge variant="outline" className="ml-auto">
                   {getCategoryCount("all")}
                 </Badge>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton
                 isActive={activeCategory === "favorites"}
                 onClick={() => setActiveCategory("favorites")}
               >
                 <Star className="h-4 w-4" />
                 <span>Favorites</span>
                 <Badge variant="outline" className="ml-auto">
                   {getCategoryCount("favorites")}
                 </Badge>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton
                 isActive={activeCategory === "logins"}
                 onClick={() => setActiveCategory("logins")}
               >
                 <LogIn className="h-4 w-4" />
                 <span>Logins</span>
                 <Badge variant="outline" className="ml-auto">
                   {getCategoryCount("logins")}
                 </Badge>
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton
                 isActive={activeCategory === "notes"}
                 onClick={() => setActiveCategory("notes")}
               >
                 <FileText className="h-4 w-4" />
                 <span>Secure Notes</span>
                 <Badge variant="outline" className="ml-auto">
                   {getCategoryCount("notes")}
                 </Badge>
               </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
         </SidebarContent>
         <SidebarFooter>
           <div className="p-4">
             <Button variant="outline" className="w-full">
               <User className="mr-2 h-4 w-4" />
               Account Settings
             </Button>
           </div>
         </SidebarFooter>
       </Sidebar>

       <main className="h-full w-full flex-1 overflow-auto">
         <div className="h-full w-full p-6">
           <div className="mb-6 flex w-full items-center justify-between">
             <div className="flex items-center gap-2">
               <SidebarTrigger className="mr-2 md:hidden" />
               <h1 className="text-2xl font-bold">
                 {activeCategory === "all" && "All Items"}
                 {activeCategory === "favorites" && "Favorites"}
                 {activeCategory === "logins" && "Logins"}
                 {activeCategory === "notes" && "Secure Notes"}
               </h1>
             </div>
             <Dialog
               open={isAddPasswordOpen}
               onOpenChange={setIsAddPasswordOpen}
               className="overflow-visible"
             >
               <DialogTrigger asChild>
                 <Button className="gap-2">
                   <Plus className="h-4 w-4" />
                   Add {activeCategory === "notes" ? "Note" : "Password"}
                 </Button>
               </DialogTrigger>
               <DialogContent className="max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
                   <DialogTitle>
                     Add New{" "}
                     {activeCategory === "notes" ? "Secure Note" : "Password"}
                   </DialogTitle>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                   {activeCategory !== "notes" && (
                     <>
                       <div className="grid gap-2">
                         <Label htmlFor="website">Website</Label>
                         <Input
                           id="website"
                           placeholder="example.com"
                           value={newPassword.website}
                           onChange={(e) =>
                             setNewPassword({
                               ...newPassword,
                               website: e.target.value,
                             })
                           }
                         />
                       </div>
                       <div className="grid gap-2">
                         <Label htmlFor="username">Username / Email</Label>
                         <Input
                           id="username"
                           placeholder="user@example.com"
                           value={newPassword.username}
                           onChange={(e) =>
                             setNewPassword({
                               ...newPassword,
                               username: e.target.value,
                             })
                           }
                         />
                       </div>
                       <div className="grid gap-2">
                         <Label htmlFor="password">Password</Label>
                         <Input
                           id="password"
                           type="password"
                           value={newPassword.password}
                           onChange={(e) =>
                             setNewPassword({
                               ...newPassword,
                               password: e.target.value,
                             })
                           }
                         />
                         {newPassword.password && (
                           <div className="mt-1">
                             <div className="mb-1 text-sm">
                               Password Strength:
                             </div>
                             <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                               <div
                                 className={`h-full ${getStrengthColor(calculatePasswordStrength(newPassword.password))}`}
                                 style={{
                                   width:
                                     calculatePasswordStrength(
                                       newPassword.password,
                                     ) === "weak"
                                       ? "33%"
                                       : calculatePasswordStrength(
                                             newPassword.password,
                                           ) === "medium"
                                         ? "66%"
                                         : "100%",
                                 }}
                               />
                             </div>
                             <div className="mt-1 text-xs capitalize">
                               {calculatePasswordStrength(newPassword.password)}
                             </div>
                           </div>
                         )}
                       </div>
                     </>
                   )}
                   <div className="grid gap-2">
                     <Label htmlFor="notes">
                       {activeCategory === "notes"
                         ? "Secure Note"
                         : "Notes (Optional)"}
                     </Label>
                     <Input
                       id="notes"
                       placeholder={
                         activeCategory === "notes"
                           ? "Enter your secure note"
                           : "Additional information"
                       }
                       value={newPassword.notes}
                       onChange={(e) =>
                         setNewPassword({
                           ...newPassword,
                           notes: e.target.value,
                         })
                       }
                     />
                   </div>
                 </div>
                 <div className="flex justify-end">
                   <Button onClick={handleAddPassword}>
                     Save {activeCategory === "notes" ? "Note" : "Password"}
                   </Button>
                 </div>
               </DialogContent>
             </Dialog>
           </div>

           <div className="relative mb-6 w-full">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
             <Input
               className="w-full pl-10"
               placeholder={`Search ${activeCategory}...`}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>

           <div className="grid w-full gap-4">
             {filteredPasswords.length === 0 ? (
               <Card className="w-full">
                 <CardContent className="py-10 text-center">
                   <p className="text-muted-foreground">
                     No items found. Add a new{" "}
                     {activeCategory === "notes" ? "note" : "password"} to get
                     started.
                   </p>
                 </CardContent>
               </Card>
             ) : (
               filteredPasswords.map((entry) => (
                 <Card key={entry.id} className="w-full overflow-hidden">
                   {entry.type === "login" ? (
                     // Login entry
                     <>
                       <CardHeader className="pb-2">
                         <div className="flex items-start justify-between">
                           <div className="flex items-center gap-3">
                             <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                               <img
                                 src={entry.favicon || "/placeholder.svg"}
                                 alt={entry.website}
                                 className="h-6 w-6"
                                 onError={(e) => {
                                   (e.target as HTMLImageElement).src =
                                     "/placeholder.svg?height=24&width=24";
                                 }}
                               />
                             </div>
                             <div>
                               <CardTitle className="flex items-center gap-2 text-lg">
                                 {entry.website}
                                 <a
                                   href={`https://${entry.website?.replace(/^https?:\/\//, "")}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-muted-foreground hover:text-primary"
                                 >
                                   <ExternalLink className="h-3 w-3" />
                                 </a>
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   className={`h-5 w-5 ${entry.favorite ? "text-yellow-500" : "text-muted-foreground"}`}
                                   onClick={() => toggleFavorite(entry.id)}
                                 >
                                   <Star className="h-4 w-4 fill-current" />
                                 </Button>
                               </CardTitle>
                               <CardDescription>
                                 Last updated: {entry.lastUpdated}
                               </CardDescription>
                             </div>
                           </div>
                           <Badge
                             className={`capitalize ${
                               entry.strength === "strong"
                                 ? "bg-green-100 text-green-800"
                                 : entry.strength === "medium"
                                   ? "bg-yellow-100 text-yellow-800"
                                   : "bg-red-100 text-red-800"
                             }`}
                           >
                             {entry.strength}
                           </Badge>
                         </div>
                       </CardHeader>
                       <CardContent className="pb-2">
                         <div className="grid gap-3">
                           <div className="flex items-center justify-between">
                             <div className="text-sm text-muted-foreground">
                               Username / Email
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="font-medium">
                                 {entry.username}
                               </div>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8"
                                 onClick={() =>
                                   copyToClipboard(
                                     entry.username || "",
                                     "Username",
                                   )
                                 }
                               >
                                 <Copy className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                           <div className="flex items-center justify-between">
                             <div className="text-sm text-muted-foreground">
                               Password
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="font-mono font-medium">
                                 {showPasswordId === entry.id
                                   ? entry.password
                                   : "••••••••••••"}
                               </div>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8"
                                 onClick={() =>
                                   togglePasswordVisibility(entry.id)
                                 }
                               >
                                 {showPasswordId === entry.id ? (
                                   <EyeOff className="h-4 w-4" />
                                 ) : (
                                   <Eye className="h-4 w-4" />
                                 )}
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8"
                                 onClick={() =>
                                   copyToClipboard(
                                     entry.password || "",
                                     "Password",
                                   )
                                 }
                               >
                                 <Copy className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                           {entry.notes && (
                             <div>
                               <div className="mb-1 text-sm text-muted-foreground">
                                 Notes
                               </div>
                               <div className="rounded bg-muted p-2 text-sm">
                                 {entry.notes}
                               </div>
                             </div>
                           )}
                         </div>
                       </CardContent>
                     </>
                   ) : (
                     // Secure note entry
                     <>
                       <CardHeader className="pb-2">
                         <div className="flex items-start justify-between">
                           <div className="flex items-center gap-3">
                             <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                               <FileText className="h-5 w-5 text-primary" />
                             </div>
                             <div>
                               <CardTitle className="flex items-center gap-2 text-lg">
                                 {entry.title}
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   className={`h-5 w-5 ${entry.favorite ? "text-yellow-500" : "text-muted-foreground"}`}
                                   onClick={() => toggleFavorite(entry.id)}
                                 >
                                   <Star className="h-4 w-4 fill-current" />
                                 </Button>
                               </CardTitle>
                               <CardDescription>
                                 Last updated: {entry.lastUpdated}
                               </CardDescription>
                             </div>
                           </div>
                           <Badge variant="outline">Note</Badge>
                         </div>
                       </CardHeader>
                       <CardContent className="pb-2">
                         <div className="grid gap-3">
                           <div className="whitespace-pre-line rounded bg-muted p-3 text-sm">
                             {entry.content}
                           </div>
                         </div>
                       </CardContent>
                     </>
                   )}
                   <CardFooter className="pt-2">
                     <Button
                       variant="ghost"
                       size="sm"
                       className="ml-auto text-red-500 hover:bg-red-50 hover:text-red-700"
                       onClick={() => handleDeletePassword(entry.id)}
                     >
                       <Trash className="mr-2 h-4 w-4" />
                       Delete
                     </Button>
                   </CardFooter>
                 </Card>
               ))
             )}
           </div>
         </div>
       </main>
     </div>
   </SidebarProvider>
 );
}
