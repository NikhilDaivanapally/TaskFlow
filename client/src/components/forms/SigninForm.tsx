import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSigninMutation } from "../../store/api/authApi";
import { useAppDispatch } from "../../hooks/useReducer";
import { setUser } from "../../store/slices/authSlice";
import { toast } from "sonner";

// validation Schema
const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .nonempty("Password is required"),
});

type FormData = z.infer<typeof formSchema>;

const SigninForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signin, { data, isSuccess, isError, error, isLoading }] =
    useSigninMutation();

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  // Handle successful login
  useEffect(() => {
    if (isSuccess && data) {
      console.log(data, "data");
      dispatch(setUser(data.data?.user));
      toast.success(data?.message);
      navigate("/dashboard");
    }
  }, [isSuccess, data]);

  // Handle error responses from API
  useEffect(() => {
    if (isError && error && typeof error === "object" && "data" in error) {
      const apiError = (error as any).data?.message || "Login failed";
      setError("root", { type: "manual", message: apiError });
    }
  }, [isError, error, setError]);

  // Submit handler
  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    await signin(formData).unwrap();
  };

  return (
    <section className="w-full max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Sign In</h1>

      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm text-red-500 text-center">
                {errors.root.message}
              </p>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default SigninForm;
