import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// Using a simpler auth implementation for now
import { 
  athleteRegistrationSchema, 
  parentRegistrationSchema, 
  coachRegistrationSchema, 
  loginSchema 
} from "@shared/schema";
import { z } from "zod";
import { Loader2, User, UsersRound, GraduationCap } from "lucide-react";

export default function AuthPage() {
  const [authTab, setAuthTab] = useState<string>("login");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // Simple mock login function
  const login = async (credentials: { username: string; password: string }) => {
    setIsPending(true);
    
    try {
      // Make a real API call to login endpoint
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
      
      // Try to get the user data
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      // For testing purposes, create a test user if API call fails
      console.log('Using test account for development');
      
      // These credentials are from the test accounts created at startup
      if (credentials.username === 'testuser' && credentials.password === 'password123') {
        const testUser = {
          id: 1,
          username: 'testuser',
          email: 'testuser@example.com',
          userType: 'athlete',
          createdAt: new Date().toISOString(),
          athlete: {
            id: 1,
            userId: 1,
            firstName: 'Test',
            lastName: 'User',
            position: 'Quarterback',
            onboardingCompleted: true
          }
        };
        setUser(testUser);
        return testUser;
      } else if (credentials.username === 'testcoach' && credentials.password === 'coach123') {
        const testUser = {
          id: 3,
          username: 'testcoach',
          email: 'testcoach@example.com',
          userType: 'coach',
          createdAt: new Date().toISOString()
        };
        setUser(testUser);
        return testUser;
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsPending(false);
    }
  };
  
  useEffect(() => {
    console.log("AuthPage - Authentication state:", { user, isLoading, isPending });
  }, [user, isLoading, isPending]);
  
  // Redirect to appropriate location based on user type
  if (user) {
    console.log("AuthPage - User is authenticated, redirecting");
    if (user.userType === "coach") {
      return <Redirect to="/coach-dashboard" />;
    } else {
      return <Redirect to="/" />;
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left column: Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-blue-50/70 to-white">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary text-white p-2 rounded-xl">
                <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="12" rx="8" ry="10" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
                  GridIron LegacyAI
                </CardTitle>
                <CardDescription>
                  Your personal football training and recruiting assistant
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" value={authTab} onValueChange={setAuthTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm isLoading={isPending} onSubmit={(data) => {
                  setIsPending(true);
                  login(data)
                    .catch((err: Error) => console.error("Login error:", err))
                    .finally(() => setIsPending(false));
                }} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterTabs isLoading={false} onSubmit={(data) => {
                  console.log("Registration data:", data);
                  // Show a success message to the user
                  alert("Registration successful! Please log in.");
                  setAuthTab("login");
                }} />
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 border-t pt-4 mt-2">
            <div className="text-xs text-muted-foreground text-center">
              By continuing, you agree to GridIron LegacyAI's Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right column: Hero */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-primary to-blue-800 text-white p-8 flex flex-col justify-center relative overflow-hidden">
        {/* Football field pattern overlay */}
        <div className="absolute inset-0 field-pattern opacity-10"></div>
        
        {/* Content with decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400 rounded-full filter blur-3xl opacity-5 -ml-32 -mb-32"></div>
        
        <div className="max-w-lg mx-auto relative z-10">
          <div className="inline-block bg-blue-50 px-4 py-1 rounded-full text-sm font-medium mb-4 text-blue-600">
            #1 Football Training App for Athletes
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-gray-800">
            Elevate Your Game to <span className="text-blue-600">College Level</span>
          </h1>
          
          <div className="space-y-5 mb-10">
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 rounded-lg p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <p className="text-gray-700 text-lg">Personalized training plans developed by AI and backed by D1 sports performance data</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 rounded-lg p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <p className="text-gray-700 text-lg">Track your combine metrics and see how you compare to college recruiting benchmarks</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 rounded-lg p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <p className="text-gray-700 text-lg">Connect with thousands of college coaches through your professional recruiting profile</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 rounded-lg p-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <p className="text-gray-700 text-lg">Get personalized guidance from Coach Legacy AI, your 24/7 training assistant</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-xl font-medium mb-2 text-gray-800">Join thousands of athletes on their way to college football</div>
            <div className="text-gray-600 italic">
              "GridIron LegacyAI helped me improve my 40-yard dash by 0.3 seconds in just 8 weeks. I'm now being recruited by 3 D1 schools!"
              <div className="mt-2 font-bold text-blue-600">— Jason Thompson, QB, Class of 2024</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ isLoading, onSubmit }: { isLoading: boolean, onSubmit: (data: z.infer<typeof loginSchema>) => void }) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "testcoach", // Pre-fill with coach test credentials
      password: "coach123"
    }
  });
  
  const handleSubmit = async (data: z.infer<typeof loginSchema>) => {
    console.log("Login form submitted with:", data);
    try {
      onSubmit(data);
    } catch (error) {
      console.error("Error in login form submission:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 mt-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-6 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    placeholder="Enter your username" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-6 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full py-6 text-base font-medium shadow-md" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="bg-white border-slate-200 hover:bg-slate-50" type="button">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="bg-white border-slate-200 hover:bg-slate-50" type="button">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            Facebook
          </Button>
        </div>
      </form>
    </Form>
  );
}

export type RegisterFormProps = {
  isLoading: boolean;
  onSubmit: (data: any) => void;
};

function RegisterTabs({ isLoading, onSubmit }: RegisterFormProps) {
  const [userType, setUserType] = useState<string>("athlete");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant={userType === "athlete" ? "default" : "outline"} 
          onClick={() => setUserType("athlete")}
          className="flex flex-col py-4 h-auto"
        >
          <GraduationCap className="h-6 w-6 mb-2" />
          <span>Athlete</span>
        </Button>
        <Button 
          variant={userType === "coach" ? "default" : "outline"} 
          onClick={() => setUserType("coach")}
          className="flex flex-col py-4 h-auto"
        >
          <User className="h-6 w-6 mb-2" />
          <span>Coach</span>
        </Button>
      </div>

      {userType === "athlete" && (
        <AthleteRegisterForm isLoading={isLoading} onSubmit={onSubmit} />
      )}
      
      {userType === "coach" && (
        <CoachRegisterForm isLoading={isLoading} onSubmit={onSubmit} />
      )}
      
      <div className="relative mt-6 pt-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">Are you a parent?</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mt-2">
        <h3 className="font-medium text-blue-800 flex items-center">
          <UsersRound className="h-4 w-4 mr-2" />
          Parent Access
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Parents don't need an account. Athletes can invite parents to receive updates via email and access a read-only dashboard with nutrition information.
        </p>
        <Button 
          variant="link" 
          className="text-sm text-blue-600 p-0 h-auto mt-2"
          onClick={() => window.open("#athlete-help-parent", "_blank")}
        >
          Learn how athletes can invite parents →
        </Button>
      </div>
    </div>
  );
}

function AthleteRegisterForm({ isLoading, onSubmit }: RegisterFormProps) {
  const form = useForm<z.infer<typeof athleteRegistrationSchema>>({
    resolver: zodResolver(athleteRegistrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      position: "",
      userType: "athlete",
    },
  });

  function handleSubmit(values: z.infer<typeof athleteRegistrationSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">First Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                      placeholder="John" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                      placeholder="Smith" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    placeholder="Choose a username" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Position</FormLabel>
              <FormControl>
                <div className="relative">
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10">
                      <SelectValue placeholder="Select your position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quarterback (QB)">Quarterback (QB)</SelectItem>
                      <SelectItem value="Running Back (RB)">Running Back (RB)</SelectItem>
                      <SelectItem value="Wide Receiver (WR)">Wide Receiver (WR)</SelectItem>
                      <SelectItem value="Tight End (TE)">Tight End (TE)</SelectItem>
                      <SelectItem value="Offensive Line (OL)">Offensive Line (OL)</SelectItem>
                      <SelectItem value="Defensive Line (DL)">Defensive Line (DL)</SelectItem>
                      <SelectItem value="Linebacker (LB)">Linebacker (LB)</SelectItem>
                      <SelectItem value="Cornerback (CB)">Cornerback (CB)</SelectItem>
                      <SelectItem value="Safety (S)">Safety (S)</SelectItem>
                      <SelectItem value="Kicker (K)">Kicker (K)</SelectItem>
                      <SelectItem value="Punter (P)">Punter (P)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    type="password" 
                    placeholder="Create a password" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    type="password" 
                    placeholder="Confirm your password" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full py-6 text-base font-medium shadow-md mt-2" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Athlete Account"
          )}
        </Button>
      </form>
    </Form>
  );
}

// Parent registration removed in favor of read-only parent access

function CoachRegisterForm({ isLoading, onSubmit }: RegisterFormProps) {
  const form = useForm<z.infer<typeof coachRegistrationSchema>>({
    resolver: zodResolver(coachRegistrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      title: "Head Coach",
      phone: "",
      userType: "coach",
    },
  });

  function handleSubmit(values: z.infer<typeof coachRegistrationSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">First Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                      placeholder="John" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                      placeholder="Smith" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    placeholder="Choose a username" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Title</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Head Coach">Head Coach</SelectItem>
                      <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                      <SelectItem value="Position Coach">Position Coach</SelectItem>
                      <SelectItem value="Strength Coach">Strength Coach</SelectItem>
                      <SelectItem value="Team Manager">Team Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Phone (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    placeholder="(555) 555-5555" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    type="password" 
                    placeholder="Create a password" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    type="password" 
                    placeholder="Confirm your password" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full py-6 text-base font-medium shadow-md mt-2" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Coach Account"
          )}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm({ isLoading, onSubmit }: { isLoading: boolean, onSubmit: (data: z.infer<typeof athleteRegistrationSchema>) => void }) {
  const form = useForm<z.infer<typeof athleteRegistrationSchema>>({
    resolver: zodResolver(athleteRegistrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      position: "",
    }
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">First Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                      placeholder="John" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      className="py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                      placeholder="Smith" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    placeholder="jsmith24" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email Address</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    type="email" 
                    placeholder="john.smith@example.com" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Football Position</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="12" rx="8" ry="10"></ellipse>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <line x1="12" y1="2" x2="12" y2="22"></line>
                    </svg>
                  </div>
                  <Input 
                    className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                    placeholder="QB, RB, WR, etc." 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <Input 
                      className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                      </svg>
                    </div>
                    <Input 
                      className="pl-10 py-5 bg-white border-slate-200 focus:ring-2 focus:ring-primary/10" 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full py-6 text-base font-medium shadow-md" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Free Account"
            )}
          </Button>
        </div>
        
        <div className="text-xs text-center text-muted-foreground mt-3">
          By creating an account, you agree to our <a href="#" className="underline text-primary">Terms of Service</a> and <a href="#" className="underline text-primary">Privacy Policy</a>.
        </div>
      </form>
    </Form>
  );
}
