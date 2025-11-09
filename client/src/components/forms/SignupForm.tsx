import { useEffect, useState } from "react";
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
import { useSignupMutation } from "../../store/api/authApi";
import { useAppDispatch } from "../../hooks/useReducer";
import { setUser } from "../../store/slices/authSlice";

// Validation Schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profile: z
    .any()
    .refine(
      (file) => file instanceof FileList && file.length > 0,
      "Profile image is required"
    ),
});

type FormData = z.infer<typeof formSchema>;

const SignupForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [signup, { data, isLoading, isSuccess, isError, error }] =
    useSignupMutation();
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "", profile: undefined },
  });

  // handle image preview
  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // Cleanup preview URL 
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data?.data));
      reset();
      navigate("/dashboard");
    }
  }, [isSuccess, data, navigate, reset]);

  useEffect(() => {
    if (isError && error && typeof error === "object" && "data" in error) {
      const apiError = (error as any).data?.message || "Signup failed";
      setError("root", { type: "manual", message: apiError });
    }
  }, [isError, error, setError]);

  // handle Form submission
  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    const file = formData.profile?.[0];
    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("email", formData.email);
    formPayload.append("password", formData.password);
    if (file) formPayload.append("profile", file);

    await signup(formPayload).unwrap();
  };

  return (
    <section className="w-full max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Sign Up</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Profile Upload */}
            <div className="grid gap-2">
              <Label htmlFor="profile">Profile Picture</Label>
              <Input
                id="profile"
                type="file"
                accept="image/*"
                {...register("profile")}
                aria-invalid={!!errors.profile}
                onChange={(e) => {
                  handleImagePreview(e);
                  register("profile").onChange(e);
                }}
              />
              {errors.profile && (
                <p className="text-red-500 text-sm">
                  {(errors.profile as { message?: string })?.message}
                </p>
              )}
              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                </div>
              )}
            </div>

            {/* Root Error */}
            {errors.root && (
              <p className="text-center text-sm text-red-500">
                {errors.root.message}
              </p>
            )}

            {/* Submit */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default SignupForm;
