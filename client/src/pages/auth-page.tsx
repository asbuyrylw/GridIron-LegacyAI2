import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { athleteRegistrationSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [authTab, setAuthTab] = useState<string>("login");
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  
  // Redirect to home if already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left column: Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="12" rx="8" ry="10" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="12" y1="2" x2="12" y2="22" />
              </svg>
              <CardTitle className="text-2xl font-montserrat font-bold text-primary">GridIron LegacyAI</CardTitle>
            </div>
            <CardDescription>
              Your personal football training and recruiting assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={authTab} onValueChange={setAuthTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm isLoading={loginMutation.isPending} onSubmit={loginMutation.mutate} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm isLoading={registerMutation.isPending} onSubmit={registerMutation.mutate} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground text-center">
              By continuing, you agree to GridIron LegacyAI's Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right column: Hero */}
      <div className="w-full md:w-1/2 bg-primary text-white p-8 flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">
            Elevate Your Game to College Level
          </h1>
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-2">
              <div className="bg-white text-primary rounded-full h-6 w-6 flex items-center justify-center mt-0.5">✓</div>
              <p>Personalized training plans developed by AI and backed by D1 sports performance data</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-white text-primary rounded-full h-6 w-6 flex items-center justify-center mt-0.5">✓</div>
              <p>Track your combine metrics and see how you compare to college recruiting benchmarks</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-white text-primary rounded-full h-6 w-6 flex items-center justify-center mt-0.5">✓</div>
              <p>Connect with thousands of college coaches through your personal recruiting profile</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-white text-primary rounded-full h-6 w-6 flex items-center justify-center mt-0.5">✓</div>
              <p>Get personalized guidance from Coach Legacy AI, your 24/7 training assistant</p>
            </div>
          </div>
          <div className="text-lg font-medium mb-2">Join thousands of athletes already on their way to college football</div>
          <div className="text-sm opacity-80">
            "GridIron LegacyAI helped me improve my 40-yard dash by 0.3 seconds in just 8 weeks. I'm now being recruited by 3 D1 schools!" - Jason T., QB, Class of 2024
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
      username: "",
      password: ""
    }
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Sign In"
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
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
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Smith" {...field} />
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
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="jsmith24" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.smith@example.com" {...field} />
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
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input placeholder="QB, RB, WR, etc." {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}
